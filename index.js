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

const db = require("./database");

// ---------------- CLIENT ----------------

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ---------------- COMANDOS ----------------

const commands = [

  // 💰 PAGO
  new SlashCommandBuilder()
    .setName("pago")
    .setDescription("Registrar un pago")
    .addUserOption(o =>
      o.setName("empleado")
        .setDescription("Empleado")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("servicio")
        .setDescription("Servicio realizado")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setRequired(true)),

  // 📊 HISTORIAL
  new SlashCommandBuilder()
    .setName("historial")
    .setDescription("Ver últimos pagos"),

  // 🧑‍💼 CONTRATAR
  new SlashCommandBuilder()
    .setName("contratar")
    .setDescription("Contratar empleado")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a contratar")
        .setRequired(true)),

  // 📣 ANUNCIO
  new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Enviar anuncio de empresa")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje del anuncio")
        .setRequired(true))

].map(c => c.toJSON());

// ---------------- REGISTRAR COMANDOS ----------------

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

  // ================= /PAGO =================
  if (interaction.isChatInputCommand() && interaction.commandName === "pago") {

    const empleado = interaction.options.getUser("empleado");
    const servicio = interaction.options.getString("servicio");
    const cantidad = interaction.options.getString("cantidad");

    // GUARDAR EN DB
    db.run(
      "INSERT INTO pagos (empleado, servicio, cantidad, estado) VALUES (?, ?, ?, ?)",
      [empleado.tag, servicio, cantidad, "Pendiente"]
    );

    const embed = new EmbedBuilder()
      .setTitle("💰 NUEVO PAGO")
      .addFields(
        { name: "Empleado", value: `${empleado}` },
        { name: "Servicio", value: servicio },
        { name: "Cantidad", value: cantidad },
        { name: "Estado", value: "🟡 Pendiente" }
      )
      .setColor("Yellow");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("pagado")
        .setLabel("Pagado")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("pendiente")
        .setLabel("Pendiente")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("rechazado")
        .setLabel("Rechazado")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }

  // ================= BOTONES =================
  if (interaction.isButton()) {

    let estado = "Pendiente";

    if (interaction.customId === "pagado") estado = "🟢 Pagado";
    if (interaction.customId === "pendiente") estado = "🟡 Pendiente";
    if (interaction.customId === "rechazado") estado = "🔴 Rechazado";

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    embed.data.fields[3] = {
      name: "Estado",
      value: estado
    };

    await interaction.update({
      embeds: [embed],
      components: interaction.message.components
    });
  }

  // ================= HISTORIAL =================
  if (interaction.isChatInputCommand() && interaction.commandName === "historial") {

    db.all("SELECT * FROM pagos ORDER BY id DESC LIMIT 10", (err, rows) => {

      if (!rows || rows.length === 0) {
        return interaction.reply("No hay pagos registrados.");
      }

      const texto = rows.map(p =>
        `👤 ${p.empleado} | 💰 ${p.cantidad} | 📌 ${p.estado} | 🕒 ${p.fecha}`
      ).join("\n");

      interaction.reply({
        content: "📊 HISTORIAL DE PAGOS:\n\n" + texto,
        ephemeral: true
      });
    });
  }

  // ================= CONTRATAR =================
  if (interaction.isChatInputCommand() && interaction.commandName === "contratar") {

    const usuario = interaction.options.getUser("usuario");

    const member = await interaction.guild.members.fetch(usuario.id);

    const role = interaction.guild.roles.cache.find(r => r.name === "Recluta");

    if (!role) {
      return interaction.reply("❌ No existe el rol 'Recluta'");
    }

    await member.roles.add(role);

    interaction.reply(`🧑‍💼 ${usuario} ha sido contratado como RECLUTA.`);
  }

  // ================= ANUNCIO =================
  if (interaction.isChatInputCommand() && interaction.commandName === "anuncio") {

    const mensaje = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setTitle("📢 ANUNCIO OFICIAL")
      .setDescription(mensaje)
      .setColor("Blue")
      .setFooter({ text: "Empresa RP - Dirección" })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }

});

// ---------------- LOGIN ----------------

client.login(process.env.TOKEN);
