import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from './lib/theme';
import HomeScreen from './screens/HomeScreen';
import PickBrandScreen from './screens/PickBrandScreen';
import EditCardScreen from './screens/EditCardScreen';
import CardDetailScreen from './screens/CardDetailScreen';
import SettingsScreen from './screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  PickBrand: undefined;
  EditCard: { cardId?: number; brandId?: string | null };
  CardDetail: { cardId: number; fresh?: boolean };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const t = useTheme();
  const base = t.isDark ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...base,
          colors: { ...base.colors, background: t.bg, card: t.bg, text: t.text, primary: t.primary, border: t.border },
        }}
      >
        <StatusBar style={t.isDark ? 'light' : 'dark'} />
        <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerBackTitle: 'Zpět' }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Moje karty' }} />
          <Stack.Screen name="PickBrand" component={PickBrandScreen} options={{ title: 'Přidat kartu' }} />
          <Stack.Screen name="EditCard" component={EditCardScreen} options={{ title: 'Karta' }} />
          <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Nastavení' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
