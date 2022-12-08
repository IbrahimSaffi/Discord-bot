// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
require('dotenv').config(); //initialize dotenv
const ping = require("./commands/tweet")
// Create a new client instance

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

client.login(process.env.BOT_TOKEN); //login bot using token
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}
let commands = []
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
async function awaitFunc() {
	await rest.put(
		Routes.applicationCommands("1040485150737309708"),
		{ body: commands },
	);

}
awaitFunc()
client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

let awaitingCommand = false
let channels = ["1045587188039037018"]
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	let channel = client.channels.cache.get('1045575290031710248');
	let messages = await channel.messages.fetch()
	let numberOfMessages = Array.from(messages).length
	setInterval(async () => {
		let latestFetch = await channel.messages.fetch()
		let latestMessagesList = Array.from(latestFetch);
		let latestMessage = latestMessagesList[0][1].content
		let isBot = latestMessagesList[0][1].author.bot
		if(latestMessagesList.length>numberOfMessages&&!isBot){
			if(awaitingCommand&&latestMessage!=="Reply with channel ID (Bot must be member of channel's server)"){
				console.log(latestMessage)
				awaitingCommand = !awaitingCommand
				channels.push(latestMessage)
				channel.send("Channel Added")
			}
			else{
				channels.forEach(channel=>client.channels.cache.get(channel).send(latestMessage))
			}
			console.log(latestMessage)
		}
		numberOfMessages = latestMessagesList.length

	}, 5000, channel)
});
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
		awaitingCommand = true
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

