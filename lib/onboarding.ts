import AsyncStorage from '@react-native-async-storage/async-storage';

const ANSWERS_KEY = 'leafy.onboarding.answers.v1';
const COMPLETE_KEY = 'leafy.onboarding.complete.v1';

export type YesNo = 'yes' | 'no';
export type PlantLocation = 'indoor' | 'outdoor' | 'both';
export type CareConfidence = 'confident' | 'unsure' | 'no_idea';
export type SeeksHelp = 'yes' | 'sometimes' | 'no';
export type Overwhelmed = 'yes' | 'a_bit' | 'no';

/**
 * Answers captured during onboarding. Stored on-device only (no account).
 * Every field is optional so partial progress can be persisted.
 */
export type OnboardingAnswers = {
  location?: PlantLocation;
  unsureWatering?: YesNo;
  careConfidence?: CareConfidence;
  seeksHelp?: SeeksHelp;
  overwhelmed?: Overwhelmed;
};

export async function loadOnboarding(): Promise<{
  complete: boolean;
  answers: OnboardingAnswers;
}> {
  const [complete, rawAnswers] = await Promise.all([
    AsyncStorage.getItem(COMPLETE_KEY),
    AsyncStorage.getItem(ANSWERS_KEY),
  ]);

  let answers: OnboardingAnswers = {};
  if (rawAnswers) {
    try {
      answers = JSON.parse(rawAnswers) as OnboardingAnswers;
    } catch {
      answers = {};
    }
  }

  return { complete: complete === 'true', answers };
}

export async function saveOnboardingAnswers(answers: OnboardingAnswers): Promise<void> {
  await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export async function completeOnboarding(answers: OnboardingAnswers): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(answers)),
    AsyncStorage.setItem(COMPLETE_KEY, 'true'),
  ]);
}

/** Dev helper: wipe onboarding state so the flow shows again on next launch. */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.multiRemove([ANSWERS_KEY, COMPLETE_KEY]);
}
