import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { ReactNode } from 'react';

export const HORIONTAL_PADDING = 10;

interface BodyProps {
  children: ReactNode;
}

const Body = ({ children }: BodyProps) => {
  return <SafeAreaView style={{ paddingHorizontal: HORIONTAL_PADDING }}>{children}</SafeAreaView>;
};

export default Body;
