import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ApplicationCommandType } from 'discord.js';
import { Config } from '../Config';
module.exports = {
    data: new SlashCommandBuilder().setName('setChannel').setDescription('Target Channel'),
    async execute(interaction: CommandInteraction) {
        if (interaction.isCommand()){            
            Config.setAnnounceChannel(interaction.guildId ?? '', interaction.channelId);
            await interaction.reply({content: `set announce channel to ${interaction.channelId}`, ephemeral: true });
        }
    },
};
