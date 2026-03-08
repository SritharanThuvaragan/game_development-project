require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Example Banana API Route Placeholder
// app.use('/api/game', require('./routes/gameRoutes'));

app.get('/', (req, res) => {
    res.send('Banana Game API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
