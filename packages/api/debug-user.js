const mongoose = require('mongoose');
require('dotenv').config();

// Definir el esquema del usuario (simplificado para el debug)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  isVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function debugUser() {
  try {
    // Conectar a la base de datos
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yatools');
    console.log('✅ Conectado a MongoDB');

    // Buscar el usuario específico
    const email = 'yoryiabreu@gmail.com';
    console.log(`\n🔍 Buscando usuario: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('\n📋 Estado actual del usuario:');
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('isVerified:', user.isVerified);
    console.log('verificationToken:', user.verificationToken);
    console.log('createdAt:', user.createdAt);
    console.log('updatedAt:', user.updatedAt);

    // Si isVerified es false, actualizarlo a true
    if (!user.isVerified) {
      console.log('\n🔧 isVerified está en false, actualizando a true...');
      
      user.isVerified = true;
      await user.save();
      
      console.log('✅ Usuario actualizado exitosamente');
      
      // Verificar la actualización
      const updatedUser = await User.findOne({ email });
      console.log('\n✅ Verificación post-actualización:');
      console.log('isVerified:', updatedUser.isVerified);
    } else {
      console.log('\n✅ isVerified ya está en true');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
debugUser();