import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BRAND_LOGOS } from '../data/brandLogos';
import { onColor } from '../data/brands';

type Props = {
  name: string;
  color: string;
  brandId?: string | null;
  /** Vlastní logo (data URI) – má přednost před vestavěným. */
  logo?: string | null;
  size: number;
};

function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Logo karty: 1) vlastní obrázek, 2) vestavěné vektorové logo značky,
 * 3) monogram. Barva vektorového loga a monogramu se přizpůsobí pozadí.
 */
export default function BrandLogo({ name, color, brandId, logo, size }: Props) {
  const fg = onColor(color);
  if (logo) {
    return <Image source={{ uri: logo }} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel={name} />;
  }
  const builtin = brandId ? BRAND_LOGOS[brandId] : undefined;
  if (builtin) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel={builtin.title}>
        <Path d={builtin.path} fill={fg} />
      </Svg>
    );
  }
  return (
    <View style={[styles.mono, { width: size, height: size }]}>
      <Text style={{ color: fg, fontSize: size * 0.55, fontWeight: '800' }} numberOfLines={1} adjustsFontSizeToFit>
        {monogram(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ mono: { alignItems: 'center', justifyContent: 'center' } });
