require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

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
    .setDescription("Enviar anuncio")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje")
        .setRequired(true)
    )

].map(c => c.toJSON());

// ---------------- REGISTRO ----------------

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );
})();

// ---------------- READY ----------------

client.once("ready", () => {
  console.log(`🧹 Bot online como ${client.user.tag}`);
});

// ---------------- INTERACCIONES ----------------

client.on("interactionCreate", async interaction => {

  // ================= CONTRATAR =================
  if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

    const usuario = interaction.options.getUser("usuario");
    const member = await interaction.guild.members.fetch(usuario.id);

    // 🔥 CAMBIO IMPORTANTE AQUÍ
    const role = interaction.guild.roles.cache.find(r => r.name === "🆕 RECLUTA");

    if (!role) {
      return interaction.reply("❌ No existe el rol '🆕 RECLUTA'");
    }

    await member.roles.add(role);

    interaction.reply(`🧑‍💼 ${usuario} ha sido contratado como 🆕 RECLUTA.`);
  }

  // ================= ANUNCIO =================
  if (interaction.isChatInputCommand() && interaction.commandName === "anuncio") {

    const mensaje = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setTitle("📢 ANUNCIO OFICIAL")
      .setDescription(mensaje)
      .setColor("Blue")
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }

});

// ---------------- LOGIN ----------------

client.login(process.env.TOKEN);
