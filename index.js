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

// 📢 CANAL ACTIVIDADES
const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID;

// 🧠 ACTIVIDADES (HORA ESPAÑA)
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

// 🧠 ANTI DUPLICADOS
let lastSent = "";

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

// ---------------- READY + SISTEMA ACTIVIDADES ----------------

client.once("ready", () => {
  console.log(`🧹 Bot online como ${client.user.tag}`);

  setInterval(async () => {

    const now = new Date();

    // 🇪🇸 HORA ESPAÑA
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

        // 🕒 HORA HUB (España -2h)
        let hubHour = act.hour - 2;
        if (hubHour < 0) hubHour += 24;

        const embed = new EmbedBuilder()
          .setTitle("📢 ACTIVIDAD EMPRESARIAL")
          .setColor("Green")
          .setDescription(
`━━━━━━━━━━━━━━━━━━━━━━

🧹 **Actividad:** ${act.name}

🕒 **Hora HUB:** ${String(hubHour).padStart(2, "0")}:${String(act.minute).padStart(2, "0")}

👷 Todo el personal disponible debe acudir inmediatamente.

━━━━━━━━━━━━━━━━━━━━━━`
          )
          .setFooter({ text: "Sistema automático empresa RP" })
          .setTimestamp();

        channel.send({
          content: "@everyone 📢 Nueva actividad disponible",
          embeds: [embed]
        });

        lastSent = `${act.hour}:${act.minute}`;
      }
    }

  }, 60000);
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
      .setColor("Blue")
      .setDescription(mensaje)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

});

// ---------------- LOGIN ----------------

client.login(process.env.TOKEN);
