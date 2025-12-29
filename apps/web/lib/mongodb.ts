import mongoose from 'mongoose';

let isConnected = false;

async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('📡 Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB Atlas:', error);
    throw error;
  }
}

export async function ensureDbConnection() {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('✅ MongoDB Atlas conectado desde la aplicación web');
    } catch (error) {
      console.error('❌ Error conectando a MongoDB Atlas:', error);
      throw error;
    }
  }
}

// Función para usar en las rutas API
export async function withDatabase<T>(handler: () => Promise<T>): Promise<T> {
  await ensureDbConnection();
  return handler();
}