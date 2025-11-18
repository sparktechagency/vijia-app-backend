import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  stripe: {
    secret_key: process.env.STRIPE_API_SECRET,
    webhook_secret: process.env.WEBHOOK_SECRET,
  },
  amadeus: {
    api_key: process.env.AMADEUS_API_KEY,
    api_secret: process.env.AMADEUS_API_SECRET,
    base_url: process.env.AMADEUS_BASE_URL,
  },
  google: {
    api_key: process.env.GOOGLE_MAPS_API_KEY,
  },
  gemini: {
    key: process.env.GEMINI_API_KEY,
  },

  openAi:{
    key: process.env.OPENAI_API_KEY
  },
  apple: {
    password: process.env.APPLE_PASSWORD,
  },
};
