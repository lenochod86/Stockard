import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clearUseHistory, countUses } from '../lib/db';
import { askLocationPermission, getLocationPref, setLocationPref } from '../lib/location';
import { useTheme } from '../lib/theme';

export default function SettingsScreen() {
  const t = useTheme();
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    setOn((await getLocationPref()) === true);
    setCount(await countUses());
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggle = async (v: boolean) => {
    if (v) {
      const ok = await askLocationPermission();
      if (!ok) {
        Alert.alert('Poloha není povolena', 'Povolte přístup k poloze pro tuto aplikaci v nastavení systému.');
        return;
      }
    }
    await setLocationPref(v);
    setOn(v);
  };

  const clear = () =>
    Alert.alert('Smazat historii míst?', `Odstraní se ${count} uložených míst použití. Karty zůstanou.`, [
      { text: 'Zrušit', style: 'cancel' },
      {
        text: 'Smazat',
        style: 'destructive',
        onPress: async () => {
          await clearUseHistory();
          setCount(0);
        },
      },
    ]);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.box, { backgroundColor: t.card }]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: t.text }]}>Návrhy podle místa</Text>
            <Text style={[styles.sub, { color: t.sub }]}>
              Při otevření karty se uloží přibližné místo. Když se na něj vrátíš, karta se nabídne nahoře v „V okolí“.
            </Text>
          </View>
          <Switch value={on} onValueChange={toggle} />
        </View>
      </View>

      <Text style={[styles.note, { color: t.sub }]}>
        Poloha se čte jen když je aplikace otevřená (ne na pozadí). Místa se ukládají výhradně v tomto telefonu, nikam se
        neodesílají a u každé karty se pamatuje nejvýše 40 nejnovějších.
      </Text>

      <Pressable
        onPress={clear}
        disabled={count === 0}
        style={[styles.btn, { backgroundColor: t.card, opacity: count === 0 ? 0.5 : 1 }]}
      >
        <Text style={{ color: t.danger, fontSize: 16, fontWeight: '600' }}>Smazat historii míst ({count})</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 17, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  note: { fontSize: 13, marginTop: 14, marginBottom: 20, lineHeight: 18 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
});
