import mongoose from 'mongoose'

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) return

    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('📡 Conectado a MongoDB Atlas')
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB Atlas:', error)
  }
}