import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { Command } from '@/commands/command';
import { listen } from '@/voice/listen';

const COMMAND_NAME = 'join';
const OPTION_NAME = 'channel';

export const join: Command = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription('Join the voice channel.')
    .addChannelOption((option) => {
      return option
        .setName(OPTION_NAME)
        .setDescription('voice channel')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice);
    }),
  execute: async function (
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    const channel = interaction.options.getChannel(OPTION_NAME);
    if (channel === null || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: 'Selected channel is not voice channel.',
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    if (guild === null) {
      await interaction.reply({
        content: 'Guild is not found.',
        ephemeral: true,
      });
      return;
    }
    const connection = joinVoiceChannel({
      guildId: guild.id,
      channelId: channel.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    listen(connection);

    await interaction.reply('Joined:handshake:');
    await interaction.deleteReply();
  },
};
