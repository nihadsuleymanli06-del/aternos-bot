const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Aternos } = require('aternos-api');
const http = require('http');

// Render hostinqinin sönməməsi üçün sadə web server
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

// Serverdə !panel yazdıqda düyməli mesaj göndərir
client.on('messageCreate', async (message) => {
    if (message.content === '!panel') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_aternos')
                    .setLabel('🟢 Serveri Başlat')
                    .setStyle(ButtonStyle.Success)
            );

        await message.channel.send({
            content: '🎮 **Aternos Server İdarə Paneli**\nServeri işə salmaq üçün aşağıdakı düyməyə basın:',
            components: [row]
        });
    }
});

// Düyməyə basıldıqda
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'start_aternos') {
        await interaction.reply({ content: '⏳ Aternos-a daxil olunur və server başladılır...', ephemeral: true });

        try {
            const aternos = new Aternos();
            await aternos.login(process.env.ATERNOS_USERNAME, process.env.ATERNOS_PASSWORD);

            const servers = await aternos.getServers();
            if (!servers || servers.length === 0) {
                return await interaction.editReply({ content: '❌ Aternos hesabında heç bir server tapılmadı!' });
            }

            const server = servers[0]; // İlk serverinizi götürür
            await server.start();

            await interaction.editReply({ content: '✅ **Server uğurla işə salındı!** (Sıraya alındı və ya açılır).' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Xəta baş verdi! Aternos giriş məlumatlarınızı və ya CAPTCHA tələbini yoxlayın.' });
        }
    }
});

client.login(process.env.TOKEN);