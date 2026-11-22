import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { renderCodeSvg } from '../lib/barcodeSvg';
import { CodeFormat, FORMATS } from '../lib/codes';

type Props = {
  value: string;
  format: CodeFormat;
  /** Šířka v px. QR/Aztec/DataMatrix jsou čtvercové, ostatní mají poměr dle kódu. */
  width: number;
};

/** Vykreslí kód na bílém pozadí (nutné pro spolehlivé čtení skenerem). */
export default function CodeView({ value, format, width }: Props) {
  const r = useMemo(() => renderCodeSvg(format, value), [format, value]);
  const square = FORMATS[format].square;

  if (!r.ok) {
    return (
      <View style={[styles.box, { width, padding: 16 }]}>
        <Text style={styles.err}>Kód se nepodařilo vykreslit.{'\n'}Zkontrolujte číslo a typ kódu.</Text>
      </View>
    );
  }
  // Poměr stran vezmeme z viewBox vygenerovaného SVG.
  const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(r.svg);
  const ratio = m ? Number(m[1]) / Number(m[2]) : square ? 1 : 3;
  const innerW = width - 16;
  const innerH = innerW / ratio;

  return (
    <View style={[styles.box, { width }]}>
      <SvgXml xml={r.svg} width={innerW} height={innerH} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#fff', borderRadius: 12, padding: 8, alignItems: 'center', justifyContent: 'center' },
  err: { color: '#B00020', textAlign: 'center' },
});
