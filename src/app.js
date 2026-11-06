import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';
import { UPLOAD_DIRECTORY } from './services/imageStorageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'docs/swagger.json'), 'utf8')
);

const app = express();

app.use(cors());
app.use(express.json({ type: ['application/json', 'application/*+json'] }));
app.use('/uploads', express.static(UPLOAD_DIRECTORY));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Chuyển hướng trang chủ về /api-docs để tiện mở giao diện test
app.get('/', (req, res) => res.redirect('/api-docs'));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
