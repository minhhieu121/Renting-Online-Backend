const sql = require('../db');
const { get } = require('../routes/userRoutes');

//Create cart
async function createCart(userId) {
    const newCart = await sql`
    INSERT INTO "Cart" (user_id)
    VALUES (${userId})
    RETURNING *
    `;
    return newCart[0];
}

//Retrieve cart by user ID
async function getOpenCartByUserId(userId) {
    const carts = await sql`
        SELECT * FROM "Cart"
        WHERE user_id = ${userId} AND status = 'open'
    `;
    return carts[0]; 
}

// Add item to cart
async function addItemToCart(cartId, productData, quantity, rentTime) {
    const { productId, name, unit_price, sale_percent } = productData;
    const finalPrice = unit_price * (1 - sale_percent / 100.0);
    const totalPrice = finalPrice * quantity * rentTime;
    const metadata = {
        product_name: name,
        images: productData.images
    }

    // Use transaction to ensure data integrity
    const new_item = await sql.begin(async sql => {
        
        const insertedItems = await sql`
            INSERT INTO "CartItem" (
                cart_id, product_id, unit_price, quantity,
                metadata, rent_time, total_price
            )
            VALUES (
                ${cartId}, ${productId}, ${finalPrice}, ${quantity},
                ${sql.json(metadata)}, ${rentTime}, ${totalPrice}
            )
            RETURNING *
        `;
        
        
        const item = insertedItems[0]; 

        
        await sql`
            UPDATE "Cart"
            SET
                updated_at = NOW(),
                total_amount = total_amount + ${item.total_price},
                total_quantity = total_quantity + ${item.quantity},
                "order" = "order" + 1
            WHERE
                id = ${cartId}
        `;
        return item;
    });
    return new_item;
}

// Delete cart item
async function deleteCartItem(cartItemId, cartId, cartItem) {

    await sql.begin(async sql => {
        await sql`
            DELETE FROM "CartItem"
            WHERE id = ${cartItemId} AND cart_id = ${cartId}
        `;
    
        await sql`
            UPDATE "Cart"
            SET
                updated_at = NOW(),
                total_amount = total_amount - ${cartItem.total_price},
                total_quantity = total_quantity - ${cartItem.quantity},
                "order" = "order" - 1
            WHERE
                id = ${cartId}
        `;
    })
}

// Get cart items
async function getCartItems(cartId) {
    const items = await sql`
    SELECT * FROM "CartItem"
    WHERE cart_id = ${cartId}
    `;
    return items;
}

// Get cart item by ID
async function getCartItemById(cartItemId, cartId) {
    const items = await sql`
    SELECT * FROM "CartItem"
    WHERE id = ${cartItemId} AND cart_id = ${cartId}
    `;
    return items[0];
}

// Update cart list
// Inside your cartModel.js file

async function updateCartItems(cartId, newList) {
    // Start transaction
    return sql.begin(async sql => {

        // 1. Delete all old items
        await sql`
            DELETE FROM "CartItem"
            WHERE cart_id = ${cartId}
        `;

        // 2. Prepare to add new items
        let totalAmount = 0;
        let totalQuantity = 0;
        const insertedItems = [];

        if (newList && newList.length > 0) {
            for (const item of newList) {
                
                const client_product_id = item.product_id;
                const client_quantity = Number(item.quantity) || 1;
                const client_rent_time = Number(item.rent_time) || 1;

                const products = await sql`
                    SELECT product_id, name, price_per_day, sale_percentage, images 
                    FROM "Product" 
                    WHERE product_id = ${client_product_id}
                `;
                
                const product = products[0];

                if (!product) {
                    console.warn(`Skipping item, product ID ${client_product_id} not found.`);
                    continue; 
                }

                const unit_price = Number(product.price_per_day);
                const sale_percent = Number(product.sale_percentage) || 0;
                // const delivery_fee = 10; 
                
                const finalPrice = unit_price * (1 - sale_percent / 100.0);
                const itemTotalPrice = finalPrice * client_quantity * client_rent_time;
                
                const metadata = {
                    product_name: product.name,
                    images: product.images 
                };

                // 2d. INSERT the new, secure data
                const newDbItem = await sql`
                    INSERT INTO "CartItem" (
                        cart_id, 
                        product_id, 
                        unit_price,
                        quantity,
                        metadata,
                        rent_time, 
                        total_price
                    )
                    VALUES (
                        ${cartId}, 
                        ${product.product_id}, 
                        ${finalPrice}, 
                        ${client_quantity},
                        ${sql.json(metadata)},
                        ${client_rent_time}, 
                        ${itemTotalPrice}
                    )
                    RETURNING *
                `;

                const dbItem = newDbItem[0];
                totalAmount += Number(dbItem.total_price);
                totalQuantity += Number(dbItem.quantity);
                insertedItems.push(dbItem);
            }
        }

        // 3. Update the main "Cart" table with the secure totals
        await sql`
            UPDATE "Cart"
            SET
                updated_at = NOW(),
                total_amount = ${totalAmount},
                total_quantity = ${totalQuantity},
                "order" = ${insertedItems.length}
            WHERE
                id = ${cartId}
        `;

        // 4. Return the newly inserted items
        return insertedItems;
    });
}

module.exports = {
    createCart,
    getOpenCartByUserId,
    addItemToCart,
    deleteCartItem,
    getCartItems,
    getCartItemById,
    updateCartItems
}