const mongoose = require("mongoose");

async function connectDB() {
  try {
    // En EC2 con Mongo instalado localmente, esta URL es correcta.
    await mongoose.connect("mongodb://127.0.0.1:27017/ruleta");
    console.log("Conexión a MongoDB exitosa!");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
    process.exit(1); // Detener el proceso si no hay DB
  }
}

module.exports = { connectDB };