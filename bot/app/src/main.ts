import { Client, Events, GatewayIntentBits } from 'discord.js';
import { DISCORD_BOT_TOKEN, ENCRYPTION_KEY, DEV_ENVIRONMENT } from '@/config';
import { register, interact } from '@/commands';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
client.once(Events.ClientReady, async (client: Client<true>) => {
  await register(client);

  if (!ENCRYPTION_KEY) {
    if (DEV_ENVIRONMENT === 'local') {
      console.warn(
        '[WARNING] ENCRYPTION_KEY is not set. Logs will be stored in plain text.'
      );
    } else {
      console.warn(
        '[SECURITY WARNING] ENCRYPTION_KEY is not set in a production environment!'
      );
      console.warn(
        'It is strongly recommended to set ENCRYPTION_KEY for privacy protection.'
      );
    }
  } else {
    console.log('[INFO] Encryption is enabled (AES-256-GCM).');
  }

  console.log('=== start ===');
});
client.on(Events.InteractionCreate, interact);
client.login(DISCORD_BOT_TOKEN);
