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
  .setDescription(
`> **Bienvenido a la empresa de limpieza.**
>
> Nuestro objetivo es ofrecer un servicio profesional, organizado y de calidad.
> El cumplimiento de estas normas es obligatorio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 🏢┃NORMAS GENERALES

1. Respeto obligatorio  
2. Prohibido toxicidad o conflictos  
3. Uso correcto de canales  
4. Prohibido spam o flood  
5. Respeto a superiores  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 👷┃SERVICIO

• Realiza tareas correctamente  
• No abandones sin avisar  
• Actitud profesional siempre  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 💰┃PAGOS

• Gestionados por CEO  
• Basados en rendimiento  
• Sin reclamaciones constantes  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );

const rulesButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("accept_rules")
    .setLabel("Aceptar normas")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅")
);

// ================= INFO =================

const infoEmbed = new EmbedBuilder()
  .setTitle("📘┃INFORMACIÓN INTERNA — PRESTIGE CLEAN")
  .setColor("Blue")
  .setDescription(
`> Información importante de funcionamiento interno.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚗 VEHÍCULOS  
• Devolver reparados y con gasolina  
• Guardados en el garaje  
⚠️ Penalización si no se cumple  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PAGOS  
• 35 puntos = 60.000$  
• Pago quincenal (15 días)  
• /pago + captura obligatoria en canal de comprobantes 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 ENCARGOS  
• 1 persona por encargo  
• Prohibido trabajar en grupo  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PRIORIDAD  
• Actividades primero  
• Encargos después  

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 REPORTES  
• Obligatorio comunicar si has sido reportado ic en el canal de reportes para no agravar las consecuencias a la empresa`
  );

// ================= COMANDOS =================

const commands = [

  new SlashCommandBuilder()
    .setName("pago")
    .setDescription("Registrar pago")
    .addUserOption(o =>
      o.setName("empleado").setDescription("Empleado").setRequired(true))
    .addStringOption(o =>
      o.setName("servicio").setDescription("Servicio").setRequired(true))
    .addStringOption(o =>
      o.setName("cantidad").setDescription("Cantidad").setRequired(true)),

  new SlashCommandBuilder()
    .setName("contratar")
    .setDescription("Contratar empleado")
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario").setRequired(true)),

  new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Enviar anuncio")
    .addStringOption(o =>
      o.setName("mensaje").setDescription("Mensaje").setRequired(true)),

  new SlashCommandBuilder()
    .setName("normas")
    .setDescription("Mostrar normas"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información interna")

].map(c => c.toJSON());

// ================= REGISTRO =================

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

// ================= READY =================

client.once("ready", () => {
  console.log(`🧹 Bot online como ${client.user.tag}`);
});

// ================= INTERACCIONES =================

client.on("interactionCreate", async interaction => {

  try {

    // ================= CONTRATAR =================
    if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

      await interaction.deferReply();

      const usuario = interaction.options.getUser("usuario");
      const member = await interaction.guild.members.fetch(usuario.id);

      const recluta = interaction.guild.roles.cache.find(r => r.name === "🆕 RECLUTA");
      const ciudadano = interaction.guild.roles.cache.find(r => r.name === "🧑‍🤝‍🧑 CIUDADANO");

      if (!recluta) return interaction.editReply("❌ Falta rol RECLUTA");

      await member.roles.add(recluta);
      if (ciudadano) await member.roles.add(ciudadano);

      return interaction.editReply(`🧑‍💼 ${usuario.tag} contratado como RECLUTA`);
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

    // ================= BOTÓN =================
    if (interaction.isButton()) {

      if (interaction.customId === "accept_rules") {

        const role = interaction.guild.roles.cache.find(r => r.name === "🧑‍🤝‍🧑 CIUDADANO");

        if (!role) return interaction.reply({ content: "❌ Rol no existe", ephemeral: true });

        await interaction.member.roles.add(role);

        return interaction.reply({
          content: "✅ Normas aceptadas",
          ephemeral: true
        });
      }
    }

  } catch (err) {
    console.log(err);

    if (!interaction.replied) {
      return interaction.reply({ content: "❌ Error interno", ephemeral: true });
    }
  }
});

// ================= LOGIN =================

client.login(process.env.TOKEN);
