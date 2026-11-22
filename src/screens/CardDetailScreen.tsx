import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import type { RootStackParamList } from '../App';
import CodeView from '../components/CodeView';
import { onColor } from '../data/brands';
import { FORMATS } from '../lib/codes';
import { Card, deleteCard, getCard, touchCard } from '../lib/db';
import { useTheme } from '../lib/theme';

export default function CardDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'CardDetail'>) {
  useKeepAwake();
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { cardId } = route.params;
  const [card, setCard] = useState<Card | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getCard(cardId).then((c) => {
        if (!alive) return;
        if (!c) return navigation.goBack();
        setCard(c);
        touchCard(cardId).catch(() => {});
      });

      // Zvýšit jas, aby šel kód na pokladně dobře přečíst; po odchodu vrátit.
      // (Jas jen pro okno aplikace – nevyžaduje žádné oprávnění.)
      let prev: number | null = null;
      Brightness.getBrightnessAsync()
        .then((b) => {
          prev = b;
          return Brightness.setBrightnessAsync(1);
        })
        .catch(() => {});
      return () => {
        alive = false;
        if (prev !== null) Brightness.setBrightnessAsync(prev).catch(() => {});
      };
    }, [cardId, navigation]),
  );

  useLayoutEffect(() => {
    if (card) navigation.setOptions({ title: card.name });
  }, [navigation, card]);

  const confirmDelete = () => {
    Alert.alert('Smazat kartu?', `Karta „${card?.name}“ bude odstraněna z tohoto telefonu.`, [
      { text: 'Zrušit', style: 'cancel' },
      {
        text: 'Smazat',
        style: 'destructive',
        onPress: async () => {
          await deleteCard(cardId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!card) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const info = FORMATS[card.format];
  const fg = onColor(card.color);
  const codeWidth = Math.min(width - 32, info.square ? 320 : 480);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: card.color }]}>
        <Text style={[styles.name, { color: fg }]}>{card.name}</Text>
        <Text style={[styles.type, { color: fg }]}>{info.kind === 'qr' ? 'QR kód' : 'Čárový kód'} · {info.label}</Text>
      </View>

      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <CodeView value={card.value} format={card.format} width={codeWidth} />
        <Text selectable style={[styles.value, { color: t.text }]}>
          {card.value.length > 60 ? card.value.slice(0, 60) + '…' : card.value}
        </Text>
      </View>

      {!!card.notes && (
        <View style={[styles.notes, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={{ color: t.sub, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>POZNÁMKA</Text>
          <Text style={{ color: t.text, fontSize: 15 }}>{card.notes}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, { backgroundColor: t.chip }]}
          onPress={() => navigation.navigate('EditCard', { cardId: card.id })}
        >
          <Text style={[styles.btnText, { color: t.text }]}>Upravit</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: t.chip }]} onPress={confirmDelete}>
          <Text style={[styles.btnText, { color: t.danger }]}>Smazat</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  hero: { borderRadius: 18, padding: 20 },
  name: { fontSize: 24, fontWeight: '800' },
  type: { fontSize: 14, marginTop: 4, opacity: 0.9 },
  value: { marginTop: 14, fontSize: 18, letterSpacing: 1.5, fontVariant: ['tabular-nums'] },
  notes: { marginTop: 20, padding: 14, borderRadius: 12, borderWidth: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
});
