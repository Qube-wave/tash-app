import {
  ApiRequestError,
  authorizeDirectDebitMandate,
  getDirectDebitMandate,
  type DirectDebitMandate,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#FAFAF1';
const INK = '#151713';
const MUTED = '#6F746A';
const ORANGE = '#FF6A12';
const LINE = '#DFE1D4';
const DANGER = '#B42318';
const SUCCESS = '#138A51';

type ActivationAccount = {
  accountNumber: string;
  bankName: string;
  accountName: string;
};

function normalizeProviderText(value: string) {
  return value.replace(/\s+/g, ' ').replace(/platform\.Please/g, 'platform. Please').trim();
}

function getAuthorizationDescription(mandate: DirectDebitMandate | null) {
  const description = mandate?.metadata?.authorizationDescription;

  if (typeof description === 'string' && description.trim().length > 0) {
    return normalizeProviderText(description);
  }

  return 'Complete the provider authorization from this same bank account, then check the status here.';
}

function getActivationAccounts(mandate: DirectDebitMandate | null): ActivationAccount[] {
  const description = getAuthorizationDescription(mandate);
  const accountPattern =
    /Account Number:\s*(\d{6,})\s+Bank:\s*(.*?)\s+Account Name:\s*([\s\S]*?)(?=\s+OR\s+Account Number:|$)/gi;

  return Array.from(description.matchAll(accountPattern)).map((match) => ({
    accountNumber: match[1],
    bankName: normalizeProviderText(match[2]),
    accountName: normalizeProviderText(match[3]).replace(/[.;]$/, ''),
  }));
}

function getProviderAuthorizationSteps(mandate: DirectDebitMandate | null) {
  const steps = mandate?.metadata?.authorizationSteps;

  if (Array.isArray(steps)) {
    return steps
      .filter((step): step is string => typeof step === 'string')
      .map(normalizeProviderText)
      .filter(Boolean);
  }

  return [getAuthorizationDescription(mandate)];
}

function getAuthorizationSteps(mandate: DirectDebitMandate | null, accounts: ActivationAccount[]) {
  if (accounts.length > 0) {
    const accountSuffix = mandate?.accountNumberLastFour
      ? ' ending in ' + mandate.accountNumberLastFour
      : '';

    return [
      'Pay exactly ₦50.00 from the linked bank account' + accountSuffix + '.',
      'Use your Mobile Banking App or Internet Banking platform.',
      'Send the payment to one of the NIBSS activation accounts below.',
      'Return here and tap Check status.',
    ];
  }

  return getProviderAuthorizationSteps(mandate);
}

function getStatusContent(status?: DirectDebitMandate['status']) {
  if (status === 'active') {
    return {
      title: 'Mandate active',
      description: 'This bank account is ready for direct debit funding.',
      color: SUCCESS,
      Icon: CheckCircle2,
    };
  }

  if (status === 'failed' || status === 'expired' || status === 'revoked') {
    return {
      title: 'Authorization failed',
      description: 'We could not activate this mandate. Start again to create a new mandate.',
      color: DANGER,
      Icon: XCircle,
    };
  }

  return {
    title: 'Awaiting authorization',
    description: 'Follow the provider instruction, then check the status after completing it.',
    color: ORANGE,
    Icon: ShieldCheck,
  };
}

export default function AuthorizeDirectDebitMandateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uuid } = useLocalSearchParams<{ uuid?: string }>();
  const mandateUuid = Array.isArray(uuid) ? uuid[0] : uuid;
  const [mandate, setMandate] = React.useState<DirectDebitMandate | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChecking, setIsChecking] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const activationAccounts = React.useMemo(() => getActivationAccounts(mandate), [mandate]);
  const authorizationSteps = React.useMemo(
    () => getAuthorizationSteps(mandate, activationAccounts),
    [activationAccounts, mandate]
  );
  const statusContent = getStatusContent(mandate?.status);
  const StatusIcon = statusContent.Icon;
  const canCheckStatus = Boolean(mandateUuid) && !isLoading && !isChecking;

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadMandate() {
      if (!mandateUuid) {
        setIsLoading(false);
        setErrorMessage('Mandate not found.');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getDirectDebitMandate(mandateUuid, { signal: controller.signal });
        setMandate(result);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiRequestError ? error.message : 'Unable to load mandate status.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadMandate();

    return () => controller.abort();
  }, [mandateUuid]);

  const handleCheckStatus = async () => {
    if (!canCheckStatus || !mandateUuid) {
      return;
    }

    setIsChecking(true);
    setErrorMessage(null);

    try {
      const result = await authorizeDirectDebitMandate(mandateUuid);
      setMandate(result);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Unable to check mandate status.'
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handlePrimaryAction = () => {
    if (mandate?.status === 'active') {
      router.replace('/(app)/(tabs)/cards' as never);
      return;
    }

    if (
      mandate?.status === 'failed' ||
      mandate?.status === 'expired' ||
      mandate?.status === 'revoked'
    ) {
      router.replace('/direct-debit/new' as never);
      return;
    }

    handleCheckStatus();
  };

  const primaryLabel = (() => {
    if (mandate?.status === 'active') {
      return 'Done';
    }

    if (
      mandate?.status === 'failed' ||
      mandate?.status === 'expired' ||
      mandate?.status === 'revoked'
    ) {
      return 'Create new mandate';
    }

    return 'Check status';
  })();

  const primaryDisabled =
    mandate?.status === 'active'
      ? false
      : mandate?.status === 'failed' ||
          mandate?.status === 'expired' ||
          mandate?.status === 'revoked'
        ? false
        : !canCheckStatus;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
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
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: LINE,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}>
            {isLoading ? (
              <ActivityIndicator color={ORANGE} />
            ) : (
              <StatusIcon color={statusContent.color} size={27} />
            )}
          </View>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 28 }}>
            {isLoading ? 'Checking mandate' : statusContent.title}
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 6, color: MUTED, fontSize: 15, lineHeight: 21 }}>
            {isLoading ? 'Loading the latest authorization status.' : statusContent.description}
          </Text>
        </View>

        {mandate && mandate.status !== 'active' ? (
          <View
            style={{
              marginTop: 28,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
              padding: 18,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 16 }}>
              Authorization steps
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {authorizationSteps.map((step, index) => (
                <View key={step} style={{ flexDirection: 'row', gap: 10 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: ORANGE,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}>
                    <Text
                      font={{ family: 'SourceSans3', weight: 'Bold' }}
                      style={{ color: INK, fontSize: 12 }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ flex: 1, color: MUTED, fontSize: 14, lineHeight: 20 }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>

            {activationAccounts.length > 0 ? (
              <View style={{ marginTop: 18 }}>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Bold' }}
                  style={{ color: INK, fontSize: 15 }}>
                  Activation accounts
                </Text>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ marginTop: 3, color: MUTED, fontSize: 12, lineHeight: 17 }}>
                  Long-press an account number to copy it.
                </Text>
                <View style={{ gap: 10, marginTop: 10 }}>
                  {activationAccounts.map((account) => (
                    <View
                      key={account.accountNumber}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: LINE,
                        backgroundColor: '#FAFAF1',
                        padding: 14,
                      }}>
                      <Text
                        selectable
                        font={{ family: 'SourceSans3', weight: 'Bold' }}
                        style={{ color: INK, fontSize: 22 }}>
                        {account.accountNumber}
                      </Text>
                      <Text
                        font={{ family: 'SourceSans3', weight: 'Bold' }}
                        style={{ marginTop: 5, color: INK, fontSize: 14 }}>
                        {account.bankName}
                      </Text>
                      <Text
                        selectable
                        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                        style={{ marginTop: 2, color: MUTED, fontSize: 13 }}>
                        {account.accountName}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {mandate ? (
          <View
            style={{
              marginTop: 14,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: '#FFFFFF',
              padding: 16,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 15 }}>
              {mandate.bankName ?? 'Linked bank'}
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ marginTop: 3, color: MUTED, fontSize: 13 }}>
              {mandate.accountName} • •••• {mandate.accountNumberLastFour}
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ marginTop: 8, color: statusContent.color, fontSize: 13 }}>
              {mandate.status.replace(/_/g, ' ')}
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 16, color: DANGER, fontSize: 14 }}>
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          disabled={primaryDisabled}
          onPress={handlePrimaryAction}
          style={{
            marginTop: 28,
            height: 56,
            borderRadius: 28,
            backgroundColor: primaryDisabled ? '#E5E7DA' : ORANGE,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
          }}>
          {isChecking ? (
            <ActivityIndicator color={INK} />
          ) : (
            <>
              {mandate?.status === 'active' ? null : <RefreshCw color={INK} size={18} />}
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: primaryDisabled ? MUTED : INK, fontSize: 16 }}>
                {primaryLabel}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
