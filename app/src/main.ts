import { Client, Events, GatewayIntentBits } from 'discord.js';
import { DISCORD_BOT_TOKEN } from '@/config';
import { register, interact } from '@/commands';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (client: Client<true>) => {
  await register(client);
  console.log('=== start ===');
});
client.on(Events.InteractionCreate, interact);
client.login(DISCORD_BOT_TOKEN);
