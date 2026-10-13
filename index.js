const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const http = require('http');

// Render-in sönməməsi üçün web server
http.createServer((req, res) => res.end('Bot aktivdir!')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`${client.user.tag} buludda işə düşdü!`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!panel') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🟢 Aternos Paneli (Serveri Aç)')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://aternos.org/server/') // Bura birbaşa Aternos server panelinizin linkini yazın
            );

        await message.channel.send({
            content: '🎮 **Aternos Server İdarə Paneli**\nServeri idarə etmək və ya açmaq üçün aşağıdakı düyməyə basın:',
            components: [row]
        });
    }
});

client.login(process.env.TOKEN);
