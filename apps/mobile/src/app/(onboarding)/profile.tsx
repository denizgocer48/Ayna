import { MIN_AGE, type Sex } from '@ayna/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { radius, spacing } from '@/theme';

const SEXES: Sex[] = ['female', 'male', 'prefer_not_to_say'];

export default function ProfileStep() {
  const t = useT();
  const { colors } = useTheme();
  const { birthYear, sex, setBirthYear, setSex } = useOnboardingStore();
  const latestBirthYear = new Date().getFullYear() - MIN_AGE;

  return (
    <Screen scroll>
      <Text variant="h1">{t('onboarding.profileTitle')}</Text>
      <Text tone="secondary">{t('onboarding.profileBody')}</Text>
      <Card>
        <Text variant="label">{t('onboarding.birthYear')}</Text>
        <View style={styles.yearRow}>
          <Button label="−" variant="secondary" fullWidth={false}
            accessibilityLabel={t('onboarding.yearEarlier')} disabled={birthYear <= 1900}
            onPress={() => setBirthYear(birthYear - 1)} />
          <Text variant="h2">{birthYear}</Text>
          <Button label="+" variant="secondary" fullWidth={false}
            accessibilityLabel={t('onboarding.yearLater')} disabled={birthYear >= latestBirthYear}
            onPress={() => setBirthYear(birthYear + 1)} />
        </View>
      </Card>
      <Text variant="label">{t('onboarding.sexLabel')}</Text>
      {SEXES.map((option) => {
        const selected = sex === option;
        return (
          <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected }}
            onPress={() => setSex(option)} style={[styles.option, {
              backgroundColor: selected ? colors.surfaceRaised : colors.surface,
              borderColor: selected ? colors.accent : colors.border,
            }]}
          >
            <Text variant="body">{t(`onboarding.sex.${option}`)}</Text>
          </Pressable>
        );
      })}
      <Button label={t('common.continue')} disabled={!sex}
        onPress={() => router.push('/(onboarding)/goals')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  option: { minHeight: 52, justifyContent: 'center', borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg },
});
