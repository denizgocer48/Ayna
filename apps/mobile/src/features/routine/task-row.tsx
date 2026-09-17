import type { TaskDefinition } from '@ayna/shared';
import { POINTS } from '@ayna/shared';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { taskTitleKey, taskWhyKey } from '@/features/routine/task-copy';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { radius, spacing, trendColors } from '@/theme';

/**
 * One routine item.
 *
 * The `why` line is always visible rather than hidden behind a tap: an item
 * nobody understands is an item nobody keeps doing, and the attribution is the
 * thing that separates this from a list of folk advice.
 */
export function TaskRow({
  task,
  done,
  onToggle,
}: {
  task: TaskDefinition;
  done: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const t = useT();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 24,
          height: 24,
          marginTop: 2,
          borderRadius: radius.sm,
          borderWidth: 2,
          borderColor: done ? trendColors.improved : colors.borderStrong,
          backgroundColor: done ? trendColors.improved : 'transparent',
        }}
      />

      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="body" tone={done ? 'muted' : 'default'}>
          {t(taskTitleKey(task))}
        </Text>
        <Text variant="caption" tone="muted">
          {t(taskWhyKey(task))}
        </Text>
      </View>

      <Text variant="caption" tone={done ? 'success' : 'muted'}>
        +{POINTS[task.cadence]}
      </Text>
    </Pressable>
  );
}
