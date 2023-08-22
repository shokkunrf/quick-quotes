import { EndBehaviorType, VoiceConnection } from '@discordjs/voice';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import * as prism from 'prism-media';
import { RECORDING_DIR } from '@/config';
import { publishRecordedMessage } from './publish';

type GuildId = string;
type UserId = string;

const DURATION = 1_000; // ms

// speakers lock
const guildSpeakers = new Map<GuildId, Set<UserId>>();
function getSpeakers(guildId: GuildId): Set<UserId> {
  const speakers = guildSpeakers.get(guildId);
  if (speakers === undefined) {
    const newSpeakers = new Set<UserId>();
    guildSpeakers.set(guildId, newSpeakers);
    return newSpeakers;
  }
  return speakers;
}
function deleteSpeakers(guildId: GuildId): boolean {
  return guildSpeakers.delete(guildId);
}

function getFileName(guildId: GuildId, userId: UserId, time: Date): string {
  return `${guildId}_${time.getTime()}_${userId}.ogg`;
}

// Recorder
export function listen(connection: VoiceConnection) {
  const guildId = connection.joinConfig.guildId;
  const speakers = getSpeakers(guildId);

  // listen start
  connection.receiver.speaking.on('start', (userId: UserId) => {
    if (speakers.has(userId)) {
      return;
    }
    speakers.add(userId);

    const userStream = connection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: DURATION,
      },
    });
    const oggStream = new prism.opus.OggLogicalBitstream({
      opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48000,
      }),
      pageSizeControl: {
        maxPackets: 10,
      },
    });
    const time = new Date();
    const fileName = getFileName(guildId, userId, time);
    const dist = createWriteStream(`${RECORDING_DIR}/${fileName}`);

    pipeline(userStream, oggStream, dist, (err) => {
      if (err) {
        console.warn(`Error '${fileName}': ${err.message}`);
      }
      publishRecordedMessage({
        guildID: guildId,
        userID: userId,
        time,
        fileName,
      });
      speakers.delete(userId);
    });
  });
}

export function clear(connection: VoiceConnection) {
  const guildId = connection.joinConfig.guildId;
  deleteSpeakers(guildId);
}
