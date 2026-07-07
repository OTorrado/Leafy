import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarding } from '@/components/onboarding-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestNotificationPermission } from '@/lib/notifications';
import { OnboardingAnswers } from '@/lib/onboarding';

type QuestionStep = {
  kind: 'question';
  field: keyof OnboardingAnswers;
  question: string;
  options: { value: string; label: string; emoji: string }[];
};

type InfoStep = { kind: 'welcome' | 'affirmation' | 'notifications' };

type Step = QuestionStep | InfoStep;

const LEAFY_INTRO = require('@/assets/images/leafy-gif/leafy-model-intro.mp4');

const STEPS: Step[] = [
  { kind: 'welcome' },
  {
    kind: 'question',
    field: 'location',
    question: 'Where do you keep most of your plants?',
    options: [
      { value: 'indoor', label: 'Indoors', emoji: '🪴' },
      { value: 'outdoor', label: 'Outdoors', emoji: '🌳' },
      { value: 'both', label: 'A bit of both', emoji: '🌱' },
    ],
  },
  {
    kind: 'question',
    field: 'forgetsWatering',
    question: 'Do you often forget when to water them?',
    options: [
      { value: 'always', label: 'All the time', emoji: '😅' },
      { value: 'sometimes', label: 'Sometimes', emoji: '🤔' },
      { value: 'never', label: 'Never, I’ve got a system', emoji: '💪' },
    ],
  },
  {
    kind: 'question',
    field: 'careConfidence',
    question: 'Do you know if they get enough water and sun?',
    options: [
      { value: 'confident', label: 'I’m pretty confident', emoji: '☀️' },
      { value: 'unsure', label: 'Not really sure', emoji: '🤷' },
      { value: 'no_idea', label: 'Honestly, no idea', emoji: '😬' },
    ],
  },
  {
    kind: 'question',
    field: 'seeksHelp',
    question: 'Do you look for ways to keep your plants alive?',
    options: [
      { value: 'yes', label: 'All the time', emoji: '🔍' },
      { value: 'sometimes', label: 'Now and then', emoji: '🌿' },
      { value: 'no', label: 'Not really', emoji: '🙅' },
    ],
  },
  {
    kind: 'question',
    field: 'overwhelmed',
    question: 'Do you feel overwhelmed by plant advice online?',
    options: [
      { value: 'yes', label: 'Yes, totally', emoji: '🌊' },
      { value: 'a_bit', label: 'A little', emoji: '😵' },
      { value: 'no', label: 'Not really', emoji: '😌' },
    ],
  },
  { kind: 'affirmation' },
  { kind: 'notifications' },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;
  const { answers, updateAnswers, finish } = useOnboarding();

  const player = useVideoPlayer(LEAFY_INTRO, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const goNext = () => {
    if (isLast) return;
    setIndex((i) => i + 1);
  };

  const goBack = () => setIndex((i) => Math.max(0, i - 1));

  const complete = async () => {
    setBusy(true);
    await finish();
    // Route guard in the root layout flips to the main app automatically.
  };

  const handleEnableReminders = async () => {
    setBusy(true);
    await requestNotificationPermission();
    await finish();
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProgressBar current={index} total={STEPS.length} tint={tint} />

        <View style={styles.body}>
          {step.kind === 'welcome' && (
            <View style={styles.centered}>
              <VideoView
                player={player}
                style={styles.character}
                contentFit="contain"
                nativeControls={false}
              />
              <ThemedText type="title" style={styles.centerText}>
                Welcome to Leafy
              </ThemedText>
              <ThemedText style={[styles.centerText, styles.muted]}>
                Identify your plants, learn exactly how to care for them, and never forget to water
                again. Let’s get to know you first.
              </ThemedText>
            </View>
          )}

          {step.kind === 'question' && (
            <View style={styles.question}>
              <ThemedText type="title" style={styles.questionText}>
                {step.question}
              </ThemedText>
              <View style={styles.options}>
                {step.options.map((opt) => {
                  const selected = answers[step.field] === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        updateAnswers({ [step.field]: opt.value } as Partial<OnboardingAnswers>);
                        goNext();
                      }}
                      style={[
                        styles.option,
                        { borderColor: selected ? tint : Colors[scheme].icon + '55' },
                        selected && { backgroundColor: tint + '18' },
                      ]}>
                      <ThemedText style={styles.optionEmoji}>{opt.emoji}</ThemedText>
                      <ThemedText type="defaultSemiBold" style={styles.optionLabel}>
                        {opt.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {step.kind === 'affirmation' && (
            <View style={styles.centered}>
              <ThemedText style={styles.hero}>🌿</ThemedText>
              <ThemedText type="title" style={styles.centerText}>
                Leafy’s got you
              </ThemedText>
              <View style={styles.bullets}>
                <Bullet tint={tint} text="Snap a photo to identify any plant instantly" />
                <Bullet tint={tint} text="Get clear, no-nonsense care guides — no rabbit holes" />
                <Bullet tint={tint} text="Smart reminders so watering is never a guess again" />
              </View>
            </View>
          )}

          {step.kind === 'notifications' && (
            <View style={styles.centered}>
              <ThemedText style={styles.hero}>🔔</ThemedText>
              <ThemedText type="title" style={styles.centerText}>
                Never forget to water again
              </ThemedText>
              <ThemedText style={[styles.centerText, styles.muted]}>
                Turn on reminders and Leafy will nudge you right when each plant needs care.
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {step.kind === 'notifications' ? (
            <>
              <PrimaryButton tint={tint} label="Enable reminders" onPress={handleEnableReminders} disabled={busy} />
              <Pressable onPress={complete} disabled={busy} style={styles.skip}>
                <ThemedText style={[styles.skipText, { color: tint }]}>Maybe later</ThemedText>
              </Pressable>
            </>
          ) : step.kind === 'question' ? (
            index > 0 && (
              <Pressable onPress={goBack} style={styles.skip}>
                <ThemedText style={[styles.skipText, { color: Colors[scheme].icon }]}>Back</ThemedText>
              </Pressable>
            )
          ) : (
            <PrimaryButton tint={tint} label="Continue" onPress={goNext} disabled={busy} />
          )}
          {busy && <ActivityIndicator style={styles.busy} color={tint} />}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function ProgressBar({ current, total, tint }: { current: number; total: number; tint: string }) {
  const scheme = useColorScheme() ?? 'light';
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            { backgroundColor: i <= current ? tint : Colors[scheme].icon + '33' },
          ]}
        />
      ))}
    </View>
  );
}

function Bullet({ text, tint }: { text: string; tint: string }) {
  return (
    <View style={styles.bulletRow}>
      <IconSymbol name="leaf.fill" size={20} color={tint} />
      <ThemedText style={styles.bulletText}>{text}</ThemedText>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  tint,
  disabled,
}: {
  label: string;
  onPress: () => void;
  tint: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: tint, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      <ThemedText style={styles.primaryLabel} lightColor="#fff" darkColor="#0b0b0b">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  progressRow: { flexDirection: 'row', gap: 6, paddingVertical: 16 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  body: { flex: 1, justifyContent: 'center' },
  centered: { alignItems: 'center', gap: 16 },
  hero: { fontSize: 72, lineHeight: 84 },
  character: { width: 220, height: 220, backgroundColor: 'transparent' },
  centerText: { textAlign: 'center' },
  muted: { opacity: 0.7 },
  question: { gap: 28 },
  questionText: { textAlign: 'left' },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderWidth: 2,
    borderRadius: 16,
  },
  optionEmoji: { fontSize: 26 },
  optionLabel: { fontSize: 17 },
  bullets: { gap: 16, marginTop: 12, alignSelf: 'stretch' },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletText: { flex: 1, fontSize: 16 },
  footer: { paddingVertical: 16, gap: 4 },
  primary: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryLabel: { fontSize: 17, fontWeight: '700' },
  skip: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 16, fontWeight: '600' },
  busy: { marginTop: 8 },
});
