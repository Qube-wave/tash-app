import { resolveFontFamily } from '@/constants/fonts';
import { useColors } from '@/lib/use-colors';
import { Tabs } from 'expo-router';
import { CreditCard, Home, User } from 'lucide-react-native';
import { type ColorValue, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = {
  index: Home,
  cards: CreditCard,
  profile: User,
} as const;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const renderIcon =
    (name: keyof typeof ICONS) =>
    ({ color, focused }: { color: ColorValue; focused: boolean }) => {
      const Icon = ICONS[name];
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon color={color} size={23} strokeWidth={focused ? 2.5 : 2} />
        </View>
      );
    };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 62 + (insets.bottom > 0 ? insets.bottom - 6 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom - 6 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: resolveFontFamily('SourceSans3', 'Medium'),
          fontSize: 11,
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.placeholder,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: renderIcon('index') }}
      />
      <Tabs.Screen
        name="cards"
        options={{ title: 'Cards', tabBarIcon: renderIcon('cards') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: renderIcon('profile') }}
      />
    </Tabs>
  );
}
