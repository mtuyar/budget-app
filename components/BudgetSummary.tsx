import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface BudgetSummaryProps {
  totalBudget: number;
  totalExpenses: number;
  totalIncome: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  totalExpenses,
  totalIncome,
}) => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.summaryItem}>
        <ThemedText type="subtitle">Toplam Bütçe</ThemedText>
        <ThemedText type="title">{totalBudget.toLocaleString('tr-TR')} ₺</ThemedText>
      </View>
      <View style={styles.row}>
        <View style={styles.summaryItem}>
          <ThemedText type="subtitle">Gelirler</ThemedText>
          <ThemedText style={styles.income}>{totalIncome.toLocaleString('tr-TR')} ₺</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText type="subtitle">Giderler</ThemedText>
          <ThemedText style={styles.expense}>{totalExpenses.toLocaleString('tr-TR')} ₺</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  income: {
    color: '#2ecc71',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expense: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
