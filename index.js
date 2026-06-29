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
  .setDescription(`... (TU MENSAJE DE NORMAS IGUAL QUE LO TIENES) ...`);

const rulesButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("accept_rules")
    .setLabel("Aceptar normas")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅")
);

// ================= INFO SYSTEM (NUEVO) =================

const infoEmbed = new EmbedBuilder()
  .setTitle("📘┃INFORMACIÓN INTERNA — PRESTIGE CLEAN")
  .setColor("Blue")
  .setDescription(
`> **Información importante sobre el funcionamiento interno de la empresa.**
> Todos los empleados deben conocer y cumplir estas normas operativas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚗┃USO DE VEHÍCULOS

• Los vehículos deben devolverse siempre:
  - Reparados  
  - Con gasolina llena  
  - Guardados en el garaje  

⚠️ Abandonar o dañar un vehículo conlleva penalización.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰┃SISTEMA DE PAGOS

• 35 puntos = 60.000$  
• Pago cada 15 días (quincenal)  

📌 Obligatorio:
• Usar /pago  
• Subir captura del tabulador con puntos  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦┃ENCARGOS

• Solo una persona por encargo  
• Prohibido trabajar en grupo  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊┃PRIORIDAD

• Primero actividades diarias  
• Encargos sin límite de tiempo  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨┃REPORTES

• Todos los problemas deben reportarse en el canal oficial  
• Obligatorio notificar incidencias  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ El desconocimiento no exime de cumplimiento`
  );

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
    .setDescription("Enviar anuncio a la empresa")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje del anuncio")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("normas")
    .setDescription("Mostrar normativa oficial de la empresa"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información interna de la empresa")

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
      embeds: [infoEmbed],
      ephemeral: false
    });
  }

  // ================= BOTÓN NORMAS =================
  if (interaction.isButton()) {

    if (interaction.customId === "accept_rules") {

      const role = interaction.guild.roles.cache.find(r => r.name === "🧑‍🤝‍🧑 CIUDADANO");

      if (!role) {
        return interaction.reply({
          content: "❌ Rol 'Ciudadano' no encontrado",
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
        content: "✅ Normas aceptadas correctamente. Bienvenido a Prestige Clean.",
        ephemeral: true
      });
    }
  }

});

client.login(process.env.TOKEN);
