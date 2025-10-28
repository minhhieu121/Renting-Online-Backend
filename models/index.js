import { sequelize } from '../config/database.js';
import User from './User.js';
import Product from './Product.js';

// Export all models
const models = {
  User,
  Product,
  sequelize
};

// Sync database
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

export { User, Product, sequelize, syncDatabase };
export default models;

