import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '@/commands/command';

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute: async function (
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    await interaction.reply('Pong!');
  },
};
