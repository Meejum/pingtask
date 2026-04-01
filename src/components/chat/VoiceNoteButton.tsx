import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { startRecording, stopRecording, cancelRecording, formatDuration } from '../../services/voiceService';
import { spacing, typography } from '../../constants';

interface VoiceNoteButtonProps {
  onRecorded: (uri: string, durationMs: number) => void;
}

export default function VoiceNoteButton({ onRecorded }: VoiceNoteButtonProps) {
  const colors = useThemeStore((s) => s.colors);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = async () => {
    const started = await startRecording();
    if (!started) return;

    setIsRecording(true);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1000);
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ).start();
  };

  const handlePressOut = async () => {
    if (!isRecording) return;

    if (timerRef.current) clearInterval(timerRef.current);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    if (duration < 1000) {
      // Too short — cancel
      await cancelRecording();
      setIsRecording(false);
      return;
    }

    const result = await stopRecording();
    setIsRecording(false);

    if (result) {
      onRecorded(result.uri, result.durationMs);
    }
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingInfo}>
          <View style={[styles.recordDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.timer, { color: colors.error }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      )}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.micButton,
            { backgroundColor: isRecording ? colors.error : colors.surfaceVariant },
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <Ionicons
            name="mic"
            size={20}
            color={isRecording ? '#FFFFFF' : colors.textTertiary}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timer: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
