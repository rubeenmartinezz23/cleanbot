require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🧠 ID del canal de actividades (desde Railway env)
const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID;

// ---------------- COMANDOS ----------------

const commands = [

  new SlashCommandBuilder()
    .setName("contratar")
    .setDescription("Contratar empleado")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Enviar anuncio oficial")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje del anuncio")
        .setRequired(true)
    )

].map(c => c.toJSON());

// ---------------- REGISTRO COMANDOS ----------------

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("🧹 Comandos registrados");
  } catch (err) {
    console.log(err);
  }
})();

// ---------------- READY + ACTIVIDADES ----------------

client.once("ready", () => {
  console.log(`🧹 Bot online como ${client.user.tag}`);

  // ⏰ SISTEMA DE ACTIVIDADES PROGRAMADAS
  setInterval(async () => {
    const now = new Date();

    // 📢 ACTIVIDAD A LAS 18:00
    if (now.getHours() === 18 && now.getMinutes() === 0) {

      const channel = client.channels.cache.get(ACTIVITIES_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle("📢 ACTIVIDAD EMPRESARIAL")
        .setDescription("⏰ Actividad disponible ahora\n👷 Todos los empleados deben asistir")
        .setColor("Blue")
        .setFooter({ text: "Sistema automático de empresa RP" });

      channel.send({
        content: "@everyone 📢 Nueva actividad disponible",
        embeds: [embed]
      });
    }

  }, 60000); // cada minuto
});

// ---------------- INTERACCIONES ----------------

client.on("interactionCreate", async interaction => {

  // ================= CONTRATAR =================
  if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

    try {

      await interaction.deferReply();

      const usuario = interaction.options.getUser("usuario");
      const member = await interaction.guild.members.fetch(usuario.id);

      const role = interaction.guild.roles.cache.find(r => r.name === "🆕 RECLUTA");

      if (!role) {
        return interaction.editReply("❌ No existe el rol 🆕 RECLUTA");
      }

      await member.roles.add(role);

      return interaction.editReply(`🧑‍💼 ${usuario} ha sido contratado como 🆕 RECLUTA.`);

    } catch (err) {
      console.log(err);
      return interaction.reply("❌ Error al contratar usuario.");
    }
  }

  // ================= ANUNCIO =================
  if (interaction.isChatInputCommand() && interaction.commandName === "anuncio") {

    const mensaje = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setTitle("📢 ANUNCIO OFICIAL")
      .setDescription(mensaje)
      .setColor("Blue")
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

});

// ---------------- LOGIN ----------------

client.login(process.env.TOKEN);
