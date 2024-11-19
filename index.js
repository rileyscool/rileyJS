const { Client, IntentsBitField, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const embeds = require('./embeds.js');
const allIntents = new IntentsBitField(3276799);
async function registerSlashCommands(client, commandsDirectory) {
    if (!fs.existsSync(commandsDirectory)) {
        throw "The provided commands directory is invalid!";
    }
    const commands = [];
    const commandFiles = fs.readdirSync(commandsDirectory).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${commandsDirectory}/${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }
    const rest = new REST({ version: '9' }).setToken(client.token);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}
async function init({
                        client,
                        commandsDirectory,
                        eventsDirectory,
                    }) {
    if (!client) throw "You need to provide a client in the init() function!";
    client.riley = this;
    client.commands = new Collection();
    // Event Handler
    if (eventsDirectory) {
        if (!fs.existsSync(eventsDirectory)) {
            throw "The provided events directory is invalid!";
        }
        for (const file of fs.readdirSync(eventsDirectory)) {
            const event = require(`${eventsDirectory}/${file}`);
            client.on(file.split(".js")[0], (...args) => event.execute(client, ...args));
        }
    }
    // Command Handler
    if (commandsDirectory) {
        await registerSlashCommands(client, commandsDirectory);
        // Listen for interactionCreate event
        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    }
    client.on('ready', () => {
        console.log(`Riely.JS has logged in as ${client.user.tag}`);
    });
}
module.exports = {
    init,
    embeds,
    allIntents
};