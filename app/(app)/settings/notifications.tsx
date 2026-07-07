import { ApiRequestError, getPaymentSettings, updatePaymentSettings } from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Bell, Mail } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

type ChannelRowProps = {
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
};

function ChannelRow({
  icon: Icon,
  title,
  subtitle,
  value,
  disabled,
  onValueChange,
}: ChannelRowProps) {
  return (
    <View
      style={{
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: '#EFF0E6',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon color={INK} size={19} />
      </View>
      <View style={{ flex: 1 }}>
        <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ fontSize: 15, color: INK }}>
          {title}
        </Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ marginTop: 1, fontSize: 13, color: MUTED }}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#D8DACC', true: '#FFB07A' }}
        thumbColor={value ? ORANGE : '#FFFFFF'}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [push, setPush] = React.useState(false);
  const [email, setEmail] = React.useState(false);
  const [initialPreferences, setInitialPreferences] = React.useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const settings = await getPaymentSettings({ signal: controller.signal });
        const preferences = settings.notificationPreferences ?? {};
        setInitialPreferences(preferences);
        setPush(preferences.push === true);
        setEmail(preferences.email === true);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof ApiRequestError
              ? error.message
              : 'Unable to load notification settings.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => controller.abort();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updatePaymentSettings({
        notificationPreferences: {
          ...initialPreferences,
          push,
          email,
        },
      });
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to update notification settings.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG, paddingTop: insets.top + 14 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingHorizontal: 24 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: LINE,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowLeft color={INK} size={21} />
          </Pressable>
          {isLoading ? <ActivityIndicator color={ORANGE} /> : null}
        </View>

        <View style={{ marginTop: 28 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 28, color: INK }}>
            Notifications
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, fontSize: 15, color: MUTED }}>
            Choose how Tash should send account and payment updates.
          </Text>
        </View>

        <View
          style={{
            marginTop: 28,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: LINE,
            overflow: 'hidden',
          }}>
          <ChannelRow
            icon={Bell}
            title="Push"
            subtitle="App alerts on this device"
            value={push}
            disabled={isLoading || isSaving}
            onValueChange={setPush}
          />
          <View style={{ height: 1, marginLeft: 66, backgroundColor: LINE }} />
          <ChannelRow
            icon={Mail}
            title="Email"
            subtitle="Receipts and account notices"
            value={email}
            disabled={isLoading || isSaving}
            onValueChange={setEmail}
          />
        </View>

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14 }}>
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          disabled={isLoading || isSaving}
          onPress={handleSave}
          style={{
            marginTop: 28,
            height: 56,
            borderRadius: 28,
            backgroundColor: isLoading || isSaving ? '#E5E7DA' : ORANGE,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {isSaving ? (
            <ActivityIndicator color={INK} />
          ) : (
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 16 }}>
              Save notifications
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
