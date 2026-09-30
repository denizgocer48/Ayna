import { goalSchema } from '@ayna/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { radius, spacing } from '@/theme';

export default function Goals() {
  const t = useT();
  const { colors } = useTheme();
  const { goals, toggleGoal } = useOnboardingStore();

  return (
    <Screen scroll>
      <Text variant="h1">{t('onboarding.goalsTitle')}</Text>
      <Text tone="secondary">{t('onboarding.goalsBody')}</Text>
      <Text variant="label" tone="accent">{t('onboarding.goalsSelected', { count: goals.length })}</Text>
      {goalSchema.options.map((goal) => {
        const selected = goals.includes(goal);
        const disabled = !selected && goals.length >= 4;
        return (
          <Pressable key={goal} accessibilityRole="checkbox"
            accessibilityState={{ checked: selected, disabled }} disabled={disabled}
            onPress={() => toggleGoal(goal)} style={[styles.goal, {
              backgroundColor: selected ? colors.surfaceRaised : colors.surface,
              borderColor: selected ? colors.accent : colors.border,
              opacity: disabled ? 0.45 : 1,
            }]}
          >
            <Text variant="body">{t(`onboarding.goal.${goal}`)}</Text>
          </Pressable>
        );
      })}
      <Button label={t('common.continue')} disabled={goals.length === 0}
        onPress={() => router.push('/(onboarding)/consent')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  goal: { minHeight: 52, justifyContent: 'center', borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg },
});
