import { Pressable, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { type LocalePreference, useT } from '@/i18n';
import { useLocaleStore } from '@/lib/locale-store';
import { kv } from '@/lib/storage';
import { radius, spacing } from '@/theme';

/**
 * TODO(faz-1): account, subscription status, consent withdrawal and full data
 * deletion. Withdrawal and deletion are legal requirements, not nice-to-haves —
 * they ship with the first release.
 */
export default function ProfileTab() {
  const t = useT();
  const preference = useLocaleStore((state) => state.preference);
  const setPreference = useLocaleStore((state) => state.setPreference);

  const options: { value: LocalePreference; label: string }[] = [
    { value: 'system', label: t('settings.languageSystem') },
    { value: 'tr', label: 'Türkçe' },
    { value: 'en', label: 'English' },
  ];

  return (
    <Screen scroll>
      <Text variant="h1">{t('settings.title')}</Text>

      <Card>
        <Text variant="label" tone="accent">
          {t('settings.languageLabel')}
        </Text>
        <View style={{ gap: spacing.xs }}>
          {options.map((option) => (
            <LanguageOption
              key={option.value}
              label={option.label}
              selected={preference === option.value}
              onPress={() => setPreference(option.value)}
            />
          ))}
        </View>
        <Text variant="caption" tone="muted">
          {t('settings.languageBody')}
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="accent">
          {t('common.placeholder')}
        </Text>
        <Text variant="bodySm" tone="muted">
          {t('settings.accountPlaceholder')}
        </Text>
      </Card>

      <Card>
        <Text variant="label" tone="muted">
          {t('settings.dangerLabel')}
        </Text>
        <Button label={t('settings.resetLocal')} variant="ghost" onPress={() => kv.clearAll()} />
      </Card>
    </Screen>
  );
}

function LanguageOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: selected ? colors.accentSoft : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.pill,
          borderWidth: 2,
          borderColor: selected ? colors.accent : colors.borderStrong,
          backgroundColor: selected ? colors.accent : 'transparent',
        }}
      />
      <Text variant="body" tone={selected ? 'default' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}
