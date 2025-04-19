
# rielyJS
rielyJS is a development utility to help you make a discord bot with slash commands so much easier.


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
module.exports = {
    name: "say",
    description: "say what you want", 
    isSlash: true,
    allowMsg: false, // allow message commands
    // slashInfo: [],
    // Use slashInfo for options eg options: [
    //        {
    //            type: 'String',
    //            name: 'insertstring',
    //            description: 'Target user',
    //            required: true,
    //        }
    //   ]
    execute(interaction, bot){
        // do all of that
    }
}
```

igor stinky :(
