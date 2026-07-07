import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const SOFT = '#EFF0E6';
const LINE = '#DFE1D4';
const DANGER = '#B42318';

type IconComponent = React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;

type SecurityRowProps = {
  icon: IconComponent;
  label: string;
  value: string;
  onPress: () => void;
  destructive?: boolean;
  loading?: boolean;
};

function SecurityRow({
  icon: Icon,
  label,
  value,
  onPress,
  destructive,
  loading,
}: SecurityRowProps) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={{
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        opacity: loading ? 0.7 : 1,
      }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: destructive ? '#FEE4E2' : SOFT,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon color={destructive ? DANGER : INK} size={19} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          font={{ family: 'SourceSans3', weight: 'Bold' }}
          style={{ fontSize: 15, color: destructive ? DANGER : INK }}>
          {label}
        </Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ marginTop: 1, fontSize: 13, color: MUTED }}>
          {value}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={destructive ? DANGER : ORANGE} />
      ) : (
        <ChevronRight color={destructive ? DANGER : MUTED} size={18} />
      )}
    </Pressable>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  const rows = React.Children.toArray(children);

  return (
    <View
      style={{
        marginTop: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: LINE,
        overflow: 'hidden',
      }}>
      {rows.map((child, index) => (
        <View key={index}>
          {index > 0 ? <View style={{ height: 1, marginLeft: 66, backgroundColor: LINE }} /> : null}
          {child}
        </View>
      ))}
    </View>
  );
}

export default function SecuritySettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout, logoutAll } = useSession();
  const [logoutMode, setLogoutMode] = React.useState<'current' | 'all' | null>(null);

  const handleLogoutCurrent = async () => {
    setLogoutMode('current');
    await logout();
  };

  const handleLogoutAll = async () => {
    setLogoutMode('all');
    await logoutAll();
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 34,
        }}>
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

        <View style={{ marginTop: 28 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ fontSize: 28, color: INK }}>
            Security
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, fontSize: 15, color: MUTED }}>
            Manage transaction authorization and device sessions.
          </Text>
        </View>

        <Section>
          <SecurityRow
            icon={ShieldCheck}
            label="Transaction PIN"
            value="Update the 4-digit PIN used for money movement"
            onPress={() => router.push('/settings/transaction-pin' as never)}
          />
          <SecurityRow
            icon={Smartphone}
            label="Logout current device"
            value="End this device session"
            onPress={handleLogoutCurrent}
            destructive
            loading={logoutMode === 'current'}
          />
          <SecurityRow
            icon={UsersRound}
            label="Logout all devices"
            value="End every active Tash session"
            onPress={handleLogoutAll}
            destructive
            loading={logoutMode === 'all'}
          />
        </Section>

        <View
          style={{
            marginTop: 20,
            borderRadius: 18,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: LINE,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
          }}>
          <LogOut color={ORANGE} size={20} />
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ flex: 1, color: MUTED, fontSize: 14, lineHeight: 20 }}>
            Tash does not use passwords. Login, unlock, and money movement are protected with OTPs,
            secure tokens, and your transaction PIN.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
