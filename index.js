const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Aternos } = require('aternos-api');
const http = require('http');

http.createServer((req, res) => res.end('Bot aktivdir!')).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`${client.user.tag} botu hazırdır!`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!panel') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_aternos_server')
                    .setLabel('🟢 Serveri Avtomatik Başlat')
                    .setStyle(ButtonStyle.Success)
            );

        await message.channel.send({
            content: '🎮 **Aternos İdarəetmə Paneli**\nDüyməyə basaraq serverin avtomatik açılmasını təmin edə bilərsiniz:',
            components: [row]
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'start_aternos_server') {
        await interaction.reply({ content: '⏳ Aternos hesabına qoşulur və server başladılır, zəhmət olmasa gözləyin...', ephemeral: true });

        try {
            const aternos = new Aternos();
            // Render-də yazdığınız Aternos şifrə və istifadəçi adınızla daxil olur
            await aternos.login(process.env.ATERNOS_USERNAME, process.env.ATERNOS_PASSWORD);

            const servers = await aternos.getServers();
            if (!servers || servers.length === 0) {
                return await interaction.editReply({ content: '❌ Hesabınızda heç bir server tapılmadı!' });
            }

            const server = servers[0];
            await server.start(); // Avtomatik açma əmri

            await interaction.editReply({ content: '✅ **Uğurlu!** Aternos serveriniz işə salındı (növbəyə alındı).' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Xəta baş verdi! Aternos şifrəniz dəyişibsə və ya sistem CAPTCHA istəsə avtomatik girə bilməz.' });
        }
    }
});

client.login(process.env.TOKEN);
