import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { onColor } from '../data/brands';
import { Card } from '../lib/db';
import { FORMATS } from '../lib/codes';
import BrandLogo from './BrandLogo';

type Props = { card: Card; onPress: () => void; /** např. „120 m“ u karet z okolí */ tag?: string };

export default function CardTile({ card, onPress, tag }: Props) {
  const fg = onColor(card.color);
  const kind = FORMATS[card.format].kind === 'qr' ? 'QR' : 'Čárový kód';
  const pill = fg === '#FFFFFF' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${card.name}, ${kind}${tag ? `, ${tag}` : ''}`}
      style={({ pressed }) => [styles.tile, { backgroundColor: card.color, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.logoWrap}>
        <BrandLogo name={card.name} color={card.color} brandId={card.brandId} logo={card.logo} size={52} />
      </View>
      <Text style={[styles.name, { color: fg }]} numberOfLines={1}>
        {card.name}
      </Text>
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: pill }]}>
          <Text style={[styles.badgeText, { color: fg }]}>{kind}</Text>
        </View>
        {tag ? (
          <View style={[styles.badge, { backgroundColor: pill }]}>
            <Text style={[styles.badgeText, { color: fg }]}>📍 {tag}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minHeight: 130, borderRadius: 16, padding: 12, margin: 6, justifyContent: 'space-between' },
  logoWrap: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 4 },
  name: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  badges: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
