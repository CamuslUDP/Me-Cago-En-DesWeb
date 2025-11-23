const apiRoutes = require('./routes');
const config = require('../commons/configs/site.config.js');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// == API ===============================
app.use('/api', apiRoutes);

// == Archivos ==========================
app.use(express.static(path.join(__dirname, '../frontend/html')));
app.use(express.static(path.join(__dirname, '../frontend/css')));
app.use(express.static(path.join(__dirname, '../frontend/js')));
app.use(express.static(path.join(__dirname, '../frontend/fotos')));


// == Fallback ==========================
app.get((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/main.html'));
});

/*
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
*/
// == Servidor ==========================
app.listen(3042, () => {
    console.log(`Servidor Express escuchando en puerto 3042`);
    console.log(`Dominio configurado: ${config.DOMAIN}`);
});
