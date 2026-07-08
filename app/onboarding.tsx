import { Image } from 'expo-image';
import { SymbolViewProps } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarding } from '@/components/onboarding-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, Colors, DisplayFont } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestNotificationPermission } from '@/lib/notifications';
import { OnboardingAnswers } from '@/lib/onboarding';

type Option = {
  value: string;
  label: string;
  emoji?: string;
  /** Shown under the label in the card variant. */
  description?: string;
  /** Badge icon in the card variant. */
  icon?: SymbolViewProps['name'];
  /** require()'d image for the card variant; falls back to a tinted placeholder. */
  image?: number;
};

type QuestionStep = {
  kind: 'question';
  field: keyof OnboardingAnswers;
  question: string;
  subtitle?: string;
  variant?: 'list' | 'cards' | 'hero';
  /** Hero illustration shown above the question in the 'hero' variant. */
  image?: number;
  options: Option[];
};

type InfoStep = { kind: 'welcome' | 'affirmation' | 'notifications' };

type Step = QuestionStep | InfoStep;

const LEAFY_INTRO = require('@/assets/images/leafy-gif/leafy-model-intro.mp4');

const STEPS: Step[] = [
  { kind: 'welcome' },
  {
    kind: 'question',
    field: 'location',
    question: 'Where is your plant?',
    subtitle: 'This helps us give you the best care tips',
    variant: 'cards',
    options: [
      {
        value: 'indoor',
        label: 'Indoor',
        emoji: '🪴',
        description: 'My plant is inside my home',
        icon: 'house.fill',
        image: require('@/assets/images/onboarding/new-indoor.png'),
      },
      {
        value: 'outdoor',
        label: 'Outdoor',
        emoji: '🌳',
        description: 'My plant is outside in the open',
        icon: 'sun.max.fill',
        image: require('@/assets/images/onboarding/new-outdoor.png'),
      },
    ],
  },
  {
    kind: 'question',
    field: 'unsureWatering',
    variant: 'hero',
    question: 'Are you unsure how much water your plant needs?',
    image: require('@/assets/images/onboarding/forgot-water.png'),
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
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
              <ThemedText style={[styles.centerText, styles.buddyTitle]}>
                Hi, I’m Leafy 🌱
              </ThemedText>
              <ThemedText style={[styles.centerText, styles.buddyBody]}>
                I’ll be your plant buddy — here to help you keep every plant happy and thriving.
                Let’s get to know each other first!
              </ThemedText>
            </View>
          )}

          {step.kind === 'question' &&
            (step.variant === 'cards' ? (
              <ScrollView
                style={styles.cardsScroll}
                contentContainerStyle={styles.cardsContent}
                showsVerticalScrollIndicator={false}>
                <ThemedText
                  type="title"
                  style={[styles.centerText, styles.displayHeading, styles.cardsTitle]}>
                  {step.question}
                </ThemedText>
                {step.subtitle && (
                  <ThemedText style={[styles.centerText, styles.cardsSubtitle]}>
                    {step.subtitle}
                  </ThemedText>
                )}
                <View style={styles.cards}>
                  {step.options.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      option={opt}
                      selected={answers[step.field] === opt.value}
                      onPress={() => {
                        updateAnswers({ [step.field]: opt.value } as Partial<OnboardingAnswers>);
                        goNext();
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            ) : step.variant === 'hero' ? (
              <View style={styles.heroQuestion}>
                {step.image && (
                  <Image source={step.image} style={styles.heroImage} contentFit="contain" />
                )}
                <ThemedText
                  type="title"
                  style={[styles.centerText, styles.displayHeading, styles.heroQuestionText]}>
                  {step.question}
                </ThemedText>
                <View style={styles.yesNoRow}>
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
                          styles.yesNoButton,
                          selected && { backgroundColor: Brand.green },
                        ]}>
                        <ThemedText
                          style={[styles.yesNoLabel, selected && { color: '#ffffff' }]}>
                          {opt.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
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
            ))}

          {step.kind === 'affirmation' && (
            <View style={styles.centered}>
              <ThemedText style={styles.hero}>🌿</ThemedText>
              <ThemedText type="title" style={[styles.centerText, styles.displayHeading]}>
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
              <ThemedText type="title" style={[styles.centerText, styles.displayHeading]}>
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
          ) : step.kind === 'question' ? null : (
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

function OptionCard({
  option,
  selected,
  onPress,
}: {
  option: Option;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View
        style={[
          styles.cardImageWrap,
          !option.image && { backgroundColor: Brand.greenSoft },
          selected && { borderColor: Brand.green },
        ]}>
        {option.image ? (
          <Image source={option.image} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <ThemedText style={styles.cardPlaceholderEmoji}>{option.emoji}</ThemedText>
        )}
      </View>
      <View style={[styles.cardInfo, selected && { borderColor: Brand.green }]}>
        <View style={styles.cardBadge}>
          <IconSymbol name={option.icon ?? 'leaf.fill'} size={26} color={Brand.green} />
        </View>
        <View style={styles.cardText}>
          <ThemedText style={styles.cardLabel}>{option.label}</ThemedText>
          {option.description && (
            <ThemedText style={styles.cardDescription}>{option.description}</ThemedText>
          )}
        </View>
      </View>
    </Pressable>
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
  character: { width: 300, height: 300, backgroundColor: 'transparent' },
  buddyTitle: {
    fontFamily: DisplayFont.semibold,
    fontSize: 30,
    lineHeight: 38,
  },
  buddyBody: {
    fontFamily: DisplayFont.regular,
    fontSize: 18,
    lineHeight: 26,
    opacity: 0.75,
  },
  centerText: { textAlign: 'center' },
  muted: { opacity: 0.7 },
  question: { gap: 28 },
  questionText: { textAlign: 'left', fontFamily: DisplayFont.semibold, lineHeight: 40 },
  displayHeading: { fontFamily: DisplayFont.semibold },
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
  cardsScroll: { flex: 1 },
  cardsContent: { paddingVertical: 8, paddingBottom: 8, gap: 6, flexGrow: 1, justifyContent: 'center' },
  cardsTitle: { fontSize: 28, lineHeight: 34 },
  cardsSubtitle: { fontSize: 16, opacity: 0.6, marginBottom: 8 },
  cards: { gap: 18, marginTop: 4 },
  card: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 1448 / 1086,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholderEmoji: { fontSize: 64 },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: -44,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Brand.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  cardLabel: { fontFamily: DisplayFont.semibold, fontSize: 20, color: Brand.green },
  cardDescription: { fontSize: 14, color: '#5b665e' },
  heroQuestion: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  heroImage: { width: 260, height: 260 },
  heroQuestionText: { fontSize: 26, lineHeight: 32, paddingHorizontal: 8 },
  yesNoRow: { flexDirection: 'row', gap: 14, alignSelf: 'stretch', marginTop: 4 },
  yesNoButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Brand.green,
    alignItems: 'center',
  },
  yesNoLabel: { fontFamily: DisplayFont.semibold, fontSize: 18, color: Brand.green },
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
