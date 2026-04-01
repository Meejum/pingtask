import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores';
import { spacing, typography, layout } from '../../constants';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    icon: 'chatbubbles',
    title: 'End-to-End Encrypted Chat',
    description: 'Your messages are encrypted before they leave your device. Not even we can read them.',
  },
  {
    icon: 'finger-print',
    title: 'Your Unique PIN Identity',
    description: 'Get a unique 8-character PIN and QR code. Share it to connect — no phone number needed.',
  },
  {
    icon: 'at',
    title: 'Tasks via @Mentions',
    description: 'Type @name followed by a task in any chat. It automatically creates and assigns a task.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Privacy First',
    description: 'Biometric lock, disappearing messages, and full control over who sees your information.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const colors = useThemeStore((s) => s.colors);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
        <Ionicons name={item.icon} size={56} color={colors.accentLight} />
      </View>
      <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? colors.accentLight : colors.surfaceVariant,
                width: i === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        {!isLast && (
          <TouchableOpacity onPress={onComplete}>
            <Text style={[styles.skipText, { color: colors.textTertiary }]}>Skip</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.accentLight }]}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
          <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  slideTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDesc: {
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  skipText: {
    fontSize: typography.fontSize.lg,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: layout.borderRadius.full,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
