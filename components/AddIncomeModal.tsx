import React, { useState } from 'react';
import { StyleSheet, Modal, TouchableOpacity, TextInput, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Category, Transaction } from '../constants/types';

interface AddIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  visible,
  onClose,
  onSave,
  categories,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!amount || !selectedCategory) return;

    onSave({
      amount: parseFloat(amount),
      categoryId: selectedCategory.id,
      type: 'income',
      date: new Date(),
      description,
    });

    // Reset form
    setAmount('');
    setSelectedCategory(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>Gelir Ekle</ThemedText>
          
          <TextInput
            style={styles.input}
            placeholder="Miktar"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#666"
          />
          
          <ThemedView style={styles.categoryGrid}>
            {categories.filter(c => c.type === 'income').map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory?.id === category.id
                      ? category.color
                      : 'transparent',
                    borderColor: category.color,
                  },
                ]}
              >
                <ThemedText>{category.icon}</ThemedText>
                <ThemedText style={selectedCategory?.id === category.id ? styles.selectedCategoryText : null}>
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <TextInput
            style={styles.input}
            placeholder="Açıklama"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#666"
          />

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <ThemedText>İptal</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
              <ThemedText style={styles.saveButtonText}>Kaydet</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '31%',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});