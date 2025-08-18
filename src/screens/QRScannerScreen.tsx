import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { QRScanner } from '@/qr';
import { QRData } from '@/types';

type RouteParams = {
  onScan: (data: QRData) => void;
};

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { onScan } = route.params as RouteParams;

  const handleScan = (data: QRData) => {
    onScan(data);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <QRScanner
        onScan={handleScan}
        onClose={handleClose}
        title="Scan Wallet QR"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});