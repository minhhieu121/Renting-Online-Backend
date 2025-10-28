import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seller_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [['Electronics', 'Clothes', 'Furniture', 'Sports', 'Books', 'Tools', 'Vehicles', 'Other']]
    }
  },
  pricePerDay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_day',
    validate: {
      min: 0.01
    }
  },
  salePercentage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'sale_percentage',
    validate: {
      min: 0,
      max: 100
    }
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'rented', 'unavailable'),
    allowNull: false,
    defaultValue: 'available'
  },
  condition: {
    type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'poor'),
    allowNull: false,
    defaultValue: 'good'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_reviews'
  },
  totalRentals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_rentals'
  },
  minRentalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'min_rental_days'
  },
  maxRentalDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30,
    field: 'max_rental_days'
  },
  deposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['seller_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Define association
Product.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

User.hasMany(Product, {
  foreignKey: 'seller_id',
  as: 'products'
});

export default Product;

