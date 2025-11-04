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

module.exports = {
    createCart,
    getOpenCartByUserId,
    addItemToCart,
    deleteCartItem,
    getCartItems,
    getCartItemById
}