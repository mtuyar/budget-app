import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  person: string;
  category?: string;
  charityCategory?: string;
  type: TransactionType;
  date: string;
}

const { width } = Dimensions.get('window');

const TransactionFormScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [charityCategory, setCharityCategory] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [person, setPerson] = useState('');

  const incomeCategories = [
    { name: 'Zekat', icon: 'hand-heart' },
    { name: 'Sadaka', icon: 'human-greeting' },
    { name: 'Burs', icon: 'school' },
    { name: 'İkramlık İçin', icon: 'food' },
    { name: 'Genel Bağış', icon: 'charity' }
  ];

  const expenseCategories = {
    regular: [
      { name: 'Ulaşım', icon: 'bus' },
      { name: 'İkramlık', icon: 'food-fork-drink' },
      { name: 'Faaliyet', icon: 'account-group-outline' },
      { name: 'Faturalar', icon: 'receipt' },
      { name: 'Kamp', icon: 'tent' },
      { name: 'Eğitim', icon: 'school-outline' },
      { name: 'Kira', icon: 'home-outline' },
      { name: 'Diğer', icon: 'dots-horizontal-circle-outline' }
    ],
    charity: [
      { name: 'Zekat', icon: 'hand-heart' },
      { name: 'Sadaka', icon: 'human-greeting' },
      { name: 'Burs', icon: 'school' },
      { name: 'İkramlık İçin', icon: 'food' },
      { name: 'Genel Bağış', icon: 'charity' }
    ]
  };

  const descriptionInputRef = useRef<TextInput>(null);
  const personInputRef = useRef<TextInput>(null);

  // Verileri yükleme fonksiyonu
  const loadTransactions = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Geçmiş işlemler yüklenemedi.');
    }
  };

  // Component mount olduğunda verileri yükle
  useEffect(() => {
    loadTransactions();
  }, []);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateAmount = (value: string) => {
    const numberRegex = /^\d*\.?\d*$/;
    if (value === '' || numberRegex.test(value)) {
      setAmount(value);
    }
  };

  const saveTransaction = async () => {
    if (!amount || !description || !person) {
      Alert.alert('Hata', 'Lütfen miktar, açıklama ve kişi alanlarını doldurun.');
      return;
    }

    try {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        description,
        person,
        type,
        date: date.toISOString(),
        ...(category && { category }),
        ...(charityCategory && { charityCategory })
      };

      const updatedTransactions = [newTransaction, ...transactions];
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      
      // State'i güncelle
      setTransactions(updatedTransactions);

      // Form temizleme
      setAmount('');
      setDescription('');
      setPerson('');
      setCategory(null);
      setCharityCategory(null);
      setDate(new Date());
      
      Alert.alert('Başarılı', 'İşlem kaydedildi!');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'İşlem kaydedilemedi.');
    }
  };

  const deleteTransaction = async (id: string) => {
    Alert.alert(
      'Silme Onayı',
      'Bu işlemi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTransactions = transactions.filter(t => t.id !== id);
              
              // AsyncStorage'ı güncelle
              await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
              
              // State'i güncelle
              setTransactions(updatedTransactions);
            } catch (error) {
              console.error('Silme hatası:', error);
              Alert.alert('Hata', 'İşlem silinemedi.');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (categoryName: string, isCharity: boolean = false) => {
    if (isCharity) {
      return expenseCategories.charity.find(cat => cat.name === categoryName)?.icon || 'help-circle';
    }
    if (type === 'income') {
      return incomeCategories.find(cat => cat.name === categoryName)?.icon || 'help-circle';
    }
    return expenseCategories.regular.find(cat => cat.name === categoryName)?.icon || 'help-circle';
  };

  const renderForm = () => (
    <ScrollView 
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      style={styles.formContainer}
    >
      <View style={styles.formInnerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {type === 'income' ? '💰 Gelir Ekle' : '💸 Gider Ekle'}
          </Text>
        </View>
  
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.selectedIncomeButton
            ]}
            onPress={() => setType('income')}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'income' && styles.selectedTypeButtonText
            ]}>
              Gelir
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.selectedExpenseButton
            ]}
            onPress={() => setType('expense')}
          >
            <Text style={[
              styles.typeButtonText,
              type === 'expense' && styles.selectedTypeButtonText
            ]}>
              Gider
            </Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Miktar (₺)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={validateAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#999"
            blurOnSubmit={false}
            returnKeyType="next"
            onSubmitEditing={() => descriptionInputRef.current?.focus()}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString('tr-TR')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
  
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            ref={descriptionInputRef}
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Açıklama giriniz"
            placeholderTextColor="#999"
            blurOnSubmit={false}
            returnKeyType="next"
            onSubmitEditing={() => personInputRef.current?.focus()}
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kişi</Text>
          <TextInput
            ref={personInputRef}
            style={styles.input}
            value={person}
            onChangeText={setPerson}
            placeholder="Kişi adı giriniz"
            placeholderTextColor="#999"
            blurOnSubmit={false}
            returnKeyType="done"
          />
        </View>
  
        {type === 'income' ? (
          <>
            <Text style={styles.label}>Kategori</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {incomeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    category === cat.name && {
                      backgroundColor: '#2E7D32'
                    }
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Icon 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.name ? '#FFF' : '#666'} 
                    style={styles.chipIcon}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    category === cat.name && styles.selectedCategoryChipText
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            <Text style={styles.label}>Genel Giderler</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {expenseCategories.regular.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    category === cat.name && {
                      backgroundColor: '#C62828'
                    }
                  ]}
                  onPress={() => setCategory(category === cat.name ? null : cat.name)}
                >
                  <Icon 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.name ? '#FFF' : '#666'} 
                    style={styles.chipIcon}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    category === cat.name && styles.selectedCategoryChipText
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
  
            <Text style={[styles.label, styles.secondCategoryLabel]}>Yardım & Bağış</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {expenseCategories.charity.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    charityCategory === cat.name && {
                      backgroundColor: '#C62828'
                    }
                  ]}
                  onPress={() => setCharityCategory(charityCategory === cat.name ? null : cat.name)}
                >
                  <Icon 
                    name={cat.icon} 
                    size={20} 
                    color={charityCategory === cat.name ? '#FFF' : '#666'} 
                    style={styles.chipIcon}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    charityCategory === cat.name && styles.selectedCategoryChipText
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
  
        <TouchableOpacity 
          style={[
            styles.saveButton,
            { 
              backgroundColor: type === 'income' 
                ? '#2E7D32' 
                : '#C62828'
            }
          ]}
          onPress={saveTransaction}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
  
        <View style={styles.listContainer}>
          <Text style={styles.transactionListTitle}>
            {type === 'income' ? '📈 Gelirler' : '📉 Giderler'}
          </Text>
          <FlatList
            data={transactions.filter(t => t.type === type)}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            ListFooterComponent={<View style={styles.listFooter} />}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[
      styles.transactionItem,
      { 
        backgroundColor: item.type === 'income' ? '#E8F5E9' : '#FFEBEE'
      }
    ]}>
      <View style={styles.transactionHeader}>
        <View style={styles.leftContainer}>
          <View style={styles.transactionCategoryContainer}>
            {item.category && (
              <>
                <Icon 
                  name={getCategoryIcon(item.category)} 
                  size={24} 
                  color={item.type === 'income' ? '#2E7D32' : '#C62828'} 
                  style={styles.categoryIcon}
                />
                <Text style={styles.transactionCategory}>{item.category}</Text>
              </>
            )}
            {item.charityCategory && (
              <>
                <Icon 
                  name={getCategoryIcon(item.charityCategory, true)} 
                  size={24} 
                  color="#C62828"
                  style={[styles.categoryIcon, !item.category && { marginLeft: 0 }]}
                />
                <Text style={[styles.transactionCategory, { color: '#C62828' }]}>
                  {item.charityCategory}
                </Text>
              </>
            )}
          </View>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? '#2E7D32' : '#C62828' }
          ]}>
            {formatAmount(item.amount)}
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteTransaction(item.id)}
          >
            <Icon name="close-circle-outline" size={24} color="#FF5252" />
            <Text style={styles.deleteText}>Sil</Text>
          </TouchableOpacity>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          <View style={styles.personContainer}>
            <Icon name="account-outline" size={18} color="#666" />
            <Text style={styles.transactionPerson}>{item.person}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {type === 'income' ? '💰 Gelir Ekle' : '💸 Gider Ekle'}
              </Text>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && styles.selectedIncomeButton
                ]}
                onPress={() => setType('income')}
              >
                <Text style={[
                  styles.typeButtonText,
                  type === 'income' && styles.selectedTypeButtonText
                ]}>
                  Gelir
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.selectedExpenseButton
                ]}
                onPress={() => setType('expense')}
              >
                <Text style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.selectedTypeButtonText
                ]}>
                  Gider
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Miktar (₺)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={validateAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
                blurOnSubmit={false}
                returnKeyType="next"
                onSubmitEditing={() => descriptionInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tarih</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('tr-TR')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                ref={descriptionInputRef}
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Açıklama giriniz"
                placeholderTextColor="#999"
                blurOnSubmit={false}
                returnKeyType="next"
                onSubmitEditing={() => personInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kişi</Text>
              <TextInput
                ref={personInputRef}
                style={styles.input}
                value={person}
                onChangeText={setPerson}
                placeholder="Kişi adı giriniz"
                placeholderTextColor="#999"
                blurOnSubmit={false}
                returnKeyType="done"
              />
            </View>

            {type === 'income' ? (
              <>
                <Text style={styles.label}>Kategori</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {incomeCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryChip,
                        category === cat.name && {
                          backgroundColor: '#2E7D32'
                        }
                      ]}
                      onPress={() => setCategory(cat.name)}
                    >
                      <Icon 
                        name={cat.icon} 
                        size={20} 
                        color={category === cat.name ? '#FFF' : '#666'} 
                        style={styles.chipIcon}
                      />
                      <Text style={[
                        styles.categoryChipText,
                        category === cat.name && styles.selectedCategoryChipText
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.label}>Genel Giderler</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {expenseCategories.regular.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryChip,
                        category === cat.name && {
                          backgroundColor: '#C62828'
                        }
                      ]}
                      onPress={() => setCategory(category === cat.name ? null : cat.name)}
                    >
                      <Icon 
                        name={cat.icon} 
                        size={20} 
                        color={category === cat.name ? '#FFF' : '#666'} 
                        style={styles.chipIcon}
                      />
                      <Text style={[
                        styles.categoryChipText,
                        category === cat.name && styles.selectedCategoryChipText
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
    
                <Text style={[styles.label, styles.secondCategoryLabel]}>Yardım & Bağış</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {expenseCategories.charity.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryChip,
                        charityCategory === cat.name && {
                          backgroundColor: '#C62828'
                        }
                      ]}
                      onPress={() => setCharityCategory(charityCategory === cat.name ? null : cat.name)}
                    >
                      <Icon 
                        name={cat.icon} 
                        size={20} 
                        color={charityCategory === cat.name ? '#FFF' : '#666'} 
                        style={styles.chipIcon}
                      />
                      <Text style={[
                        styles.categoryChipText,
                        charityCategory === cat.name && styles.selectedCategoryChipText
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
    
            <TouchableOpacity 
              style={[
                styles.saveButton,
                { backgroundColor: type === 'income' ? '#2E7D32' : '#C62828' }
              ]}
              onPress={saveTransaction}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
    
            <View style={styles.listContainer}>
              <Text style={styles.transactionListTitle}>
                {type === 'income' ? '📈 Gelirler' : '📉 Giderler'}
              </Text>
              <FlatList
                data={transactions.filter(t => t.type === type)}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                ListFooterComponent={<View style={styles.listFooter} />}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedIncomeButton: {
    backgroundColor: '#E8F5E9',
  },
  selectedExpenseButton: {
    backgroundColor: '#FFEBEE',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  selectedTypeButtonText: {
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  secondCategoryLabel: {
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipIcon: {
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
  },
  transactionListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  transactionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1,
    marginRight: 16,
  },
  transactionCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginBottom: 6,
  },
  deleteText: {
    color: '#FF5252',
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionPerson: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  categoryIcon: {
    marginRight: 8,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  transactionSubCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  formInnerContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  listFooter: {
    height: 5,
  },
});

// Helper fonksiyonlar
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

export default TransactionFormScreen;