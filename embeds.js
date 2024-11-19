const discord = require(`discord.js`)

const InvalidPermissions = new discord.EmbedBuilder()
InvalidPermissions.setTitle(`Invalid Permissions`)
InvalidPermissions.setColor(`Red`)
InvalidPermissions.setDescription(`You don't have the correct permissions to execute that command!`)
InvalidPermissions.setTimestamp()

const MentionMissing = new discord.EmbedBuilder()
MentionMissing.setTitle(`Missing User!`)
MentionMissing.setColor(`Red`)
MentionMissing.setDescription(`You need to add a user to use this command!`)
MentionMissing.setTimestamp()

const EmbedTemplate = discord.EmbedBuilder()
EmbedTemplate.setTitle("Title")
EmbedTemplate.setColor("Random")
EmbedTemplate.setDescription("Embed Description")
EmbedTemplate.setTimestamp()

module.exports = { InvalidPermissions, MentionMissing }