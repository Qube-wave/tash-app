import { ApiRequestError, getCurrentUser, type PublicUserProfile } from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  AtSign,
  CalendarDays,
  Globe2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
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

type DetailRowProps = {
  icon: IconComponent;
  label: string;
  value: string;
};

function formatName(user: PublicUserProfile | null) {
  const firstName = user?.profile?.firstName?.trim();
  const lastName = user?.profile?.lastName?.trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');
  return name || 'Not set';
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <View
      style={{
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: SOFT,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon color={INK} size={18} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ fontSize: 15, color: INK }}>
          {label}
        </Text>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          numberOfLines={1}
          style={{ marginTop: 1, fontSize: 13, color: MUTED }}>
          {value}
        </Text>
      </View>
    </View>
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
          {index > 0 ? <View style={{ height: 1, marginLeft: 64, backgroundColor: LINE }} /> : null}
          {child}
        </View>
      ))}
    </View>
  );
}

export default function AccountDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = React.useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser({ signal: controller.signal });
        setUser(currentUser);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof ApiRequestError ? error.message : 'Unable to load account details.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => controller.abort();
  }, []);

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
            Account details
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, fontSize: 15, color: MUTED }}>
            Identity fields are read-only until KYC is available.
          </Text>
        </View>

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

        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <View
            style={{
              width: 82,
              height: 82,
              borderRadius: 41,
              backgroundColor: '#F2E983',
              borderWidth: 4,
              borderColor: BLACK,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Black' }}
              style={{ fontSize: 29, color: INK }}>
              {formatName(user)
                .split(' ')
                .map((part) => part[0])
                .filter(Boolean)
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'T'}
            </Text>
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ marginTop: 12, fontSize: 23, color: INK }}>
            {formatName(user)}
          </Text>
        </View>

        <Section>
          <DetailRow icon={UserRound} label="Legal name" value={formatName(user)} />
          <DetailRow
            icon={CalendarDays}
            label="Date of birth"
            value={formatDate(user?.profile.dateOfBirth)}
          />
          <DetailRow
            icon={AtSign}
            label="Payment tag"
            value={user?.paymentTag ? `@${user.paymentTag}` : 'Not set'}
          />
          <DetailRow icon={Mail} label="Email" value={user?.email ?? 'Not set'} />
          <DetailRow icon={Phone} label="Phone" value={user?.phoneNumber ?? 'Not set'} />
          <DetailRow
            icon={Globe2}
            label="Country and currency"
            value={`${user?.profile.country ?? 'NG'} / ${user?.profile.defaultCurrency ?? 'NGN'}`}
          />
          <DetailRow icon={ShieldCheck} label="Account status" value={user?.status ?? 'Unknown'} />
        </Section>
      </ScrollView>
    </View>
  );
}
