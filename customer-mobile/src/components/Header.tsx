import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bn } from '../i18n/bn';

interface Props {
  hasActiveBooking?: boolean;
  onPressActiveBooking?: () => void;
}

export const Header: React.FC<Props> = ({ hasActiveBooking, onPressActiveBooking }) => {
  const handleCallHelpline = () => {
    Linking.openURL('tel:16789');
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="construct" size={20} color="#0D9488" />
        </View>
        <View>
          <Text style={styles.brandTitle}>{bn.app.name}</Text>
          <Text style={styles.brandSubtitle}>রোডসাইড অ্যাসিস্ট্যান্স ২৪/৭</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.helplineButton}
        onPress={handleCallHelpline}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={14} color="#FFFFFF" />
        <Text style={styles.helplineText}>১৬৭৮৯</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  helplineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  helplineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
