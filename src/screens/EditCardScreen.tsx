import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import CodeView from '../components/CodeView';
import ScannerModal from '../components/ScannerModal';
import { BRAND_BY_ID, CARD_COLORS } from '../data/brands';
import { validateCode } from '../lib/barcodeSvg';
import { CodeFormat, FORMAT_ORDER, FORMATS } from '../lib/codes';
import { addCard, getCard, updateCard } from '../lib/db';
import { scanImage, ScanResult } from '../lib/imageScan';
import { useTheme } from '../lib/theme';

export default function EditCardScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'EditCard'>) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { cardId, brandId } = route.params;
  const brand = brandId ? BRAND_BY_ID[brandId] : undefined;

  const [name, setName] = useState(brand?.name ?? '');
  const [color, setColor] = useState(brand?.color ?? CARD_COLORS[7]);
  const [value, setValue] = useState('');
  const [format, setFormat] = useState<CodeFormat>(brand?.kind === 'qr' ? 'qr' : 'code128');
  const [notes, setNotes] = useState('');
  const [storedBrandId, setStoredBrandId] = useState<string | null>(brandId ?? null);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!cardId);
  const [scanInfo, setScanInfo] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: cardId ? 'Upravit kartu' : 'Nová karta' });
  }, [navigation, cardId]);

  useEffect(() => {
    if (!cardId) return;
    getCard(cardId).then((c) => {
      if (!c) return navigation.goBack();
      setName(c.name);
      setColor(c.color);
      setValue(c.value);
      setFormat(c.format);
      setNotes(c.notes);
      setStoredBrandId(c.brandId);
      setLoaded(true);
    });
  }, [cardId, navigation]);

  const applyScan = (r: ScanResult) => {
    setValue(r.value);
    setFormat(r.format);
    setScanInfo(`Načteno: ${FORMATS[r.format].label}`);
  };

  const onCamera = (r: ScanResult) => {
    setScanning(false);
    applyScan(r);
  };

  const onPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets?.[0]) return;
      setBusy(true);
      const r = await scanImage(res.assets[0].uri);
      if (r) applyScan(r);
      else
        Alert.alert(
          'Kód se nepodařilo načíst',
          'Na fotce jsem žádný kód nenašel. Zkuste ostřejší fotku, nebo ořízněte obrázek jen na kód. Číslo můžete taky opsat ručně.',
        );
    } catch (e) {
      Alert.alert('Chyba', e instanceof Error ? e.message : 'Fotku se nepodařilo otevřít.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const n = name.trim();
    const v = value.trim();
    if (!n) return Alert.alert('Chybí název', 'Zadejte název karty.');
    const err = validateCode(format, v);
    if (err) return Alert.alert('Neplatný kód', err);
    const data = { name: n, value: v, format, color, notes: notes.trim(), brandId: storedBrandId };
    if (cardId) {
      await updateCard(cardId, data);
      navigation.goBack();
    } else {
      const id = await addCard(data);
      navigation.popToTop();
      navigation.navigate('CardDetail', { cardId: id });
    }
  };

  if (!loaded) return <ActivityIndicator style={{ flex: 1 }} />;

  const codeErr = value.trim() ? validateCode(format, value.trim()) : null;
  const inputStyle = [styles.input, { backgroundColor: t.card, color: t.text, borderColor: t.border }];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: t.bg }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {brand && !cardId && (
          <Text style={[styles.hint, { color: t.sub }]}>
            {brand.name} obvykle používá {brand.kind === 'qr' ? 'QR kód' : 'klasický čárový kód'}.
          </Text>
        )}

        <Text style={[styles.label, { color: t.sub }]}>Název</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Např. Albert" placeholderTextColor={t.sub} style={inputStyle} />

        <Text style={[styles.label, { color: t.sub }]}>Barva</Text>
        <View style={styles.colors}>
          {CARD_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityLabel={`Barva ${c}`}
              style={[styles.swatch, { backgroundColor: c }, color.toLowerCase() === c.toLowerCase() && styles.swatchOn]}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: t.sub }]}>Kód karty</Text>
        <View style={styles.row}>
          <Pressable style={[styles.src, { backgroundColor: t.primary }]} onPress={() => setScanning(true)}>
            <Text style={[styles.srcIcon]}>📷</Text>
            <Text style={[styles.srcText, { color: t.onPrimary }]}>Skenovat kamerou</Text>
          </Pressable>
          <Pressable style={[styles.src, { backgroundColor: t.primary }]} onPress={onPhoto} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={t.onPrimary} />
            ) : (
              <>
                <Text style={styles.srcIcon}>🖼️</Text>
                <Text style={[styles.srcText, { color: t.onPrimary }]}>Z uložené fotky</Text>
              </>
            )}
          </Pressable>
        </View>
        <Text style={[styles.or, { color: t.sub }]}>nebo zadejte ručně</Text>

        <TextInput
          value={value}
          onChangeText={(v) => {
            setValue(v);
            setScanInfo(null);
          }}
          placeholder="Číslo / obsah kódu"
          placeholderTextColor={t.sub}
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle}
        />
        {scanInfo && <Text style={[styles.ok]}>{scanInfo}</Text>}

        <Text style={[styles.label, { color: t.sub }]}>Typ kódu</Text>
        <View style={styles.chips}>
          {FORMAT_ORDER.map((f) => {
            const on = f === format;
            return (
              <Pressable
                key={f}
                onPress={() => setFormat(f)}
                style={[styles.chip, { backgroundColor: on ? t.primary : t.chip }]}
              >
                <Text style={{ color: on ? t.onPrimary : t.text, fontWeight: '600', fontSize: 13 }}>
                  {FORMATS[f].label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.hint, { color: t.sub }]}>
          {FORMATS[format].kind === 'qr' ? '2D / QR typ kódu' : 'Klasický čárový kód'}
        </Text>

        {value.trim() ? (
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            {codeErr ? (
              <Text style={[styles.err]}>{codeErr}</Text>
            ) : (
              <CodeView value={value.trim()} format={format} width={Math.min(width - 32, 360)} />
            )}
          </View>
        ) : null}

        <Text style={[styles.label, { color: t.sub }]}>Poznámka (volitelné)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Např. PIN, platnost…"
          placeholderTextColor={t.sub}
          style={[...inputStyle, { minHeight: 64 }]}
          multiline
        />

        <Pressable style={[styles.save, { backgroundColor: t.primary }]} onPress={save}>
          <Text style={[styles.saveText, { color: t.onPrimary }]}>{cardId ? 'Uložit změny' : 'Uložit kartu'}</Text>
        </Pressable>
      </ScrollView>

      <ScannerModal visible={scanning} onClose={() => setScanning(false)} onResult={onCamera} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 18, marginBottom: 6 },
  hint: { fontSize: 13, marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: '#888', transform: [{ scale: 1.12 }] },
  row: { flexDirection: 'row', gap: 10 },
  src: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 4, justifyContent: 'center', minHeight: 84 },
  srcIcon: { fontSize: 26 },
  srcText: { fontWeight: '700', fontSize: 14, textAlign: 'center' },
  or: { textAlign: 'center', marginVertical: 10 },
  ok: { color: '#2E7D32', marginTop: 6, fontWeight: '600' },
  err: { color: '#D32F2F', textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  save: { marginTop: 28, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveText: { fontSize: 17, fontWeight: '700' },
});
