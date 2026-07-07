import { ApiRequestError, getCurrentUser, getPaymentSettings, type PaymentSettings } from '@/apis';
import { Text } from '@/components/ui/text';
<<<<<<< HEAD
import { useFocusEffect, useRouter } from 'expo-router';
import { useSession } from '@/providers/session-provider';
import {
  AtSign,
  Bell,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Globe2,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const BLACK = '#050505';
const SOFT = '#EFF0E6';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

type IconComponent = React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;

type RowProps = {
  icon: IconComponent;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

function formatName(user: ReturnType<typeof useSession>['user']) {
  const firstName = user?.profile?.firstName?.trim();
  const lastName = user?.profile?.lastName?.trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');
  return name || 'Tash user';
}

function formatCurrency(value?: number | null, currency = 'NGN') {
  if (typeof value !== 'number') {
    return 'Not set';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function SettingRow({ icon: Icon, label, value, onPress, destructive }: RowProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: destructive ? '#FEE4E2' : SOFT,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon color={destructive ? DANGER : INK} size={18} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          font={{ family: 'SourceSans3', weight: 'Bold' }}
          style={{ fontSize: 15, color: destructive ? DANGER : INK }}>
          {label}
        </Text>
        {value ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            numberOfLines={1}
            style={{ marginTop: 1, fontSize: 13, color: MUTED }}>
            {value}
          </Text>
        ) : null}
      </View>
      {onPress ? <ChevronRight color={destructive ? DANGER : MUTED} size={18} /> : null}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const rows = React.Children.toArray(children);

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        style={{ marginBottom: 10, fontSize: 17, color: INK }}>
        {title}
      </Text>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: LINE,
          overflow: 'hidden',
        }}>
        {rows.map((child, index) => (
          <View key={index}>
            {index > 0 ? (
              <View style={{ height: 1, marginLeft: 62, backgroundColor: LINE }} />
            ) : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

function ProfileHeader({ user }: { user: ReturnType<typeof useSession>['user'] }) {
  const name = formatName(user);
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={{ marginTop: 22, alignItems: 'center' }}>
      <View
        style={{
          width: 86,
          height: 86,
          borderRadius: 43,
          backgroundColor: '#F2E983',
          borderWidth: 4,
          borderColor: BLACK,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          font={{ family: 'PlayfairDisplay', weight: 'Black' }}
          style={{ fontSize: 30, color: INK }}>
          {initials || 'T'}
        </Text>
      </View>
      <Text
        font={{ family: 'SourceSans3', weight: 'Bold' }}
        style={{ marginTop: 12, fontSize: 24, color: INK }}>
        {name}
      </Text>
      {user?.paymentTag ? (
        <View
          style={{
            marginTop: 8,
            height: 34,
            borderRadius: 17,
            backgroundColor: BLACK,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 14, color: '#FFFFFF' }}>
            @{user.paymentTag}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useSession();
  const [profile, setProfile] = React.useState(user);
  const [settings, setSettings] = React.useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const router = useRouter();

  const loadProfileSettings = React.useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [currentUser, paymentSettings] = await Promise.all([
        getCurrentUser({ signal }),
        getPaymentSettings({ signal }),
      ]);

      setProfile(currentUser);
      setSettings(paymentSettings);
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      setErrorMessage(
        error instanceof ApiRequestError
          ? error.message
          : 'Unable to load profile settings. Please try again.'
      );
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const controller = new AbortController();
      loadProfileSettings(controller.signal);

      return () => controller.abort();
    }, [loadProfileSettings])
  );

  const activeProfile = profile ?? user;
  const currency = activeProfile?.profile.defaultCurrency ?? 'NGN';
  const notifications = settings?.notificationPreferences ?? {};
  const pushEnabled = notifications.push === true;
  const emailEnabled = notifications.email === true;
  const paymentMethodsValue = [
    settings?.allowCardPayments ? 'Cards on' : 'Cards off',
    settings?.allowDirectDebitPayments ? 'Debit on' : 'Debit off',
  ].join(' · ');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 110,
        }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 26, color: INK }}>
            Profile
          </Text>
          {isLoading ? <ActivityIndicator color={ORANGE} /> : null}
        </View>

        <ProfileHeader user={activeProfile} />

        {errorMessage ? (
          <View
            style={{
              marginTop: 18,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#FECACA',
              backgroundColor: '#FFF1F0',
              padding: 14,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ fontSize: 14, color: DANGER }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Section title="Account">
          <SettingRow
            icon={UserRound}
            label="Account details"
            value={formatName(activeProfile)}
            onPress={() => router.push('/settings/account-details' as never)}
          />
          <SettingRow
            icon={AtSign}
            label="Payment tag"
            value={activeProfile?.paymentTag ? `@${activeProfile.paymentTag}` : 'Not set'}
            onPress={() => router.push('/settings/payment-tag' as never)}
          />
          <SettingRow
            icon={Globe2}
            label="Country and currency"
            value={`${activeProfile?.profile.country ?? 'NG'} / ${currency}`}
            onPress={() => router.push('/settings/account-details' as never)}
          />
        </Section>

        <Section title="Payment settings">
          <SettingRow
            icon={Wallet}
            label="Default wallet"
            value={
              settings?.defaultWalletId ? `Wallet ${settings.defaultWalletId}` : 'Default wallet'
            }
          />
          <SettingRow
            icon={CreditCard}
            label="Payment methods"
            value={paymentMethodsValue}
            onPress={() => router.push('/settings/payment-preferences' as never)}
          />
          <SettingRow
            icon={CircleDollarSign}
            label="Single transaction limit"
            value={formatCurrency(settings?.singleTransactionLimit, currency)}
            onPress={() => router.push('/settings/payment-preferences' as never)}
          />
        </Section>

        <Section title="Security">
          <SettingRow
            icon={ShieldCheck}
            label="Transaction PIN"
            value="PIN, unlock, and device sessions"
            onPress={() => router.push('/settings/security' as never)}
          />
          <SettingRow
            icon={LockKeyhole}
            label="Payment authorization"
            value={settings?.requireTransactionPin ? 'PIN enabled' : 'PIN disabled'}
            onPress={() => router.push('/settings/security' as never)}
          />
        </Section>

        <Section title="Notifications">
          <SettingRow
            icon={Bell}
            label="Push notifications"
            value={pushEnabled ? 'On' : 'Off'}
            onPress={() => router.push('/settings/notifications' as never)}
          />
          <SettingRow
            icon={AtSign}
            label="Email notifications"
            value={emailEnabled ? 'On' : 'Off'}
            onPress={() => router.push('/settings/notifications' as never)}
          />
        </Section>

        <Pressable
          disabled={isLoggingOut}
          onPress={handleLogout}
          style={{
            marginTop: 24,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: LINE,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: isLoggingOut ? 0.65 : 1,
          }}>
          {isLoggingOut ? (
            <ActivityIndicator color={DANGER} />
          ) : (
            <LogOut color={DANGER} size={19} />
          )}
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 16, color: DANGER }}>
=======
import { useColors } from '@/lib/use-colors';
import { Bell, ChevronRight, CreditCard, LogOut, ShieldCheck, UserCog } from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS = [
  { icon: UserCog, label: 'Account details' },
  { icon: ShieldCheck, label: 'Security & PIN' },
  { icon: CreditCard, label: 'Cards & limits' },
  { icon: Bell, label: 'Notifications' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 22,
          paddingBottom: 24,
        }}>
        <Text
          font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
          style={{ fontSize: 26, color: colors.heading, letterSpacing: -0.3 }}>
          Profile
        </Text>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/160?img=68' }}
            style={{ width: 84, height: 84, borderRadius: 42 }}
          />
          <Text
            font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
            style={{ fontSize: 20, color: colors.heading, marginTop: 12 }}>
            Timi Leyin
          </Text>
          <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 14, color: colors.subtitle }}>
            timi@ping.app
          </Text>
        </View>

        <View
          style={{
            marginTop: 26,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
            overflow: 'hidden',
          }}>
          {ITEMS.map((it, i) => {
            const Icon = it.icon;
            return (
              <Pressable
                key={it.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}>
                <Icon color={colors.heading} size={20} />
                <Text
                  font={{ family: 'SourceSans3', weight: 'Medium' }}
                  style={{ flex: 1, marginLeft: 14, fontSize: 15, color: colors.heading }}>
                  {it.label}
                </Text>
                <ChevronRight color={colors.placeholder} size={18} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 22,
            height: 52,
            borderRadius: 2,
            borderWidth: 1.5,
            borderColor: colors.border,
          }}>
          <LogOut color={colors.accent} size={18} />
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ fontSize: 15, color: colors.accent }}>
>>>>>>> 4edcff91cf02b0ccc5857354ab155381f28cc28e
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
