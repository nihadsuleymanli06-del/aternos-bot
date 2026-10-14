import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import discord
from pyaternos import AternosAccount

# Render-in "Timed Out" verməməsi üçün mini veb-server
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Bot aktivdir!")

def run_web_server():
    port = int(os.getenv("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
    server.serve_forever()

# Veb serveri arxa planda (thread) işə salırıq
threading.Thread(target=run_web_server, daemon=True).start()

# Discord Bot Hissəsi
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)
tree = discord.app_commands.CommandTree(client)

ATERNOS_USER = os.getenv("ATERNOS_USERNAME")
ATERNOS_PASS = os.getenv("ATERNOS_PASSWORD")
TOKEN = os.getenv("TOKEN")

@client.event
async def on_ready():
    await tree.sync()
    print(f"{client.user} botu Python ilə işə düşdü!")

class AternosView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="🟢 Serveri Avtomatik Başlat", style=discord.ButtonStyle.green, custom_id="start_aternos")
    async def start_server(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(ephemeral=True)
        
        try:
            account = AternosAccount(ATERNOS_USER, ATERNOS_PASS)
            servers = account.servers
            
            if not servers:
                await interaction.followup.send("❌ Hesabınızda heç bir server tapılmadı!", ephemeral=True)
                return
                
            server = servers[0]
            server.start()
            
            await interaction.followup.send("✅ **Uğurlu!** Aternos serveriniz işə salındı.", ephemeral=True)
        except Exception as e:
            print(e)
            await interaction.followup.send("❌ Xəta baş verdi! Aternos şifrəsi və ya istifadəçi adı səhv ola bilər.", ephemeral=True)

@client.event
async def on_message(message):
    if message.author.bot:
        return
    if message.content == "!panel":
        view = AternosView()
        await message.channel.send("🎮 **Aternos İdarəetmə Paneli**\nServeri avtomatik açmaq üçün aşağıdakı düyməyə basın:", view=view)

client.run(TOKEN)
