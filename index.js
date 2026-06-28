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

// ================= NORMAS SYSTEM (MEJORADO) =================

const rulesEmbed = new EmbedBuilder()
  .setTitle("📜┃NORMATIVA OFICIAL — PRESTIGE CLEAN")
  .setColor("Grey")
  .setDescription(
`> **Bienvenido a la empresa de limpieza.**
>
> En Prestige Clean trabajamos con un estándar profesional, organizado y serio.
> Estas normas garantizan el correcto funcionamiento de la empresa.
>
> ⚠️ El desconocimiento de las normas no exime de su cumplimiento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 🏢┃NORMAS GENERALES

**1.** El respeto es obligatorio hacia cualquier miembro de la empresa.

**2.** Queda prohibido cualquier tipo de conflicto, insulto o comportamiento tóxico dentro o fuera del servicio.

**3.** El uso de los canales de Discord debe ser exclusivo para su finalidad.

**4.** Está prohibido el spam, flood o contenido ajeno a la empresa.

**5.** Todas las decisiones de CEO y Supervisores deben respetarse en todo momento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 👷┃NORMAS DURANTE EL SERVICIO

🧹 Las tareas asignadas deben realizarse correctamente y con responsabilidad.

🚛 No está permitido abandonar un servicio una vez iniciado sin aviso previo.

🤝 Mantén siempre una actitud profesional con ciudadanos y otras organizaciones.

❌ Está prohibido el uso de recursos de la empresa para beneficio personal.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 💰┃PAGOS

✔ Los pagos serán gestionados exclusivamente por un CEO.

✔ No se permite insistir ni reclamar pagos de forma constante.

✔ Cualquier incidencia deberá comunicarse por los canales oficiales.

✔ Los pagos dependerán del trabajo realizado y su validación.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 🎙┃USO DE CANALES DE VOZ

🔊 Mantén siempre un ambiente respetuoso.

🎤 Evita gritos, interrupciones o comportamientos molestos.

🚫 No entres en canales privados sin autorización.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 🚫┃PROHIBICIONES

❌ Suplantar la identidad de otros miembros.

❌ Filtrar información interna de la empresa.

❌ Falsificar trabajos, pagos o actividades.

❌ Desobedecer a un superior sin motivo justificado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ⚠┃SANCIONES

Dependiendo de la gravedad del incumplimiento:

🟡 Advertencia verbal  
🟠 Suspensión temporal  
🔴 Expulsión de la empresa  

Los CEO podrán aplicar medidas adicionales si lo consideran necesario.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ✅┃ACEPTACIÓN

Permanecer en este servidor implica la aceptación total de estas normas.

El desconocimiento de las normas no exime de su cumplimiento.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🧹 PRESTIGE CLEAN**
*Profesionalidad • Organización • Compromiso*`
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
    .setDescription("Mostrar normativa oficial de la empresa")

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

  // ================= BOTÓN NORMAS =================
  if (interaction.isButton()) {

    if (interaction.customId === "accept_rules") {

      const role = interaction.guild.roles.cache.find(r => r.name === "Ciudadano");

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

  // (RESTO DE TU CÓDIGO SE MANTIENE IGUAL, NO LO TOCO)

});

client.login(process.env.TOKEN);
