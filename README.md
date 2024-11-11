
# rielyJS



## Usage

index.js
```javascript
const rileyjs = require('rielyjs')
const discord = require('discord.js')

require('dotenv').config()

const bot = new discord.Client({intents: ['Guilds', 'GuildMessages', 'GuildMessageReactions']})

bot.login(process.env.token).then(() =>{
    rileyjs.init({client: bot, commandsDirectory: __dirname+'/commands/', eventsDirectory: __dirname+'/events/'})
})
```

commands/ping.js
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!')
    },
};
```

igor stinky :(
