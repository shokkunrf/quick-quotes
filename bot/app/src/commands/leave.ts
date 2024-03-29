import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { Command } from '@/commands/command';
import { clear } from '@/services/listen';

const COMMAND_NAME = 'leave';

export const leave: Command = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription('Leave the voice channel.'),
  execute: async function (
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    const guild = interaction.guild;
    if (guild === null) {
      await interaction.reply({
        content: 'Guild is not found.',
        ephemeral: true,
      });
      return;
    }

    const connection = getVoiceConnection(guild.id);
    if (connection === undefined) {
      await interaction.reply({
        content: 'VoiceConnection is not found.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply('Please wait...');
    clear(connection);
    connection.destroy();
    await interaction.editReply('Bye:wave:');
    await interaction.deleteReply();
  },
};
