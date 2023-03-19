import { Config } from "./src/Config";

const { REST, Routes } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');
let config: Config;
const configPath = path.join(__dirname, "config.json");

config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname,'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		for (const guild in config.Guilds){
			const guildID = config.Guilds[guild].id;
			const data = await rest.put(
				Routes.applicationGuildCommands(config.clientID, guildID),
				{ body: commands },
			);
			console.log(`Successfully reloaded ${data.length} application (/) commands in guild ${guildID}.`);
		}

		
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
