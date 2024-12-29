import React from 'react';
import { StyleSheet, Animated, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface BudgetCardProps {
  amount: number;
  previousAmount: number;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ amount, previousAmount }) => {
  const isPositive = amount >= 0;
  
  return (
    <ThemedView style={[
      styles.container,
      {
        backgroundColor: isPositive ? '#2ecc71' : '#e74c3c',
      }
    ]}>
      <ThemedText style={styles.label}>Toplam Bütçe</ThemedText>
      <ThemedText style={styles.amount}>
        {amount.toLocaleString('tr-TR')} ₺
      </ThemedText>
      {previousAmount !== amount && (
        <ThemedText style={styles.change}>
          {((amount - previousAmount) / Math.abs(previousAmount) * 100).toFixed(1)}% 
          {amount > previousAmount ? '↑' : '↓'}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  label: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  change: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});
