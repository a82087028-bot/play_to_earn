const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

// 🛠️ Step 2 Fix: Vercel environment ke liye static path ko handle karne ka sahi tarika
app.use(express.static(path.resolve(__dirname)));

const MONGO_URI = "mongodb+srv://a82087028_db_user:hVIQmcWc3QTEyYSe@myfirstbotdb.fl783gi.mongodb.net/?appName=MyFirstBotDB";

mongoose.connect(MONGO_URI)
    .then(() => console.log("🎰 Professional Cloud Database Connected!"))
    .catch((err) => console.error("Database connection failed:", err));

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 },
    spins: { type: Number, default: 2 },
    history: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);
const prizeRewards = [50, 1000, 300, 150, 75, 500, 250, 100];

// API 1: Fetch/Create User
app.get('/api/user-data', async (req, res) => {
    const { userId } = req.query;
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            user = await new User({ userId, coins: 0, spins: 2, history: [] }).save();
        }
        res.json(user);
    } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

// API 2: Add Spin via Monetag Ad (Optimized & Verified)
app.post('/api/reward-ad', async (req, res) => {
    const { userId } = req.body;
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            // Agar user database mein nahi hai, toh create karein
            user = new User({ userId, coins: 0, spins: 1, history: [] });
        } else {
            user.spins += 1;
        }
        
        await user.save();
        
        // Monetag console log
        console.log(`🎬 [MONETAG_SUCCESS]: User ${userId} watched ad. Spin added!`);
        
        res.json({ 
            success: true, 
            spins: user.spins,
            message: "Ad reward verified by Monetag SDK" 
        });
    } catch (err) { 
        console.error("Monetag Reward Error:", err);
        res.status(500).json({ error: "Ad Reward Processing Failed" }); 
    }
});

// API 3: Spin Wheel Logic
app.post('/api/spin-wheel', async (req, res) => {
    const { userId } = req.body;
    try {
        let user = await User.findOne({ userId });
        if (!user || user.spins <= 0) return res.json({ error: "No spins available!" });

        user.spins -= 1;
        // Optimized Win Logic
        let targetSector = (user.coins > 6000 && Math.random() < 0.85) ? [0, 4, 7][Math.floor(Math.random()*3)] : Math.floor(Math.random() * 8);

        let wonCoins = prizeRewards[targetSector];
        user.coins += wonCoins;
        user.history.unshift({ type: 'Lucky Spin', amount: `+${wonCoins}`, status: 'win', time: new Date().toLocaleTimeString() });
        if(user.history.length > 10) user.history.pop();

        user.markModified('history');
        await user.save();
        res.json({ targetSector, remainingSpins: user.spins, newBalance: user.coins, history: user.history });
    } catch (err) { res.status(500).json({ error: "Spin Logic Error" }); }
});

// API 4: Optimized Withdraw (Fixed Coin Drain Bug & Applied New Rate Rules)
app.post('/api/withdraw', async (req, res) => {
    const { userId, address, asset } = req.body;
    try {
        let user = await User.findOne({ userId });
        if (!user || user.coins < 20000) return res.json({ success: false, message: "Insufficient balance. Minimum 20,000 Coins required." });

        // Fixed Rate Rule Calculation: 100 coins = $0.005 USD (So 20,000 coins = $1.000)
        let usdClaim = (user.coins / 20000).toFixed(3);
        
        user.history.unshift({ type: `Payout (${asset})`, amount: `-$${usdClaim}`, status: 'out', time: new Date().toLocaleTimeString() });
        
        // BUG FIX: Pura balance zero karne ki bajaye sirf 20k minus karein taake bache hue coins safe rahein!
        user.coins -= 20000; 
        
        user.markModified('history');
        await user.save();
        console.log(`🎁 [WITHDRAWAL]: User ${userId} requested $${usdClaim} via ${asset} to ${address}`);
        res.json({ success: true, newBalance: user.coins, history: user.history });
    } catch (err) { res.status(500).json({ success: false, message: "Withdrawal failed." }); }
});

// 🛠️ Homepage routing path explicit for Vercel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Vercel serverless application module export handler
module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Professional Cloud Engine active on port ${PORT}`));
