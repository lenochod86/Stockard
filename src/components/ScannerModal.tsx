import React, { useCallback, useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { normalizeFormat, SCAN_TYPES } from '../lib/codes';
import type { ScanResult } from '../lib/imageScan';

type Props = {
  visible: boolean;
  onClose: () => void;
  onResult: (r: ScanResult) => void;
};

export default function ScannerModal({ visible, onClose, onResult }: Props) {
  const [perm, requestPerm] = useCameraPermissions();
  const done = useRef(false);
  const [torch, setTorch] = useState(false);
  const insets = useSafeAreaInsets();

  const handle = useCallback(
    (e: { type: string; data: string }) => {
      if (done.current) return;
      const format = normalizeFormat(e.type);
      if (!format || !e.data) return;
      done.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onResult({ value: e.data, format });
    },
    [onResult],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={() => {
        done.current = false;
        setTorch(false);
      }}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {perm?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{ barcodeTypes: [...SCAN_TYPES] }}
            onBarcodeScanned={handle}
          />
        ) : (
          <View style={styles.center}>
            <Text style={styles.msg}>
              {perm && !perm.canAskAgain
                ? 'Přístup ke kameře je zakázaný. Povolte ho v nastavení systému.'
                : 'Pro skenování karty potřebujeme přístup ke kameře.'}
            </Text>
            {perm && !perm.canAskAgain ? (
              <Pressable style={styles.btn} onPress={() => Linking.openSettings()}>
                <Text style={styles.btnText}>Otevřít nastavení</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.btn} onPress={requestPerm}>
                <Text style={styles.btnText}>Povolit kameru</Text>
              </Pressable>
            )}
          </View>
        )}

        {perm?.granted && (
          <View pointerEvents="none" style={styles.frameWrap}>
            <View style={styles.frame} />
            <Text style={styles.hint}>Zaměřte čárový nebo QR kód karty</Text>
          </View>
        )}

        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.round} onPress={onClose} accessibilityLabel="Zavřít">
            <Text style={styles.roundText}>✕</Text>
          </Pressable>
          {perm?.granted && (
            <Pressable
              style={[styles.round, torch && { backgroundColor: '#FFD54F' }]}
              onPress={() => setTorch((t) => !t)}
              accessibilityLabel="Svítilna"
            >
              <Text style={[styles.roundText, torch && { color: '#000' }]}>🔦</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  msg: { color: '#fff', textAlign: 'center', fontSize: 16 },
  btn: { backgroundColor: '#3D5AFE', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  roundText: { color: '#fff', fontSize: 18 },
  frameWrap: { ...StyleSheet.absoluteFill as object, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '78%', aspectRatio: 1.5, borderRadius: 18, borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  hint: { color: '#fff', marginTop: 18, fontSize: 15, textShadowColor: '#000', textShadowRadius: 6 },
});
