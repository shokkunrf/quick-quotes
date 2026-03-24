import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '@/commands/command';
import { read } from '@/services/database';
import crypto from 'crypto';
import { ENCRYPTION_KEY } from '@/config';

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
    const documents = await read(
      interaction.guildId ?? '',
      time,
      interaction.user.id
    );

    if (documents.length === 0) {
      const t = getDateString(time);
      await interaction.reply({
        content: `[~${t}]: No records within 24 hours`,
        ephemeral: true,
      });
      return;
    }

    let message = '';
    for (const doc of documents) {
      const t = getDateString(new Date(doc.time));
      const name = interaction.guild?.members.cache.get(
        doc.userID
      )?.displayName;

      let displayText: string;
      if (typeof doc.text === 'object' && doc.text !== null) {
        if (ENCRYPTION_KEY) {
          try {
            const key = Buffer.from(ENCRYPTION_KEY, 'hex');
            const decipher = crypto.createDecipheriv(
              'aes-256-gcm',
              key,
              Buffer.from(doc.text.iv, 'base64')
            );
            decipher.setAuthTag(Buffer.from(doc.text.tag, 'base64'));
            let decrypted = decipher.update(doc.text.data, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            displayText = decrypted;
          } catch (e) {
            console.error('Decryption failed:', e);
            displayText = '[Encrypted Message]';
          }
        } else {
          displayText = '[Encrypted Message]';
        }
      } else {
        displayText = String(doc.text);
      }

      message += `[${t}] ${name}:\n> ${displayText}\n`;
    }

    if (message.length > 2000) {
      message = message.slice(0, 1997) + '...';
    }
    await interaction.reply({ content: message, ephemeral: true });
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
