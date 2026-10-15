const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.post('/api/verify-rewards', async (req, res) => {
    const { minecraftUsername, discordUsername, email } = req.body;

    // Check server-side that all inputs are valid before moving forward
    if (!minecraftUsername || !discordUsername || !email || !email.includes('@')) {
        return res.status(400).json({ error: 'Missing or malformed data properties.' });
    }

    if (!WEBHOOK_URL) {
        console.error("Missing configuration: Define DISCORD_WEBHOOK_URL on your server environment.");
        return res.status(500).json({ error: 'Server configuration failure.' });
    }

    try {
        const payload = {
            embeds: [{
                title: "🍩 Donut Amethyst Rewards Queue",
                description: "A community player has submitted account details for administrative review.",
                color: 11030007, // Theme Purple
                fields: [
                    { name: "Minecraft Profile", value: `\`${minecraftUsername}\``, inline: true },
                    { name: "Discord Account", value: `\`${discordUsername}\``, inline: true },
                    { name: "Contact Email", value: `\`${email}\``, inline: false },
                    { name: "Required Action", value: "Validate accounts and generate an entry code.", inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        await axios.post(WEBHOOK_URL, payload);
        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Discord API communication failure:", err.message);
        return res.status(500).json({ error: 'Failed to deliver notification.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server active on port ${PORT}`));
