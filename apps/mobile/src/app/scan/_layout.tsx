import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="capture" />
      <Stack.Screen name="analyzing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="result/[scanId]" />
    </Stack>
  );
}
