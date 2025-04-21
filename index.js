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

function getAllCommandFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(filePath));
    } else if (file.endsWith(".js")) {
      results.push(filePath);
    }
  });
  return results;
}

async function registerSlashCommands(client, commandsDirectory) {
  if (!fs.existsSync(commandsDirectory)) {
    return console.warn(
      "The provided commands directory is invalid, command handling will be disabled, but Riley.JS should function as expected."
    );
  }

  let commands = [];
  let devCommands = [];
  let loadedCount = 0;

  const commandFiles = getAllCommandFiles(commandsDirectory);

  for (const filePath of commandFiles) {
    const command = require(filePath);
    let slashCommand = new SlashCommandBuilder()
      .setName(command.name)
      .setDescription(command.description);

    if (command.slashInfo) {
      for (const opt of command.slashInfo) {
        switch (opt.type) {
          case 'string':
            slashCommand.addStringOption(o => {
              o.setName(opt.name)
                .setDescription(opt.description || 'No description')
                .setRequired(opt.required || false);
              return o;
            });
            break;
          case 'integer':
            slashCommand.addIntegerOption(o => {
              o.setName(opt.name)
                .setDescription(opt.description || 'No description')
                .setRequired(opt.required || false);
              if (opt.choices) {
                for (const choice of opt.choices) {
                  o.addChoices({ name: choice.name, value: choice.value });
                }
              }
              return o;
            });
            break;
          case 'boolean':
            slashCommand.addBooleanOption(o =>
              o.setName(opt.name)
                .setDescription(opt.description || 'No description')
                .setRequired(opt.required || false)
            );
            break;
          case 'user':
            slashCommand.addUserOption(o =>
              o.setName(opt.name)
                .setDescription(opt.description || 'No description')
                .setRequired(opt.required || false)
            );
            break;
          case 'channel':
            slashCommand.addChannelOption(o =>
              o.setName(opt.name)
                .setDescription(opt.description || 'No description')
                .setRequired(opt.required || false)
            );
            break;
          case 'role':
            slashCommand.addRoleOption(o =>
              o.setName(opt.name)
                .setDescription(opt.description || 'No description')
                .setRequired(opt.required || false)
            );
            break;
          default:
            console.warn(`Unknown option type: ${opt.type}`);
        }
      }
    }

    if (command.isSlash && !command.dev) commands.push(slashCommand.toJSON());
    if (command.dev) devCommands.push(slashCommand.toJSON());
    client.commands.set(command.name, command);
    loadedCount++;
  }

  console.log(`Loaded ${loadedCount} commands from ${commandsDirectory}`);

  const rest = new REST({ version: "9" }).setToken(client.token);
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");

    if (devCommands.length >= 1 && client.devID) {
      console.log("Started refreshing developer application (/) commands.");
      await rest.put(Routes.applicationGuildCommands(client.user.id, client.devID), {
        body: devCommands,
      });
      console.log("Successfully reloaded developer application (/) commands.");
    }
  } catch (error) {
    console.error(error);
  }
}

async function init(client, settings) {
  if (!client) throw "You need to provide a client in the init() function!";
  if (!settings.devGuild) console.warn("You didn't provide a developer guild. No dev commands will be registered. All other commands will work as expected.")
  client.commands = new Collection();
  client.devID = settings.devGuild
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
        await command.execute(message, client, args);
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
