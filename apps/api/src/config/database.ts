import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_NAME = process.env.DB_NAME || 'virginia';
const DB_USER = process.env.DB_USER || 'virginia';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST === 'localhost' ? '127.0.0.1' : DB_HOST,
  port: DB_PORT,
  dialect: 'mariadb',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    timezone: 'Etc/GMT-5'
  }
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`🐬 MariaDB Connected: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    
    // Sync database (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📊 Database tables synchronized');
    }
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('🔌 MariaDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;