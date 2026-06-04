const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

// Vercel deployment ke liye static files ka sahi setup
app.use(express.static(path.join(__dirname)));

const MONGO_URI = "mongodb+srv://a82087028_db_user:hVIQmcWc3QTEyYSe@myfirstbotdb.fl783gi.mongodb.net/?appName=MyFirstBotDB";

mongoose.connect(MONGO_URI)
    .then(() => console.log("🎰 Database Connected Successfully!"))
    .catch((err) => console.error("Database connection failed:", err));

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 },
    spins: { type: Number, default: 2 },
    history: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);
const prizeRewards = [50, 1000, 300, 150, 75, 500, 250, 100];

// API: User Data Fetch
app.get('/api/user-data', async (req, res) => {
    let { userId } = req.query;
    if (!userId || userId === "undefined") return res.status(400).json({ error: "Invalid ID" });
    try {
        let user = await User.findOne({ userId: String(userId) });
        if (!user) user = await new User({ userId: String(userId), coins: 0, spins: 2, history: [] }).save();
        res.json(user);
    } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

// API: Monetag Reward
app.post('/api/reward-ad', async (req, res) => {
    const { userId } = req.body;
    try {
        let user = await User.findOne({ userId: String(userId) });
        if (!user) user = new User({ userId: String(userId), coins: 0, spins: 1, history: [] });
        else user.spins += 1;
        await user.save();
        res.json({ success: true, spins: user.spins });
    } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// API: Spin Logic
app.post('/api/spin-wheel', async (req, res) => {
    const { userId } = req.body;
    try {
        let user = await User.findOne({ userId: String(userId) });
        if (!user || user.spins <= 0) return res.json({ error: "No spins available!" });
        user.spins -= 1;
        let targetSector = Math.floor(Math.random() * 8);
        user.coins += prizeRewards[targetSector];
        user.history.unshift({ type: 'Spin', amount: `+${prizeRewards[targetSector]}`, time: new Date().toLocaleTimeString() });
        if(user.history.length > 5) user.history.pop();
        await user.save();
        res.json({ targetSector, remainingSpins: user.spins, newBalance: user.coins, history: user.history });
    } catch (err) { res.status(500).json({ error: "Spin Error" }); }
});

// API: Withdraw
app.post('/api/withdraw', async (req, res) => {
    const { userId, address, asset } = req.body;
    try {
        let user = await User.findOne({ userId: String(userId) });
        if (!user || user.coins < 20000) return res.json({ success: false, message: "Min 20k coins required" });
        user.coins -= 20000;
        user.history.unshift({ type: `Payout`, amount: `-$1.0`, time: new Date().toLocaleTimeString() });
        await user.save();
        res.json({ success: true, newBalance: user.coins, history: user.history });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Routing for Vercel
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

module.exports = app;
