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

// ================= NORMAS =================

const rulesEmbed = new EmbedBuilder()
  .setTitle("📜┃NORMATIVA OFICIAL — PRESTIGE CLEAN")
  .setColor("Grey")
  .setDescription("Normas del servidor...");

// ================= INFO =================

const infoEmbed = new EmbedBuilder()
  .setTitle("📘┃INFORMACIÓN INTERNA — PRESTIGE CLEAN")
  .setColor("Blue")
  .setDescription("Información interna...");

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

  setInterval(async () => {

    const now = new Date();

    const madridHours = parseInt(
      now.toLocaleString("en-US", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        hour12: false
      })
    );

    const madridMinutes = parseInt(
      now.toLocaleString("en-US", {
        timeZone: "Europe/Madrid",
        minute: "2-digit"
      })
    );

    for (const act of activities) {

      if (
        act.hour === madridHours &&
        act.minute === madridMinutes &&
        lastSent !== `${act.hour}:${act.minute}`
      ) {

        const channel = client.channels.cache.get(ACTIVITIES_CHANNEL_ID);
        if (!channel) return;

        let hubHour = act.hour - 2;
        if (hubHour < 0) hubHour += 24;

        const embed = new EmbedBuilder()
          .setTitle("📢 ACTIVIDAD EMPRESARIAL")
          .setColor("Green")
          .setDescription(
`━━━━━━━━━━━━━━━━━━━━━━

🧹 Actividad: ${act.name}

🕒 Hora HUB: ${String(hubHour).padStart(2, "0")}:${String(act.minute).padStart(2, "0")}

👷 Todos los empleados deben asistir

━━━━━━━━━━━━━━━━━━━━━━`
          )
          .setTimestamp();

        channel.send({
          content: "@everyone 📢 Actividad disponible",
          embeds: [embed]
        });

        lastSent = `${act.hour}:${act.minute}`;
      }
    }

  }, 60000);
});

// ---------------- INTERACCIONES ----------------

client.on("interactionCreate", async interaction => {

  try {

    // ================= CONTRATAR (FIX + RECLUTA + CIUDADANO) =================
    if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

      await interaction.deferReply();

      const usuario = interaction.options.getUser("usuario");
      const member = await interaction.guild.members.fetch(usuario.id).catch(() => null);

      if (!member) {
        return interaction.editReply("❌ No se pudo encontrar el usuario");
      }

      const reclutaRole = interaction.guild.roles.cache.find(
        r => r.name === "🆕 RECLUTA"
      );

      const ciudadanoRole = interaction.guild.roles.cache.find(
        r => r.name === "🧑‍🤝‍🧑 CIUDADANO"
      );

      if (!reclutaRole) {
        return interaction.editReply("❌ Rol 🆕 RECLUTA no encontrado");
      }

      if (member.roles.cache.has(reclutaRole.id)) {
        return interaction.editReply("⚠️ Este usuario ya es RECLUTA");
      }

      await member.roles.add(reclutaRole);

      if (ciudadanoRole && !member.roles.cache.has(ciudadanoRole.id)) {
        await member.roles.add(ciudadanoRole);
      }

      return interaction.editReply(
        `🧑‍💼 ${usuario.tag} ha sido contratado como 🆕 RECLUTA`
      );
    }

    // ================= NORMAS =================
    if (interaction.isChatInputCommand() && interaction.commandName === "normas") {
      return interaction.reply({
        embeds: [rulesEmbed]
      });
    }

    // ================= INFO =================
    if (interaction.isChatInputCommand() && interaction.commandName === "info") {
      return interaction.reply({
        embeds: [infoEmbed]
      });
    }

  } catch (err) {
    console.log(err);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "❌ Error interno",
        ephemeral: true
      });
    } else {
      return interaction.editReply("❌ Error interno");
    }
  }
});

client.login(process.env.TOKEN);
