import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceCategory } from '../types/service';

interface Props {
  categories: ServiceCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (category: ServiceCategory) => void;
}

export const ServiceCategoryGrid: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelectCategory(cat)}
            activeOpacity={0.7}
          >
            {cat.is_emergency && (
              <View style={styles.emergencyPill}>
                <Text style={styles.emergencyText}>জরুরি</Text>
              </View>
            )}

            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
              <Ionicons
                name={(cat.icon_name as any) || 'construct-outline'}
                size={24}
                color={isSelected ? '#0D9488' : '#334155'}
              />
            </View>

            <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
              {cat.name_bn}
            </Text>

            <Text style={styles.priceText}>শুরু ৳{cat.base_price_bdt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  emergencyPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emergencyText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainerSelected: {
    backgroundColor: '#CCFBF1',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    minHeight: 36,
  },
  categoryNameSelected: {
    color: '#0F766E',
  },
  priceText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
});
