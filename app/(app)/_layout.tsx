import { getCurrentUser } from '@/apis';
import { useSession } from '@/providers/session-provider';
import { Redirect, Stack } from 'expo-router';
import * as React from 'react';

export default function AppLayout() {
  const { status, updateUser } = useSession();

  React.useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const controller = new AbortController();

    getCurrentUser({ signal: controller.signal })
      .then(updateUser)
      .catch(() => {
        // Screens that need user data handle their own error states.
      });

    return () => controller.abort();
  }, [status, updateUser]);

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
