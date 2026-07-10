import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolViewProps } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarding } from '@/components/onboarding-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, Colors, DisplayFont, HeadingFont, UIFont } from '@/constants/theme';
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
const LEAFY_GOT_YOU = require('@/assets/images/leafy-gif/got-you.mp4');
const NOTIF_PREVIEW = require('@/assets/images/onboarding/notif-preview.png');
const SCREEN_W = Dimensions.get('window').width;

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
    field: 'unsureSunlight',
    variant: 'hero',
    question: 'Are you unsure if they’re getting enough sunlight?',
    image: require('@/assets/images/onboarding/new-sunblight.png'),
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    kind: 'question',
    field: 'seeksHelp',
    variant: 'hero',
    question: 'Do you anxiously search for ways to keep your plants alive?',
    image: require('@/assets/images/onboarding/dead-plant.png'),
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    kind: 'question',
    field: 'overwhelmed',
    variant: 'hero',
    question: 'Do you feel overwhelmed by the amount of plant info out there?',
    image: require('@/assets/images/onboarding/overwhelmed.png'),
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
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

  const gotYouPlayer = useVideoPlayer(LEAFY_GOT_YOU, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  // Bell "ringing" wiggle for the notifications screen.
  const ring = useSharedValue(0);
  useEffect(() => {
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 110 }),
        withTiming(-1, { duration: 110 }),
        withTiming(1, { duration: 110 }),
        withTiming(-1, { duration: 110 }),
        withTiming(0, { duration: 110 }),
        withDelay(1400, withTiming(0, { duration: 1 })),
      ),
      -1,
    );
  }, [ring]);
  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ring.value * 15}deg` }],
  }));

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
        <ProgressBar current={index} total={STEPS.length} />

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
                <View style={styles.heroPrompt}>
                  <ThemedText
                    type="title"
                    style={[styles.centerText, styles.displayHeading, styles.heroQuestionText]}>
                    {step.question}
                  </ThemedText>
                </View>
                {step.image && (
                  <Image source={step.image} style={styles.heroImage} contentFit="contain" />
                )}
                <View style={styles.yesNoGroup}>
                  {step.options.map((opt) => {
                    const isYes = opt.value === 'yes';
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => {
                          updateAnswers({ [step.field]: opt.value } as Partial<OnboardingAnswers>);
                          goNext();
                        }}
                        style={({ pressed }) => [
                          isYes ? styles.primaryBtn : styles.secondaryBtn,
                          pressed && { opacity: 0.85 },
                        ]}>
                        <ThemedText
                          style={isYes ? styles.primaryBtnLabel : styles.secondaryBtnLabel}>
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
              <ThemedText style={[styles.centerText, styles.heroQuestionText]}>
                Leafy’s got you
              </ThemedText>
              <VideoView
                player={gotYouPlayer}
                style={styles.affirmationVideo}
                contentFit="contain"
                nativeControls={false}
              />
              <View style={styles.bullets}>
                <Bullet text="Snap a photo to identify any plant instantly" />
                <Bullet text="Watering reminders so you never forget again" />
                <Bullet text="Know if they’re getting enough water & light" />
                <Bullet text="Simple, clear care tips — no overwhelm" />
              </View>
            </View>
          )}

          {step.kind === 'notifications' && (
            <View style={styles.notif}>
              <View style={styles.notifHeader}>
                <View style={styles.notifBadge}>
                  <Animated.View style={bellStyle}>
                    <IconSymbol name="bell" size={30} color={Brand.green} />
                  </Animated.View>
                </View>
                <ThemedText style={styles.notifTitle}>Never miss{'\n'}plant care</ThemedText>
              </View>
              <Image source={NOTIF_PREVIEW} style={styles.notifPreview} contentFit="contain" />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {step.kind === 'notifications' ? (
            <>
              <Pressable onPress={handleEnableReminders} disabled={busy}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#6ABE6E', '#3E8B45']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradientBtn, pressed && { opacity: 0.9 }]}>
                    <ThemedText style={styles.gradientBtnLabel}>Turn On Notifications</ThemedText>
                  </LinearGradient>
                )}
              </Pressable>
              <Pressable onPress={complete} disabled={busy} style={styles.skip}>
                <ThemedText style={[styles.skipText, { color: Brand.green }]}>
                  Not Right Now
                </ThemedText>
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

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current + 1) / total;
  const value = useSharedValue(progress);

  useEffect(() => {
    value.value = withTiming(progress, { duration: 400 });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fillStyle]} />
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

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletCheck}>
        <IconSymbol name="checkmark" size={11} color="#ffffff" />
      </View>
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
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E7EFE8',
    overflow: 'hidden',
    marginVertical: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: Brand.green,
  },
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
  cardsTitle: { fontFamily: HeadingFont.bold, fontSize: 30, lineHeight: 36 },
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
  heroImage: { width: 320, height: 320 },
  heroPrompt: {
    height: 108,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  heroQuestionText: {
    fontFamily: HeadingFont.bold,
    fontSize: 30,
    lineHeight: 36,
    paddingHorizontal: 8,
  },
  yesNoGroup: { alignSelf: 'stretch', gap: 14, marginTop: 76 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 68,
    borderRadius: 30,
    backgroundColor: '#4E9F58',
    shadowColor: '#4E9F58',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryBtnLabel: { fontFamily: UIFont.semibold, fontSize: 20, color: '#ffffff' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 24,
    gap: 10,
    minHeight: 48,
  },
  secondaryBtnLabel: { fontFamily: UIFont.semibold, fontSize: 17, color: '#5F6C64' },
  affirmationVideo: { width: 320, height: 320 },
  bullets: { gap: 7, marginTop: 0, alignSelf: 'stretch' },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F8F1',
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  bulletCheck: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.green,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bulletText: { flex: 1, fontSize: 13.5, fontFamily: UIFont.medium, color: '#3D4A40' },
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
  notif: { flex: 1, justifyContent: 'space-between' },
  notifHeader: { paddingTop: 8 },
  notifBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  notifTitle: {
    fontFamily: UIFont.bold,
    fontSize: 40,
    lineHeight: 46,
    color: '#1E3A24',
  },
  notifPreview: {
    width: SCREEN_W * 1.14,
    aspectRatio: 1024 / 837,
    alignSelf: 'center',
    marginBottom: 16,
  },
  gradientBtn: {
    minHeight: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3E8B45',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  gradientBtnLabel: { fontFamily: UIFont.semibold, fontSize: 18, color: '#ffffff' },
});
