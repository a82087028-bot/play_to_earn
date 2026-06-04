// ... baaki code wahi rahega, sirf API 2 (Reward Ad) mein ye update karein:

// API 2: Add Spin via Monetag Ad (Optimized)
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

// ... baaki code (API 3 aur API 4) mein koi change ki zaroorat nahi hai.
