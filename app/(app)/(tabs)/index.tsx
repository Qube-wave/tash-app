import { GradientFill } from '@/components/shared/gradient';
import { Text } from '@/components/ui/text';
import { useColors } from '@/lib/use-colors';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  ScanLine,
  Send,
  Users,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AVATAR = 'https://i.pravatar.cc/100?img=68';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const TXNS = [
  { title: 'Money Received', sub: 'From Adaeze Okoro • Today, 9:41 AM', amount: '+₦45,000', in: true },
  { title: 'Tap & Pay', sub: 'Store purchase • Today, 8:02 AM', amount: '-₦12,000', in: false },
  { title: 'Split Bills', sub: 'With 3 people • Yesterday', amount: '-₦6,500', in: false },
  { title: 'Send Money', sub: 'To Praise Dominic • Jul 4', amount: '-₦20,000', in: false },
];

export default function DashboardHome() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [hidden, setHidden] = React.useState(false);

  const QUICK = [
    { icon: Send, label: 'Send Money' },
    { icon: Users, label: 'Split Bills' },
    { icon: ScanLine, label: 'Scan / Tap' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* balance panel */}
        <View
          style={{
            paddingTop: insets.top + 14,
            paddingHorizontal: 22,
            paddingBottom: 52,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            overflow: 'hidden',
          }}>
          <GradientFill from={colors.accent} to={colors.accentDeep} />

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text
                font={{ family: 'SourceSans3', weight: 'Medium' }}
                style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                {greeting()},
              </Text>
              <Text
                font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
                style={{ color: '#FFFFFF', fontSize: 20, marginTop: 1 }}>
                Timileyin
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Bell color="#FFFFFF" size={20} strokeWidth={2} />
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 9,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
              <Image
                source={{ uri: AVATAR }}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff30' }}
              />
            </View>
          </View>

          <Text
            font={{ family: 'SourceSans3', weight: 'Medium' }}
            style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 26 }}>
            Available Balance
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'Bold' }}
                style={{ color: '#FFFFFF', fontSize: 40, lineHeight: 48, letterSpacing: -0.5 }}>
                {hidden ? '₦ • • • •' : '₦38,400'}
              </Text>
              {!hidden && (
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, lineHeight: 40 }}>
                  .00
                </Text>
              )}
            </View>
            <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10}>
              {hidden ? (
                <EyeOff color="rgba(255,255,255,0.85)" size={22} />
              ) : (
                <Eye color="rgba(255,255,255,0.85)" size={22} />
              )}
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
            <PanelButton icon={<ArrowDownLeft color="#FFFFFF" size={18} />} label="Add Money" />
            <PanelButton icon={<ArrowUpRight color="#FFFFFF" size={18} />} label="Send Money" />
          </View>
        </View>

        {/* floating quick actions */}
        <View
          style={{
            marginTop: -32,
            marginHorizontal: 22,
            backgroundColor: colors.bg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 18,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 5,
          }}>
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Pressable key={q.label} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: colors.accent + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon color={colors.accent} size={21} />
                </View>
                <Text
                  font={{ family: 'SourceSans3', weight: 'Medium' }}
                  style={{ fontSize: 12, color: colors.heading }}>
                  {q.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* body */}
        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          {/* request card promo */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.accent + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <CreditCard color={colors.accent} size={22} />
              </View>
              <Text
                font={{ family: 'SourceSans3', weight: 'Medium' }}
                style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.heading }}>
                Link a physical card for seamless spending and split anywhere.
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 15, color: colors.accent }}>
                Link Card
              </Text>
              <ChevronRight color={colors.accent} size={18} />
            </Pressable>
          </View>

          {/* section header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 26,
            }}>
            <Text
              font={{ family: 'PlayfairDisplay', weight: 'Bold' }}
              style={{ fontSize: 18, color: colors.heading }}>
              Recent Activity
            </Text>
            <Pressable>
              <Text
                font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                style={{ fontSize: 13, color: colors.accent }}>
                See all
              </Text>
            </Pressable>
          </View>

          {/* history list */}
          <View style={{ marginTop: 6 }}>
            {TXNS.map((t, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: t.in ? colors.accent + '1A' : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {t.in ? (
                    <ArrowDownLeft color={colors.accent} size={20} />
                  ) : (
                    <ArrowUpRight color={colors.heading} size={20} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                    style={{ fontSize: 15, color: colors.heading }}>
                    {t.title}
                  </Text>
                  <Text font={{ family: 'SourceSans3' }} style={{ fontSize: 13, color: colors.subtitle }}>
                    {t.sub}
                  </Text>
                </View>
                <Text
                  font={{ family: 'SourceSans3', weight: 'SemiBold' }}
                  style={{ fontSize: 15, color: t.in ? '#2E9E5B' : colors.heading }}>
                  {t.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PanelButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Pressable
      style={{
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.18)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
      {icon}
      <Text
        font={{ family: 'SourceSans3', weight: 'SemiBold' }}
        style={{ color: '#FFFFFF', fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}
