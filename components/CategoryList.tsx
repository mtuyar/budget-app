import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Category } from '../constants/types';

interface CategoryListProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <FlatList
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelectCategory(item)}>
          <ThemedView style={[styles.categoryItem, { backgroundColor: item.color }]}>
            <ThemedText>{item.icon}</ThemedText>
            <ThemedText>{item.name}</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  categoryItem: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    width: 100,
  },
});
