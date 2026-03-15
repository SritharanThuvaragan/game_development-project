require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Score and Leaderboard Routes
app.use('/api/scores', require('./routes/scoreRoutes'));

// Example Banana API Route Placeholder
// app.use('/api/game', require('./routes/gameRoutes'));

app.get('/', (req, res) => {
    res.send('Banana Game API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
