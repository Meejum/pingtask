import { Platform } from 'react-native';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

let Audio: any = null;
let recording: any = null;

async function getAudio() {
  if (!Audio) {
    try {
      const mod = await import('expo-av');
      Audio = mod.Audio;
    } catch {
      return null;
    }
  }
  return Audio;
}

/**
 * Request microphone permission and start recording.
 */
export async function startRecording(): Promise<boolean> {
  const audio = await getAudio();
  if (!audio) return false;

  try {
    const { status } = await audio.requestPermissionsAsync();
    if (status !== 'granted') return false;

    await audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: rec } = await audio.Recording.createAsync(
      audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recording = rec;
    return true;
  } catch {
    return false;
  }
}

/**
 * Stop recording and return the local URI.
 */
export async function stopRecording(): Promise<{ uri: string; durationMs: number } | null> {
  if (!recording) return null;

  try {
    await recording.stopAndUnloadAsync();
    const audio = await getAudio();
    if (audio) {
      await audio.setAudioModeAsync({ allowsRecordingIOS: false });
    }

    const uri = recording.getURI();
    const status = await recording.getStatusAsync();
    const durationMs = status.durationMillis || 0;
    recording = null;

    if (!uri) return null;
    return { uri, durationMs };
  } catch {
    recording = null;
    return null;
  }
}

/**
 * Cancel an in-progress recording.
 */
export async function cancelRecording(): Promise<void> {
  if (!recording) return;
  try {
    await recording.stopAndUnloadAsync();
  } catch {}
  recording = null;
}

/**
 * Upload a voice note to Firebase Storage.
 */
export async function uploadVoiceNote(
  conversationId: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = `voice_${Date.now()}.m4a`;
  const storageRef = ref(storage, `voicenotes/${conversationId}/${filename}`);

  const task = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    task.on('state_changed', null, reject, async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      resolve(url);
    });
  });
}

/**
 * Play a voice note from URL.
 */
export async function playVoiceNote(url: string): Promise<{ stop: () => Promise<void> }> {
  const audio = await getAudio();
  if (!audio) throw new Error('Audio not available');

  const { sound } = await audio.Sound.createAsync({ uri: url });
  await sound.playAsync();

  return {
    stop: async () => {
      await sound.stopAsync();
      await sound.unloadAsync();
    },
  };
}

export function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
