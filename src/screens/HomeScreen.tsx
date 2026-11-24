import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../App';
import CardTile from '../components/CardTile';
import SortSheet from '../components/SortSheet';
import { Card, CardUse, getSetting, listCards, listUses, setSetting } from '../lib/db';
import { formatDistance, LatLon, nearestUseDistances } from '../lib/geo';
import { askLocationPermission, getLocationPref, getPosition, setLocationPref } from '../lib/location';
import { buildSections, SORT_LABELS, SortMode, sortCards } from '../lib/sort';
import { useTheme } from '../lib/theme';

type Item =
  | { type: 'header'; key: string; title: string; action?: 'sort' }
  | { type: 'row'; key: string; cards: { card: Card; tag?: string }[] };

const SORT_KEY = 'sort_mode';

function rows(prefix: string, list: { card: Card; tag?: string }[]): Item[] {
  const out: Item[] = [];
  for (let i = 0; i < list.length; i += 2) {
    out.push({ type: 'row', key: `${prefix}-${i}`, cards: list.slice(i, i + 2) });
  }
  return out;
}

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [uses, setUses] = useState<CardUse[]>([]);
  const [pos, setPos] = useState<LatLon | null>(null);
  const [locPref, setLocPref] = useState<boolean | null>(false);
  const [sort, setSort] = useState<SortMode>('recent');
  const [sheet, setSheet] = useState(false);
  const [q, setQ] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Settings')} accessibilityLabel="Nastavení" hitSlop={12}>
          <Text style={{ fontSize: 22, color: t.text }}>⚙︎</Text>
        </Pressable>
      ),
    });
  }, [navigation, t.text]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const [c, u, pref, savedSort] = await Promise.all([listCards(), listUses(), getLocationPref(), getSetting(SORT_KEY)]);
        if (!alive) return;
        setCards(c);
        setUses(u);
        setLocPref(pref);
        if (savedSort && savedSort in SORT_LABELS) setSort(savedSort as SortMode);
        if (pref === true) {
          // Nejdřív rychle poslední známá poloha, pak případně přesnější.
          const fast = await getPosition(true);
          if (alive && fast) setPos(fast);
          if (!fast) {
            const fresh = await getPosition(false);
            if (alive) setPos(fresh);
          }
        } else {
          setPos(null);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const distances = useMemo(() => (pos && locPref ? nearestUseDistances(uses, pos) : null), [pos, locPref, uses]);

  const items = useMemo<Item[]>(() => {
    if (!cards) return [];
    const s = q.trim().toLowerCase();
    if (s) {
      const found = sortCards(cards.filter((c) => c.name.toLowerCase().includes(s)), sort, distances ?? undefined);
      return rows('s', found.map((card) => ({ card })));
    }
    const sec = buildSections(cards, sort, distances);
    const out: Item[] = [];
    if (sec.nearby.length) {
      out.push({ type: 'header', key: 'h-near', title: 'V okolí' });
      out.push(...rows('n', sec.nearby.map((n) => ({ card: n.card, tag: formatDistance(n.distance) }))));
    }
    if (sec.frequent.length) {
      out.push({ type: 'header', key: 'h-freq', title: 'Často používané' });
      out.push(...rows('f', sec.frequent.map((card) => ({ card }))));
    }
    out.push({ type: 'header', key: 'h-all', title: `${cards.length} ${plural(cards.length)}`, action: 'sort' });
    out.push(...rows('a', sec.all.map((card) => ({ card }))));
    return out;
  }, [cards, q, sort, distances]);

  const chooseSort = (m: SortMode) => {
    setSort(m);
    setSetting(SORT_KEY, m).catch(() => {});
  };

  const answerLocation = async (on: boolean) => {
    const granted = on ? await askLocationPermission() : false;
    await setLocationPref(granted);
    setLocPref(granted);
    if (granted) setPos(await getPosition(false));
  };

  const modes: SortMode[] = locPref
    ? ['recent', 'frequent', 'name', 'added', 'distance']
    : ['recent', 'frequent', 'name', 'added'];
  const sortMode: SortMode = !locPref && sort === 'distance' ? 'recent' : sort;

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

      {cards && cards.length > 0 && locPref === null && !q && (
        <View style={[styles.banner, { backgroundColor: t.card, borderColor: t.primary }]}>
          <Text style={[styles.bannerTitle, { color: t.text }]}>📍 Nabízet karty podle místa?</Text>
          <Text style={[styles.bannerText, { color: t.sub }]}>
            Aplikace si bude pamatovat, kde jsi kterou kartu použil, a poblíž ti ji nabídne nahoře. Poloha se čte jen při
            otevření aplikace a ukládá se výhradně v tomto telefonu.
          </Text>
          <View style={styles.bannerBtns}>
            <Pressable style={[styles.bBtn, { backgroundColor: t.primary }]} onPress={() => answerLocation(true)}>
              <Text style={{ color: t.onPrimary, fontWeight: '700' }}>Zapnout</Text>
            </Pressable>
            <Pressable style={[styles.bBtn, { backgroundColor: t.chip }]} onPress={() => answerLocation(false)}>
              <Text style={{ color: t.text, fontWeight: '600' }}>Teď ne</Text>
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ padding: 10, paddingBottom: insets.bottom + 100, flexGrow: 1 }}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: t.text }]}>{item.title}</Text>
              {item.action === 'sort' && (
                <Pressable onPress={() => setSheet(true)} hitSlop={10} accessibilityRole="button">
                  <Text style={[styles.sortLink, { color: t.sub }]}>{SORT_LABELS[sortMode]} ▾</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.row}>
              {item.cards.map(({ card, tag }) => (
                <CardTile key={card.id} card={card} tag={tag} onPress={() => navigation.navigate('CardDetail', { cardId: card.id })} />
              ))}
              {item.cards.length === 1 && <View style={{ flex: 1, margin: 6 }} />}
            </View>
          )
        }
        ListEmptyComponent={
          cards ? (
            <View style={styles.empty}>
              <Text style={styles.emoji}>💳</Text>
              <Text style={[styles.emptyTitle, { color: t.text }]}>{q ? 'Nic nenalezeno' : 'Zatím tu nemáte žádné karty'}</Text>
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

      <SortSheet visible={sheet} value={sortMode} modes={modes} onSelect={chooseSort} onClose={() => setSheet(false)} />
    </View>
  );
}

function plural(n: number) {
  if (n === 1) return 'věrnostní karta';
  if (n >= 2 && n <= 4) return 'věrnostní karty';
  return 'věrnostních karet';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { margin: 16, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  banner: { marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  bannerTitle: { fontSize: 16, fontWeight: '700' },
  bannerText: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  bannerBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  bBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginHorizontal: 6, marginTop: 14, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  sortLink: { fontSize: 14, textDecorationLine: 'underline' },
  row: { flexDirection: 'row' },
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
