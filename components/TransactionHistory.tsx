import React from 'react';
import { StyleSheet, FlatList, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Transaction, Category } from '../constants/types'

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  categories,
}) => {
  const getCategory = (categoryId: string) => 
    categories.find(c => c.id === categoryId);

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = getCategory(item.categoryId);
    
    return (
      <ThemedView style={styles.transactionItem}>
        <ThemedView style={styles.categoryIcon}>
          <ThemedText>{category?.icon}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.transactionDetails}>
          <ThemedText style={styles.transactionCategory}>{category?.name}</ThemedText>
          <ThemedText style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString('tr-TR')}
          </ThemedText>
          {item.description && (
            <ThemedText style={styles.transactionDescription}>{item.description}</ThemedText>
          )}
        </ThemedView>
        <ThemedText style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#2ecc71' : '#e74c3c' }
        ]}>
          {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('tr-TR')} ₺
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>İşlem Geçmişi</ThemedText>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionCategory: {
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionDescription: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
});