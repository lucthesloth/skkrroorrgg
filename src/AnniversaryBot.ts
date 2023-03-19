import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { Config } from './Config';
import path from 'path';
import * as fs from 'fs/promises';
export class AnniversaryBot {
  public client: Client;
  static instance: AnniversaryBot;
  constructor() {
    AnniversaryBot.instance = this;
    this.client = new Client({
      intents: [GatewayIntentBits.DirectMessages],
    });
    this.registerEvents();
    this.start();
  }
  async start(): Promise<void> {
    await Config.loadConfig();
    await this.client.login(Config.config.token);
  }
  registerEvents() {
    this.client.once(Events.ClientReady, (c) => {
      this.client.commands = new Collection();
      console.log(`Logged in as ${c.user.tag}!`);
      this.loadCommands();
    });
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    });
  }
  async loadCommands(): Promise<void> {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = (await fs.readdir(commandsPath)).filter((file: string) => file.endsWith('.ts'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        this.client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
  async congratulateUsers(players: Promise<String[]>) {
    for (const guildId in Config.config.Guilds) {
      const channel = await this.client.channels.fetch(Config.config.Guilds[guildId].announce ?? '');
      if (channel?.isTextBased()) {
        (await players).forEach((player) => {
          channel.send(`Happy Dominion Anniversary ${player}!`);
        });
      }
    }
  }
}

export const configPath = path.join(__dirname, 'config.json');
