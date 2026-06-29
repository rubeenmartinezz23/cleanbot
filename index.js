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

// 🔧 seguridad anti-crash
client.on("error", console.error);
process.on("unhandledRejection", console.error);

// 📢 CANAL ACTIVIDADES
const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID;

// 🧠 ACTIVIDADES
const activities = [
  { hour: 3, minute: 0, name: "Asesoramiento Empresarial" },
  { hour: 12, minute: 0, name: "Asesoramiento Empresarial" },
  { hour: 15, minute: 0, name: "Asesoramiento Empresarial" },

  { hour: 2, minute: 0, name: "Limpieza espacios públicos" },
  { hour: 8, minute: 0, name: "Limpieza espacios públicos" },
  { hour: 14, minute: 0, name: "Limpieza espacios públicos" },
  { hour: 23, minute: 0, name: "Limpieza espacios públicos" },

  { hour: 5, minute: 0, name: "Restablecimiento eléctrico" },
  { hour: 17, minute: 0, name: "Restablecimiento eléctrico" },
  { hour: 20, minute: 0, name: "Restablecimiento eléctrico" },
  { hour: 22, minute: 0, name: "Restablecimiento eléctrico" },

  { hour: 6, minute: 0, name: "Servicio de jardinería" },
  { hour: 0, minute: 0, name: "Servicio de jardinería" },

  { hour: 4, minute: 0, name: "Mantenimiento de gasolineras" },
  { hour: 10, minute: 0, name: "Mantenimiento de gasolineras" },
  { hour: 18, minute: 0, name: "Mantenimiento de gasolineras" },

  { hour: 11, minute: 0, name: "Limpieza de rascacielos" },
  { hour: 21, minute: 0, name: "Limpieza de rascacielos" }
];

let lastSent = "";

// ================= NORMAS SYSTEM =================

const rulesEmbed = new EmbedBuilder()
  .setTitle("📜┃NORMATIVA OFICIAL — PRESTIGE CLEAN")
  .setColor("Grey")
  .setDescription("Normas del servidor... (igual que tu versión anterior)");

const rulesButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("accept_rules")
    .setLabel("Aceptar normas")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅")
);

// ================= INFO SYSTEM =================

const infoEmbed = new EmbedBuilder()
  .setTitle("📘┃INFORMACIÓN INTERNA — PRESTIGE CLEAN")
  .setColor("Blue")
  .setDescription("Información interna... (igual que tu versión anterior)");

// ---------------- COMANDOS ----------------

const commands = [

  new SlashCommandBuilder()
    .setName("pago")
    .setDescription("Registrar pago")
    .addUserOption(o =>
      o.setName("empleado")
        .setDescription("Empleado a pagar")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("servicio")
        .setDescription("Servicio realizado")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad a pagar")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("contratar")
    .setDescription("Contratar empleado")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a contratar")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Enviar anuncio")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("normas")
    .setDescription("Mostrar normas"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información interna")

].map(c => c.toJSON());

// ---------------- REGISTRO ----------------

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

// ---------------- READY ----------------

client.once("ready", () => {
  console.log(`🧹 Bot online como ${client.user.tag}`);
});

// ---------------- INTERACCIONES ----------------

client.on("interactionCreate", async interaction => {

  try {

    // ================= CONTRATAR (FIX REAL) =================
    if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

      await interaction.deferReply(); // 🔥 evita "app no respondió"

      const usuario = interaction.options.getUser("usuario");

      if (!usuario) {
        return interaction.editReply("❌ Usuario no válido");
      }

      const member = await interaction.guild.members.fetch(usuario.id).catch(() => null);

      if (!member) {
        return interaction.editReply("❌ No se pudo encontrar el miembro en el servidor");
      }

      const role = interaction.guild.roles.cache.find(
        r => r.name === "🧑‍🤝‍🧑 CIUDADANO"
      );

      if (!role) {
        return interaction.editReply("❌ Rol 'CIUDADANO' no encontrado");
      }

      if (member.roles.cache.has(role.id)) {
        return interaction.editReply("⚠️ Este usuario ya está contratado");
      }

      await member.roles.add(role);

      return interaction.editReply(`🧑‍💼 ${usuario.tag} ha sido contratado correctamente`);
    }

    // ================= NORMAS =================
    if (interaction.isChatInputCommand() && interaction.commandName === "normas") {
      return interaction.reply({
        embeds: [rulesEmbed],
        components: [rulesButton]
      });
    }

    // ================= INFO =================
    if (interaction.isChatInputCommand() && interaction.commandName === "info") {
      return interaction.reply({
        embeds: [infoEmbed]
      });
    }

    // ================= BOTONES =================
    if (interaction.isButton()) {

      if (interaction.customId === "accept_rules") {

        const role = interaction.guild.roles.cache.find(
          r => r.name === "🧑‍🤝‍🧑 CIUDADANO"
        );

        if (!role) {
          return interaction.reply({
            content: "❌ Rol CIUDADANO no encontrado",
            ephemeral: true
          });
        }

        if (interaction.member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: "⚠️ Ya has aceptado las normas",
            ephemeral: true
          });
        }

        await interaction.member.roles.add(role);

        return interaction.reply({
          content: "✅ Normas aceptadas correctamente",
          ephemeral: true
        });
      }
    }

  } catch (err) {
    console.log("ERROR INTERACTION:", err);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "❌ Ha ocurrido un error interno",
        ephemeral: true
      });
    } else {
      return interaction.editReply("❌ Ha ocurrido un error interno");
    }
  }
});

// ---------------- LOGIN ----------------

client.login(process.env.TOKEN);
