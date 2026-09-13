const http = require('http');
http.createServer((req, res) => {
  res.write("Bot 7/24 Aktif!");
  res.end();
}).listen(process.env.PORT || 3000);	
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const tokenPath = path.join(__dirname, 'token.txt');
let TOKEN = '';

try {
    TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
} catch (err) {
    console.error('❌ token.txt dosyası bulunamadı!');
    process.exit(1);
}

const GUILD_ID = '1480822756370022480';
const CHANNEL_ID = '1548705037532930168';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

function connectToVoice() {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return console.log('❌ Bot bu sunucuda ekli değil!');

    const channel = guild.channels.cache.get(CHANNEL_ID);
    if (!channel) return console.log('❌ Ses kanalı bulunamadı!');

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: true,
        selfDeaf: true
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5000),
            ]);
        } catch (error) {
            connection.destroy();
            console.log('⚠️ Bağlantı koptu, tekrar bağlanılıyor...');
            connectToVoice();
        }
    });
}

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} aktif! Ses kanalına giriliyor...`);
    connectToVoice();
});

client.login(TOKEN);