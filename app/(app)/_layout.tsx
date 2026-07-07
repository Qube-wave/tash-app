import { useSession } from '@/providers/session-provider';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
  const { status } = useSession();

  if (status === 'bootstrapping') {
    return null;
  }

  if (status === 'locked') {
    return <Redirect href="/(auth)/unlock" />;
  }

  if (status !== 'authenticated') {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
