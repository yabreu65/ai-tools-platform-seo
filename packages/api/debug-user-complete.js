const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Definir el esquema del usuario completo
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

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function debugUserComplete() {
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

    console.log('\n📋 Estado completo del usuario:');
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Password (hash):', user.password);
    console.log('isVerified:', user.isVerified);
    console.log('verificationToken:', user.verificationToken);
    console.log('createdAt:', user.createdAt);
    console.log('updatedAt:', user.updatedAt);

    // Probar diferentes contraseñas
    const testPasswords = ['123456', 'password', 'test123', 'admin'];
    
    console.log('\n🔐 Probando contraseñas comunes:');
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await user.comparePassword(testPassword);
        console.log(`- "${testPassword}": ${isMatch ? '✅ CORRECTA' : '❌ incorrecta'}`);
        if (isMatch) {
          console.log(`\n🎉 ¡Contraseña encontrada! La contraseña correcta es: "${testPassword}"`);
          break;
        }
      } catch (error) {
        console.log(`- "${testPassword}": ❌ error al comparar`);
      }
    }

    // Verificar si necesita actualizar isVerified
    if (!user.isVerified) {
      console.log('\n🔧 isVerified está en false, actualizando a true...');
      user.isVerified = true;
      await user.save();
      console.log('✅ Usuario actualizado exitosamente');
    } else {
      console.log('\n✅ isVerified ya está en true');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n🔌 Desconectando de MongoDB...');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

debugUserComplete();