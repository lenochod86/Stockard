import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { onColor } from '../data/brands';
import { Card } from '../lib/db';
import { FORMATS } from '../lib/codes';

export default function CardTile({ card, onPress }: { card: Card; onPress: () => void }) {
  const fg = onColor(card.color);
  const kind = FORMATS[card.format].kind === 'qr' ? 'QR' : 'Čárový kód';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${card.name}, ${kind}`}
      style={({ pressed }) => [styles.tile, { backgroundColor: card.color, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={[styles.name, { color: fg }]} numberOfLines={2}>
        {card.name}
      </Text>
      <View style={[styles.badge, { backgroundColor: fg === '#FFFFFF' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)' }]}>
        <Text style={[styles.badgeText, { color: fg }]}>{kind}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 104,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    margin: 6,
  },
  name: { fontSize: 17, fontWeight: '700' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
