import { CacheType, Client, Interaction } from 'discord.js';
import { ping } from '@/commands/ping';
import { join } from '@/commands/join';
import { leave } from '@/commands/leave';
import { Command } from '@/commands/command';

const commands: Command[] = [ping, join, leave];

export async function register(client: Client<true>) {
  const commandData = commands.map((command) => command.data);
  await client.application.commands.set(commandData);
}

export async function interact(interaction: Interaction<CacheType>) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  for (const command of commands) {
    if (command.data.name !== interaction.commandName) {
      continue;
    }

    try {
      await command.execute(interaction);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`[${Date.now()}]` + e.message);
      }
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
    break;
  }
}
