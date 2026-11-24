import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SORT_LABELS, SortMode } from '../lib/sort';
import { useTheme } from '../lib/theme';

type Props = { visible: boolean; value: SortMode; modes: SortMode[]; onSelect: (m: SortMode) => void; onClose: () => void };

export default function SortSheet({ visible, value, modes, onSelect, onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Zavřít">
        <Pressable style={[styles.sheet, { backgroundColor: t.card, paddingBottom: insets.bottom + 12 }]} onPress={() => {}}>
          <Text style={[styles.title, { color: t.sub }]}>Seřadit podle</Text>
          {modes.map((m) => (
            <Pressable
              key={m}
              style={styles.row}
              onPress={() => {
                onSelect(m);
                onClose();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: m === value }}
            >
              <Text style={[styles.label, { color: t.text, fontWeight: m === value ? '700' : '400' }]}>{SORT_LABELS[m]}</Text>
              <View style={{ width: 24 }}>{m === value && <Text style={{ color: t.primary, fontSize: 18 }}>✓</Text>}</View>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingHorizontal: 20 },
  title: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  label: { fontSize: 17 },
});
