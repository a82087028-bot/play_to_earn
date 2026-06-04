const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 REAL MONGODB CLOUD LINK CONNECTED
const MONGO_URI = "mongodb+srv://a82087028_db_user:hVIQmcWc3QTEyYSe@myfirstbotdb.fl783gi.mongodb.net/?appName=MyFirstBotDB";

mongoose.connect(MONGO_URI)
    .then(() => console.log("🎰 Professional Cloud Database Connected!"))
    .catch((err) => console.error("Database connecting failed:", err));

// 📝 Permanent Secure Database Schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 },
    spins: { type: Number, default: 2 },
    history: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);
const prizeRewards = [50, 1000, 300, 150, 75, 500, 250, 100];

// API 1: Fetch/Create User Balance
app.get('/api/user-data', async (req, res) => {
    const { userId } = req.query;
    try {
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, coins: 0, spins: 2, history: [] });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Database reading error" });
    }
});

// API 2: Add Spin Safely
app.post('/api/reward-ad', async (req, res) => {
    const { userId } = req.body;
    try {
        let user = await User.findOne({ userId });
        if (user) {
            user.spins += 1;
            await user.save();
            res.json({ success: true, spins: user.spins });
        } else {
            res.status(404).json({ error: "User profile missing" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server sync issue" });
    }
});

// API 3: Hacker-Proof Anti-Cheat Calculation
app.post('/api/spin-wheel', async (req, res) => {
    const { userId } = req.body;
    try {
        let user = await User.findOne({ userId });
        if (!user || user.spins <= 0) {
            return res.json({ error: "No spins available!" });
        }

        user.spins -= 1;
        let targetSector = 0;

        // Smart Risk Filter (Win Rate Optimizer)
        if (user.coins >= 6000) {
            let dice = Math.random() * 100;
            if (dice < 85) {
                let lowPrizes = [0, 4, 7]; // 50, 75, 100 coins
                targetSector = lowPrizes[Math.floor(Math.random() * lowPrizes.length)];
            } else {
                let midPrizes = [2, 3, 6]; // 300, 150, 250 coins
                targetSector = midPrizes[Math.floor(Math.random() * midPrizes.length)];
            }
        } else {
            targetSector = Math.floor(Math.random() * 8);
        }

        let wonCoins = prizeRewards[targetSector];
        user.coins += wonCoins;

        let timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        user.history.unshift({ type: 'Lucky Spin', amount: `+${wonCoins} Coins`, status: 'win', time: timeString });
        if(user.history.length > 10) user.history.pop();

        user.markModified('history');
        await user.save();

        res.json({
            targetSector: targetSector,
            remainingSpins: user.spins,
            newBalance: user.coins,
            history: user.history
        });
    } catch (err) {
        res.status(500).json({ error: "Calculation crashed" });
    }
});

// API 4: Secure Blockchain Payout Registry
app.post('/api/withdraw', async (req, res) => {
    const { userId, address, asset } = req.body;
    try {
        let user = await User.findOne({ userId });
        if (!user || user.coins < 20000) {
            return res.json({ success: false, message: "Minimum withdraw threshold is 20,000 coins." });
        }

        let usdClaim = (user.coins / 20000).toFixed(3);
        let timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        user.history.unshift({ type: `Payout (${asset})`, amount: `-$${usdClaim}`, status: 'out', time: timeString });
        user.coins = 0; 
        
        user.markModified('history');
        await user.save();

        // Admin Terminal Log (Yeh details aapke live panel pr print hongi)
        console.log(`🎁 [WITHDRAWAL DISPATCH QUEUE]: User ID: ${userId} | Amount: $${usdClaim} | Asset: ${asset} | Address: ${address}`);
        
        res.json({ success: true, newBalance: user.coins, history: user.history });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database pipeline exception." });
    }
});

// Auto-detect dynamic hosting ports (Render compatibility)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Professional Cloud Engine active on port ${PORT}`));
