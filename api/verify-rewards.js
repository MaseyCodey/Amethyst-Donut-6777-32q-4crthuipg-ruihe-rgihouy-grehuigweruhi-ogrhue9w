const axios = require('axios');

module.exports = async (req, res) => {
    // Vercel Serverless Functions only accept specific methods
    if (req.method !== 'POST') {
        return res.status(450).json({ error: 'Method not allowed' });
    }

    const { minecraftUsername, discordUsername, email } = req.body;

    // 1. Validate inputs server-side
    if (!minecraftUsername || !discordUsername || !email || !email.includes('@')) {
        return res.status(400).json({ error: 'Missing or malformed data properties.' });
    }

    // 2. Fetch the secure environment variable from Vercel's cloud dashboard
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
        console.error("Vercel Configuration Error: DISCORD_WEBHOOK_URL is not set.");
        return res.status(500).json({ error: 'Server configuration failure.' });
    }

    try {
        // 3. Format the Discord Embed notification payload
        const payload = {
            embeds: [{
                title: "🍩 Donut Amethyst Rewards Queue",
                description: "A community player has submitted account details via Vercel.",
                color: 11030007, // Theme Purple
                fields: [
                    { name: "Minecraft Profile", value: `\`${minecraftUsername}\``, inline: true },
                    { name: "Discord Account", value: `\`${discordUsername}\``, inline: true },
                    { name: "Contact Email", value: `\`${email}\``, inline: false },
                    { name: "Required Action", value: "Review profile details and assist inside Discord.", inline: false }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        // 4. Securely dispatch the transmission to Discord
        await axios.post(WEBHOOK_URL, payload);
        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Discord API communication failure:", err.message);
        return res.status(500).json({ error: 'Failed to deliver notification to Discord.' });
    }
};
