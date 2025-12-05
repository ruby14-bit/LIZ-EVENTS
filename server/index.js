const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Route Handlers
const mpesaRoutes = require('./routes/mpesa'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// 1. CORS: Allows your React App (port 5173 or 3000) to talk to this Server (port 5000)
app.use(cors());

// 2. JSON Parser: Allows the server to understand data sent in JSON format
app.use(express.json());

// --- ROUTES ---
// Mounts the M-Pesa routes at /api/mpesa
// Example: A POST request to /api/mpesa/stkpush will be handled by mpesaRoutes
app.use('/api/mpesa', mpesaRoutes);

// --- HEALTH CHECK ---
// A simple route to test if the server is alive in the browser
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h1>🚀 LIZ Catering Server is Online</h1>
      <p>Listening on Port ${PORT}</p>
      <p>M-Pesa Module: <span style="color: green">Active</span></p>
    </div>
  `);
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`\n⚡️ LIZ Server running on http://localhost:${PORT}`);
  console.log(`   - M-Pesa Routes active at http://localhost:${PORT}/api/mpesa\n`);
});