import { Tabs } from 'expo-router';
import { CreditCard, Home, User } from 'lucide-react-native';
import { type ColorValue, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = {
  index: Home,
  cards: CreditCard,
  profile: User,
} as const;

const CREAM = '#FAFAF1';
const ORANGE = '#FF6A12';
const BLACK = '#050505';
const INACTIVE = '#F7F3E9';
const TAB_BAR_WIDTH = 214;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const renderIcon =
    (name: keyof typeof ICONS) =>
    ({ color, focused }: { color: ColorValue; focused: boolean }) => {
      const Icon = ICONS[name];

      return (
        <View
          style={{
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon color={color} size={23} strokeWidth={focused ? 2.8 : 2.2} />
        </View>
      );
    };

  const renderTabBar = ({ state, descriptors, navigation }: any) => (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 10,
        alignItems: 'center',
      }}>
      <View
        style={{
          width: TAB_BAR_WIDTH,
          height: 62,
          borderRadius: 31,
          backgroundColor: BLACK,
          padding: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 10,
        }}>
        {state.routes.map(
          (route: { key: string; name: string; params?: object }, index: number) => {
            const focused = state.index === index;
            const options = descriptors[route.key]?.options;
            const color = focused ? BLACK : INACTIVE;
            const label = options?.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : undefined}
                accessibilityLabel={label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  width: 58,
                  height: 46,
                  borderRadius: 999,
                  backgroundColor: focused ? ORANGE : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                {options?.tabBarIcon?.({ color, focused, size: 23 })}
              </Pressable>
            );
          }
        )}
      </View>
    </View>
  );

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: BLACK,
        tabBarInactiveTintColor: INACTIVE,
        sceneStyle: {
          backgroundColor: CREAM,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: renderIcon('index'),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: 'Cards',
          tabBarIcon: renderIcon('cards'),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: renderIcon('profile'),
        }}
      />
    </Tabs>
  );
}
