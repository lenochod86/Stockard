import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../App';
import CardTile from '../components/CardTile';
import { Card, listCards } from '../lib/db';
import { useTheme } from '../lib/theme';

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [q, setQ] = useState('');

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      listCards().then((c) => alive && setCards(c));
      return () => {
        alive = false;
      };
    }, []),
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (cards ?? []).filter((c) => !s || c.name.toLowerCase().includes(s));
  }, [cards, q]);

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {cards && cards.length > 0 && (
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Hledat kartu"
          placeholderTextColor={t.sub}
          style={[styles.search, { backgroundColor: t.card, color: t.text, borderColor: t.border }]}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      )}
      <FlatList
        data={filtered}
        keyExtractor={(c) => String(c.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 10, paddingBottom: insets.bottom + 100, flexGrow: 1 }}
        renderItem={({ item }) => (
          <CardTile card={item} onPress={() => navigation.navigate('CardDetail', { cardId: item.id })} />
        )}
        ListEmptyComponent={
          cards ? (
            <View style={styles.empty}>
              <Text style={styles.emoji}>💳</Text>
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                {q ? 'Nic nenalezeno' : 'Zatím tu nemáte žádné karty'}
              </Text>
              {!q && (
                <Text style={[styles.emptySub, { color: t.sub }]}>
                  Přidejte první kartu tlačítkem dole. Všechno zůstává jen ve vašem telefonu.
                </Text>
              )}
            </View>
          ) : undefined
        }
      />
      <Pressable
        onPress={() => navigation.navigate('PickBrand')}
        accessibilityRole="button"
        accessibilityLabel="Přidat kartu"
        style={[styles.fab, { backgroundColor: t.primary, bottom: insets.bottom + 20 }]}
      >
        <Text style={[styles.fabText, { color: t.onPrimary }]}>＋  Přidat kartu</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { margin: 16, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 15, textAlign: 'center' },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { fontSize: 16, fontWeight: '700' },
});
