const {
  Client,
  IntentsBitField,
  Collection,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const embeds = require("./embeds.js")
const fs = require("fs");

async function registerSlashCommands(client, commandsDirectory) {
  if (!fs.existsSync(commandsDirectory)) {
    return console.warn(
      "The provided commands directory is invalid, command handling will be disabled, but Riley.JS should function as expected."
    );
  }
  const commands = [];
  const commandFiles = fs
    .readdirSync(commandsDirectory)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`${commandsDirectory}/${file}`);
    let slashCommand = new SlashCommandBuilder()
      .setName(command.name)
      .setDescription(command.description);

    if (command.slashInfo) {
      for (const opt of command.slashInfo) {
        const option = slashCommand[`add${opt.type}Option`]((o) =>
          o
            .setName(opt.name)
            .setDescription(opt.description || "No description")
            .setRequired(opt.required || false)
            .addChoices?.(
              ...(opt.choices || []).map((choice) => ({
                name: choice.name,
                value: choice.value,
              }))
            )
        );
      }
    }
    if (command.isSlash) commands.push(command);
    client.commands.set(command.name, command);
  }
  const rest = new REST({ version: "9" }).setToken(client.token);
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

async function init(client, settings) {
  if (!client) throw "You need to provide a client in the init() function!";
  client.commands = new Collection();
  // Event Handler
  const { commandsDirectory = false, eventsDirectory = false } = settings;
  // this is aids ^^
  if (eventsDirectory) {
    if (!fs.existsSync(eventsDirectory)) {
      return console.warn(
        "The provided events directory is invalid, event handling will be disabled, but Riley.JS will function as expected."
      );
    }
    for (const file of fs.readdirSync(eventsDirectory)) {
      const event = require(`${eventsDirectory}/${file}`);
      client.on(file.split(".js")[0], (...args) =>
        event.execute(client, ...args)
      );
    }
  }

  // Command Handler
  if (commandsDirectory) {
    await registerSlashCommands(client, commandsDirectory);
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    });

    client.on("messageCreate", async (message) => {
        if (message.author.bot || !message.content.startsWith(settings.prefix || "-")) return;
      
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
      
        const command = client.commands.get(commandName);
        if (!command || !command.allowMsg) return;
      
        try {
          await command.execute(message, args, client);
        } catch (error) {
          console.error(error);
          message.reply("There was an error while executing this command!");
        }
      });
  }

  client.on("ready", () => {
    console.log(`Riely.JS has logged in as ${client.user.tag}`);
  });
}
module.exports = {
  init,
  embeds
};
