import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { Brand, BRANDS } from '../data/brands';
import { useTheme } from '../lib/theme';

export default function PickBrandScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'PickBrand'>) {
  const t = useTheme();
  const [q, setQ] = useState('');

  const sections = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = BRANDS.filter((b) => !s || b.name.toLowerCase().includes(s));
    const map = new Map<string, Brand[]>();
    for (const b of list) map.set(b.category, [...(map.get(b.category) ?? []), b]);
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [q]);

  const open = (brandId: string | null) => navigation.navigate('EditCard', { brandId });

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Hledat obchod nebo značku"
        placeholderTextColor={t.sub}
        style={[styles.search, { backgroundColor: t.card, color: t.text, borderColor: t.border }]}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <SectionList
        sections={sections}
        keyExtractor={(b) => b.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <Pressable
            onPress={() => open(null)}
            style={[styles.row, styles.custom, { backgroundColor: t.card, borderColor: t.primary }]}
          >
            <View style={[styles.dot, { backgroundColor: t.primary }]}>
              <Text style={{ color: t.onPrimary, fontWeight: '800' }}>＋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: t.text }]}>Jiná / vlastní karta</Text>
              <Text style={[styles.sub, { color: t.sub }]}>Naskenovat, nahrát z fotky nebo zadat ručně</Text>
            </View>
          </Pressable>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.section, { color: t.sub, backgroundColor: t.bg }]}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => open(item.id)}
            style={({ pressed }) => [styles.row, { backgroundColor: t.card, opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.name, { color: t.text, flex: 1 }]}>{item.name}</Text>
            <View style={[styles.chip, { backgroundColor: t.chip }]}>
              <Text style={[styles.chipText, { color: t.text }]}>{item.kind === 'qr' ? 'QR kód' : 'Čárový kód'}</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <Text style={[styles.footer, { color: t.sub }]}>
            Typ kódu u značek je jen orientační (karty se časem mění). Při skenování se skutečný typ rozpozná
            automaticky.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { margin: 16, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  section: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 6, padding: 12, borderRadius: 12 },
  custom: { borderWidth: 1.5, marginBottom: 8 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  chip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: '600' },
  footer: { fontSize: 12, padding: 16, textAlign: 'center' },
});
