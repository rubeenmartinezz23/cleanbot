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

// ---------------- COMANDO /PAGO ----------------

const commands = [
  new SlashCommandBuilder()
    .setName("pago")
    .setDescription("Registrar pago empresa")
    .addUserOption(o =>
      o.setName("empleado").setDescription("Empleado").setRequired(true))
    .addStringOption(o =>
      o.setName("servicio").setDescription("Servicio").setRequired(true))
    .addStringOption(o =>
      o.setName("cantidad").setDescription("Cantidad").setRequired(true))
].map(c => c.toJSON());

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

// ---------------- BOT ON READY ----------------

client.once("ready", () => {
  console.log(`🧹 Online como ${client.user.tag}`);
});

// ---------------- INTERACCIONES ----------------

client.on("interactionCreate", async interaction => {

  // /pago
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "pago") {

      const empleado = interaction.options.getUser("empleado");
      const servicio = interaction.options.getString("servicio");
      const cantidad = interaction.options.getString("cantidad");

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
  }

  // BOTONES
  if (interaction.isButton()) {

    let estado = "";

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
});

client.login(process.env.TOKEN);