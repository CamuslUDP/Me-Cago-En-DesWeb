const express = require("express");
const mongoose = require("mongoose");
const { validarToken } = require("../utils/jwt");
const { calcularPago } = require("../utils/payments");

const router = express.Router();
const usuarios = mongoose.connection.collection("usuarios");
const historial = mongoose.connection.collection("historial");

// Middleware de autenticación local para este router
router.use((req, res, next) => {
  try {
    const token = req.cookies.session;
    if(!token) throw new Error("No token");
    req.user = validarToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida" });
  }
});

// POST /api/game/spin
router.post("/spin", async (req, res) => {
  try {
    const bets = req.body.bets; // Array de objetos { type, value, amount }
    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({ error: "No hay apuestas válidas" });
    }

    // 1. Calcular total apostado
    let totalApostado = 0;
    for (const b of bets) {
      if (b.amount <= 0) return res.status(400).json({ error: "Monto negativo" });
      totalApostado += b.amount;
    }

    const userIdObj = new mongoose.Types.ObjectId(req.user.id);

    // 2. Verificar saldo y descontar atómicamente
    // Buscamos usuario con saldo suficiente
    const user = await usuarios.findOne({ _id: userIdObj });
    
    if (!user || user.balance < totalApostado) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // Descontamos la apuesta (para asegurar la transacción)
    await usuarios.updateOne(
        { _id: userIdObj },
        { $inc: { balance: -totalApostado } }
    );

    // 3. Generar número aleatorio (SERVER SIDE)
    const result = Math.floor(Math.random() * 37); // 0-36

    // 4. Calcular ganancia
    let gananciaTotal = 0;
    for (const b of bets) {
      // Usamos la utilidad de pagos
      const gananciaApuesta = calcularPago({
        type: b.type,
        value: b.value,
        amount: b.amount,
        result
      });
      gananciaTotal += gananciaApuesta;
    }

    // 5. Acreditar ganancia (si hubo)
    if (gananciaTotal > 0) {
      await usuarios.updateOne(
        { _id: userIdObj },
        { $inc: { balance: gananciaTotal } }
      );
    }

    // 6. Registrar en historial
    const nuevoSaldo = (user.balance - totalApostado) + gananciaTotal;
    
    await historial.insertOne({
      userId: userIdObj,
      action: "BET",
      bets,
      result,
      amountBet: totalApostado,
      amountWon: gananciaTotal,
      netResult: gananciaTotal - totalApostado,
      date: new Date()
    });

    res.json({ 
        result, 
        win: gananciaTotal, 
        balance: nuevoSaldo,
        net: gananciaTotal - totalApostado
    });

  } catch (error) {
    console.error("Error en spin:", error);
    res.status(500).json({ error: "Error en el juego" });
  }
});

// GET /api/game/history
router.get("/history", async (req, res) => {
  try {
    const data = await historial
      .find({ userId: new mongoose.Types.ObjectId(req.user.id), action: "BET" })
      .sort({ date: -1 })
      .limit(10)
      .toArray();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo historial" });
  }
});

module.exports = router;