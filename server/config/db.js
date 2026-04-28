const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canvet';

    if (process.env.USE_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mem = await MongoMemoryServer.create({
        instance: { dbName: 'canvet' }
      });
      uri = mem.getUri();
      console.log('🧠 mongodb-memory-server activo (datos efímeros, se reinicializan al reiniciar)');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = conectarDB;
