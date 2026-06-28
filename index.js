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
  .setDescription(
`> **Bienvenido a la empresa de limpieza.**
> Nuestro objetivo es mantener un servicio profesional, organizado y de calidad.
> El cumplimiento de estas normas es obligatorio.

━━━━━━━━━━━━━━━━━━━━━━

🏢 **Normas generales**
• Respeto obligatorio
• Sin toxicidad ni conflictos
• Uso correcto de canales

👷 **Servicio**
• Completar tareas asignadas
• Avisar si no puedes asistir
• Mantener actitud profesional

💰 **Pagos**
• Gestionados solo por CEO
• Sin reclamaciones constantes

🚫 **Prohibiciones**
• Spam / filtraciones / suplantación
• Mal uso de recursos

⚠️ **Sanciones**
Advertencia → Suspensión → Expulsión

━━━━━━━━━━━━━━━━━━━━━━`
  );

const rulesButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("accept_rules")
    .setLabel("Aceptar normas")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅")
);

// ---------------- COMANDOS ----------------

const commands = [

  new SlashCommandBuilder()
    .setName("pago")
    .setDescription("Registrar pago")
    .addUserOption(o =>
      o.setName("empleado")
        .setDescription("Empleado")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("servicio")
        .setDescription("Servicio")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("contratar")
    .setDescription("Contratar empleado")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
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
    .setDescription("Mostrar normas del servidor")

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

// ---------------- READY + ACTIVIDADES ----------------

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

  // ================= NORMAS COMMAND =================
  if (interaction.isChatInputCommand() && interaction.commandName === "normas") {

    return interaction.reply({
      embeds: [rulesEmbed],
      components: [rulesButton]
    });
  }

  // ================= PAGO =================
  if (interaction.isChatInputCommand() && interaction.commandName === "pago") {

    try {

      const empleado = interaction.options.getUser("empleado");
      const servicio = interaction.options.getString("servicio");
      const cantidad = interaction.options.getString("cantidad");

      const embed = new EmbedBuilder()
        .setTitle("💰 NUEVO PAGO")
        .addFields(
          { name: "Empleado", value: `${empleado}`, inline: true },
          { name: "Servicio", value: servicio, inline: true },
          { name: "Cantidad", value: cantidad, inline: true },
          { name: "Estado", value: "🟡 Pendiente" }
        )
        .setColor("Yellow");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("pagado")
          .setLabel("Pagado")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("rechazado")
          .setLabel("Rechazado")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });

    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "❌ Error en pago",
        ephemeral: true
      });
    }
  }

  // ================= BOTONES =================
  if (interaction.isButton()) {

    try {

      // ================= ACEPTAR NORMAS =================
      if (interaction.customId === "accept_rules") {

        const role = interaction.guild.roles.cache.find(
          r => r.name === "Ciudadano"
        );

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

      // ================= PAGOS BOTONES =================
      let estado = "🟡 Pendiente";

      if (interaction.customId === "pagado") estado = "🟢 Pagado";
      if (interaction.customId === "rechazado") estado = "🔴 Rechazado";

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      embed.data.fields = embed.data.fields.map(f => {
        if (f.name === "Estado") {
          return { name: "Estado", value: estado };
        }
        return f;
      });

      return interaction.update({ embeds: [embed] });

    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "❌ Error en botón",
        ephemeral: true
      });
    }
  }

  // ================= CONTRATAR =================
  if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

    try {

      const usuario = interaction.options.getUser("usuario");
      const member = await interaction.guild.members.fetch(usuario.id);

      const role = interaction.guild.roles.cache.find(r => r.name === "🆕 RECLUTA");

      if (!role) return interaction.reply("❌ Rol no encontrado");

      await member.roles.add(role);

      return interaction.reply(`🧑‍💼 ${usuario} contratado`);

    } catch (err) {
      console.log(err);
      return interaction.reply({
        content: "❌ Error contratar",
        ephemeral: true
      });
    }
  }

  // ================= ANUNCIO =================
  if (interaction.isChatInputCommand() && interaction.commandName === "anuncio") {

    const mensaje = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setTitle("📢 ANUNCIO")
      .setDescription(mensaje)
      .setColor("Blue");

    return interaction.reply({ embeds: [embed] });
  }

});

// ---------------- LOGIN ----------------

client.login(process.env.TOKEN);
