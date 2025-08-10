/**
 * Create credentials table in database
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });

const { sequelize } = require('../apps/api/src/config/database');
const { Credentials } = require('../apps/api/src/models/Credentials');

async function syncCredentialsTable() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Creating/updating credentials table...');
    await Credentials.sync({ alter: true });
    console.log('✅ Credentials table synced successfully');

    // Check if table is empty and add some example entries
    const count = await Credentials.count();
    console.log(`📊 Current credentials count: ${count}`);

    if (count === 0) {
      console.log('🔄 Adding example credentials...');
      
      // Add Google Gemini example (if env var exists)
      if (process.env.GOOGLE_GEMINI_API_KEY) {
        await Credentials.create({
          service_name: 'google_gemini',
          service_type: 'api_key',
          credentials: {
            api_key: process.env.GOOGLE_GEMINI_API_KEY
          },
          description: 'Google Gemini AI API key for content generation',
          is_active: true
        });
        console.log('✅ Added Google Gemini credentials');
      }

      // Add SMTP example (if env vars exist)
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        await Credentials.create({
          service_name: 'smtp_primary',
          service_type: 'smtp',
          credentials: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            username: process.env.SMTP_USER,
            password: process.env.SMTP_PASS,
            secure: process.env.SMTP_SECURE === 'true'
          },
          description: 'Primary SMTP email service for notifications',
          is_active: true
        });
        console.log('✅ Added SMTP credentials');
      }

      // Add reCAPTCHA example (if env var exists)
      if (process.env.RECAPTCHA_SECRET_KEY) {
        await Credentials.create({
          service_name: 'recaptcha',
          service_type: 'api_key',
          credentials: {
            secret_key: process.env.RECAPTCHA_SECRET_KEY
          },
          description: 'Google reCAPTCHA secret key for form protection',
          is_active: true
        });
        console.log('✅ Added reCAPTCHA credentials');
      }

      const finalCount = await Credentials.count();
      console.log(`📊 Final credentials count: ${finalCount}`);
    }

    console.log('\n✅ Credentials table setup completed successfully!');
  } catch (error) {
    console.error('❌ Failed to sync credentials table:', error);
  } finally {
    await sequelize.close();
  }
}

syncCredentialsTable();