import {
  ApiRequestError,
  getCurrentUser,
  deleteCard,
  disableCard,
  listCards,
  listDirectDebitMandates,
  revokeDirectDebitMandate,
  setDefaultCard,
  type Card,
  type PublicUserProfile,
  type DirectDebitMandate,
} from '@/apis';
import { Text } from '@/components/ui/text';
import { useSession } from '@/providers/session-provider';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  BadgeCheck,
  Building2,
  CreditCard,
  Landmark,
  Plus,
  ShieldCheck,
  Trash2,
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
const GREEN = '#168A48';
const DANGER = '#B42318';

function formatCurrency(value: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function getStatusColor(status: string) {
  if (status === 'active' || status === 'successful') {
    return GREEN;
  }

  if (
    status === 'failed' ||
    status === 'expired' ||
    status === 'revoked' ||
    status === 'disabled'
  ) {
    return DANGER;
  }

  return ORANGE;
}

function EmptyState({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: '#FFFFFF',
        padding: 18,
        alignItems: 'center',
      }}>
      <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ color: INK, fontSize: 17 }}>
        {title}
      </Text>
      <Pressable
        onPress={onPress}
        style={{
          marginTop: 14,
          minWidth: 124,
          height: 44,
          borderRadius: 22,
          backgroundColor: ORANGE,
          paddingHorizontal: 22,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          font={{ family: 'SourceSans3', weight: 'Bold' }}
          numberOfLines={1}
          style={{ color: INK, fontSize: 14 }}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function SavedCard({
  card,
  busy,
  onSetDefault,
  onDisable,
  onDelete,
}: {
  card: Card;
  busy: boolean;
  onSetDefault: () => void;
  onDisable: () => void;
  onDelete: () => void;
}) {
  const statusColor = getStatusColor(card.status);

  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: BLACK,
        padding: 18,
        marginBottom: 14,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: ORANGE,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <CreditCard color={INK} size={21} />
          </View>
          <View>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: '#FFFFFF', fontSize: 17 }}>
              {titleCase(card.brand)} •••• {card.lastFourDigits}
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ marginTop: 1, color: '#D7D7D0', fontSize: 13 }}>
              Expires {card.expiryMonth}/{card.expiryYear}
            </Text>
          </View>
        </View>
        {card.isDefault ? <BadgeCheck color={ORANGE} size={23} /> : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 8 }}>
        <View
          style={{
            height: 30,
            borderRadius: 15,
            backgroundColor: '#242424',
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: statusColor, fontSize: 12 }}>
            {titleCase(card.status)}
          </Text>
        </View>
        <View
          style={{
            height: 30,
            borderRadius: 15,
            backgroundColor: '#242424',
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: '#FFFFFF', fontSize: 12 }}>
            {card.currency}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        {!card.isDefault && card.status === 'active' ? (
          <Pressable
            disabled={busy}
            onPress={onSetDefault}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 13 }}>
              Set default
            </Text>
          </Pressable>
        ) : null}
        {card.status === 'active' ? (
          <Pressable
            disabled={busy}
            onPress={onDisable}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#242424',
              borderWidth: 1,
              borderColor: '#3A3A3A',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: '#FFFFFF', fontSize: 13 }}>
              Disable
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={busy}
          onPress={onDelete}
          style={{
            width: 46,
            height: 42,
            borderRadius: 21,
            backgroundColor: '#331B18',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: busy ? 0.6 : 1,
          }}>
          {busy ? <ActivityIndicator color={DANGER} /> : <Trash2 color={DANGER} size={18} />}
        </Pressable>
      </View>
    </View>
  );
}

function MandateRow({
  mandate,
  busy,
  onAuthorize,
  onRevoke,
}: {
  mandate: DirectDebitMandate;
  busy: boolean;
  onAuthorize: () => void;
  onRevoke: () => void;
}) {
  const statusColor = getStatusColor(mandate.status);

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: SOFT,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
          <Landmark color={INK} size={21} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 16 }}>
            {mandate.bankName}
          </Text>
          <Text
            font={{ family: 'SourceSans3', weight: 'SemiBold' }}
            style={{ marginTop: 1, color: MUTED, fontSize: 13 }}>
            {mandate.accountName} •••• {mandate.accountNumberLastFour}
          </Text>
        </View>
        <Text
          font={{ family: 'SourceSans3', weight: 'Bold' }}
          style={{ color: statusColor, fontSize: 12 }}>
          {titleCase(mandate.status)}
        </Text>
      </View>

      <View style={{ marginTop: 14 }}>
        <Text
          font={{ family: 'SourceSans3', weight: 'SemiBold' }}
          style={{ color: MUTED, fontSize: 13 }}>
          Maximum amount
        </Text>
        <Text font={{ family: 'SourceSans3', weight: 'Bold' }} style={{ color: INK, fontSize: 19 }}>
          {formatCurrency(mandate.maximumAmount, mandate.currency)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        {mandate.status === 'requires_authorization' ? (
          <Pressable
            disabled={busy}
            onPress={onAuthorize}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 21,
              backgroundColor: ORANGE,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 13 }}>
              Authorize
            </Text>
          </Pressable>
        ) : null}
        {mandate.status !== 'revoked' && mandate.status !== 'expired' ? (
          <Pressable
            disabled={busy}
            onPress={onRevoke}
            style={{
              flex: 1,
              height: 42,
              borderRadius: 21,
              borderWidth: 1,
              borderColor: '#FECACA',
              backgroundColor: '#FFF1F0',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: busy ? 0.6 : 1,
            }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: DANGER, fontSize: 13 }}>
              Revoke
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useSession();
  const [profileUser, setProfileUser] = React.useState<PublicUserProfile | null>(null);
  const [cards, setCards] = React.useState<Card[]>([]);
  const [mandates, setMandates] = React.useState<DirectDebitMandate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const contactUser = profileUser ?? user;

  const missingPaymentContactDetails = [
    !contactUser?.email ? 'email' : null,
    !contactUser?.phoneNumber ? 'phone number' : null,
  ].filter(Boolean) as string[];
  const canStartPaymentSetup = missingPaymentContactDetails.length === 0;
  const missingPaymentContactLabel = missingPaymentContactDetails.join(' and ');

  const requirePaymentContactDetails = (action: string, next: string) => {
    if (canStartPaymentSetup) {
      return true;
    }

    if (!contactUser?.email) {
      router.push({
        pathname: '/settings/email' as never,
        params: { next },
      });
      return false;
    }

    if (!contactUser?.phoneNumber) {
      router.push({
        pathname: '/settings/phone' as never,
        params: { next },
      });
      return false;
    }

    setErrorMessage(
      'Add your ' + missingPaymentContactLabel + ' to your profile before ' + action + '.'
    );
    return false;
  };

  const startCardSetup = () => {
    if (!requirePaymentContactDetails('adding a card', '/cards/add')) {
      return;
    }

    router.push('/cards/add' as never);
  };

  const startDirectDebitSetup = () => {
    if (!requirePaymentContactDetails('setting up direct debit', '/direct-debit/new')) {
      return;
    }

    router.push('/direct-debit/new' as never);
  };

  const loadPaymentMethods = React.useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [currentUser, savedCards, directDebitMandates] = await Promise.all([
          getCurrentUser({ signal }),
          listCards({ signal }),
          listDirectDebitMandates({ signal }),
        ]);

        setProfileUser(currentUser);
        updateUser(currentUser);
        setCards(savedCards);
        setMandates(directDebitMandates);
      } catch (error) {
        if (signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof ApiRequestError
            ? error.message
            : 'Unable to load cards and direct debit mandates.'
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [updateUser]
  );

  useFocusEffect(
    React.useCallback(() => {
      const controller = new AbortController();
      loadPaymentMethods(controller.signal);

      return () => controller.abort();
    }, [loadPaymentMethods])
  );

  const refresh = React.useCallback(async () => {
    const controller = new AbortController();
    await loadPaymentMethods(controller.signal);
  }, [loadPaymentMethods]);

  const runCardAction = async (key: string, action: () => Promise<unknown>) => {
    setBusyKey(key);
    setErrorMessage(null);

    try {
      await action();
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Card action failed.');
    } finally {
      setBusyKey(null);
    }
  };

  const runMandateAction = async (key: string, action: () => Promise<unknown>) => {
    setBusyKey(key);
    setErrorMessage(null);

    try {
      await action();
      await refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError ? error.message : 'Direct debit action failed.'
      );
    } finally {
      setBusyKey(null);
    }
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
          <View>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 26 }}>
              Cards
            </Text>
            <Text
              font={{ family: 'SourceSans3', weight: 'SemiBold' }}
              style={{ marginTop: 1, color: MUTED, fontSize: 14 }}>
              Cards and direct debit
            </Text>
          </View>
          {isLoading ? <ActivityIndicator color={ORANGE} /> : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          <Pressable
            onPress={startCardSetup}
            style={{
              flex: 1,
              minWidth: 0,
              height: 52,
              borderRadius: 26,
              backgroundColor: ORANGE,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingHorizontal: 12,
            }}>
            <Plus color={INK} size={20} />
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              numberOfLines={1}
              style={{ color: INK, fontSize: 14 }}>
              Add card
            </Text>
          </Pressable>
          <Pressable
            onPress={startDirectDebitSetup}
            style={{
              flex: 1.18,
              minWidth: 0,
              height: 52,
              borderRadius: 26,
              backgroundColor: BLACK,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingHorizontal: 12,
            }}>
            <Building2 color="#FFFFFF" size={19} />
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              numberOfLines={1}
              style={{ color: '#FFFFFF', fontSize: 14 }}>
              Add bank
            </Text>
          </Pressable>
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
              style={{ color: DANGER, fontSize: 14 }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <Text
            font={{ family: 'SourceSans3', weight: 'Bold' }}
            style={{ color: INK, fontSize: 20 }}>
            Saved cards
          </Text>
          <View style={{ marginTop: 12 }}>
            {cards.length === 0 && !isLoading ? (
              <EmptyState
                title="No saved cards yet"
                actionLabel="Add card"
                onPress={startCardSetup}
              />
            ) : (
              cards.map((card) => (
                <SavedCard
                  key={card.uuid}
                  card={card}
                  busy={busyKey === card.uuid}
                  onSetDefault={() => runCardAction(card.uuid, () => setDefaultCard(card.uuid))}
                  onDisable={() => runCardAction(card.uuid, () => disableCard(card.uuid))}
                  onDelete={() => runCardAction(card.uuid, () => deleteCard(card.uuid))}
                />
              ))
            )}
          </View>
        </View>

        <View style={{ marginTop: 26 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              font={{ family: 'SourceSans3', weight: 'Bold' }}
              style={{ color: INK, fontSize: 20 }}>
              Direct debit
            </Text>
            <ShieldCheck color={MUTED} size={20} />
          </View>
          <View style={{ marginTop: 12 }}>
            {mandates.length === 0 && !isLoading ? (
              <EmptyState
                title="No bank yet"
                actionLabel="Add bank"
                onPress={startDirectDebitSetup}
              />
            ) : (
              mandates.map((mandate) => (
                <MandateRow
                  key={mandate.uuid}
                  mandate={mandate}
                  busy={busyKey === mandate.uuid}
                  onAuthorize={() =>
                    router.push({
                      pathname: '/direct-debit/authorize' as never,
                      params: { uuid: mandate.uuid },
                    })
                  }
                  onRevoke={() =>
                    runMandateAction(mandate.uuid, () =>
                      revokeDirectDebitMandate(mandate.uuid, { reason: 'User disabled mandate' })
                    )
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
