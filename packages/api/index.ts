import './polyfills';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes'; // ✅
import { connectDB } from './db/connect';

const app = express();

// Conectar a MongoDB Atlas
connectDB();

app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());

// ✅ Montás el router que engloba todo
app.use('/api', routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🔥 Servidor backend Node corriendo en http://localhost:${PORT}`);
});
