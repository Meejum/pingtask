import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { playVoiceNote, formatDuration } from '../../services/voiceService';
import { spacing, typography, layout } from '../../constants';

interface VoiceNoteBubbleProps {
  mediaUrl: string;
  durationMs?: number;
}

export default function VoiceNoteBubble({ mediaUrl, durationMs = 0 }: VoiceNoteBubbleProps) {
  const colors = useThemeStore((s) => s.colors);
  const [playing, setPlaying] = useState(false);
  const [stopFn, setStopFn] = useState<(() => Promise<void>) | null>(null);

  const handlePlay = async () => {
    if (playing && stopFn) {
      await stopFn();
      setPlaying(false);
      setStopFn(null);
      return;
    }

    try {
      setPlaying(true);
      const { stop } = await playVoiceNote(mediaUrl);
      setStopFn(() => stop);
      // Auto-stop after duration
      setTimeout(async () => {
        try { await stop(); } catch {}
        setPlaying(false);
        setStopFn(null);
      }, durationMs || 60000);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlay} style={[styles.playBtn, { backgroundColor: colors.accentLight }]}>
        <Ionicons name={playing ? 'pause' : 'play'} size={16} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Waveform placeholder */}
      <View style={styles.waveform}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                backgroundColor: playing ? colors.accentLight : colors.textTertiary,
                height: 4 + Math.random() * 16,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.duration, { color: colors.textTertiary }]}>
        {formatDuration(durationMs)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 180,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  duration: {
    fontSize: typography.fontSize.xs,
    minWidth: 30,
    textAlign: 'right',
  },
});
