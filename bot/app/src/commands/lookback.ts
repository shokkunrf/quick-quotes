import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '@/commands/command';
import { read } from '@/services/database';

export const lookback: Command = {
  data: new SlashCommandBuilder()
    .setName('lookback')
    .setDescription('Look back on voice chat')
    .addStringOption((option) => {
      return option
        .setName('datetime')
        .setDescription('date time')
        .setRequired(false);
    }),
  execute: async function (
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    const datetimeString = interaction.options.getString('datetime');

    const time = datetimeString ? new Date(datetimeString) : new Date();
    const documents = await read(interaction.guildId ?? '', time);

    if (documents.length === 0) {
      const t = getDateString(time);
      await interaction.reply(`[~${t}]: No records within 24 hours`);
      return;
    }

    let message = '';
    for (const doc of documents) {
      const t = getDateString(new Date(doc.time));
      const name = interaction.guild?.members.cache.get(
        doc.userID
      )?.displayName;
      message += `[${t}] ${name}:\n> ${doc.text}\n`;
    }
    await interaction.reply(message);
  },
};

function getDateString(date: Date): string {
  // YYYY/MM/DD hh:mm
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}/${String(date.getDate()).padStart(2, '0')} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
