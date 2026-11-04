import 'dotenv/config';

const REQUIRED_VARIABLES = ['DATABASE_URL', 'JWT_SECRET'];

const missingVariables = REQUIRED_VARIABLES.filter((name) => !process.env[name]);
if (missingVariables.length) {
  throw new Error(`Thiếu biến môi trường: ${missingVariables.join(', ')}`);
}

const port = process.env.PORT || 3000;

export default {
  port,
  publicUrl: process.env.PUBLIC_URL || `http://localhost:${port}`,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
