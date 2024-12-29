import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  propsForLabels: {
    fontSize: 12,
  },
};

interface Transaction {
  id: string;
  amount: number;
  description: string;
  person: string;
  category?: string;
  charityCategory?: string;
  type: 'income' | 'expense';
  date: string;
}

const DashboardScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const savedTransactions = await AsyncStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    }
  };

  // Sayfa her odaklandığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  // Son 6 ayın gelir ve giderlerini hesapla
  const getMonthlyData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    const monthLabels = last6Months.map(date => 
      date.toLocaleString('tr-TR', { month: 'short' })
    );

    const monthlyIncome = last6Months.map(date => {
      return transactions
        .filter(t => t.type === 'income' && 
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const monthlyExpense = last6Months.map(date => {
      return transactions
        .filter(t => t.type === 'expense' && 
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          data: monthlyIncome,
          color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: monthlyExpense,
          color: (opacity = 1) => `rgba(248, 113, 113, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Gelir', 'Gider']
    };
  };

  // Kategori ikonlarını belirle
  const categoryIcons: Record<string, string> = {
    'Ulaşım': 'bus',
    'İkramlık': 'food-fork-drink',
    'Faaliyet': 'account-group',
    'Faturalar': 'receipt',
    'Kamp': 'tent',
    'Eğitim': 'school',
    'Kira': 'home',
    'Zekat': 'hand-heart',
    'Sadaka': 'gift',
    'Burs': 'school-outline',
    'İkramlık İçin': 'food',
    'Genel Bağış': 'heart',
    'Diğer': 'dots-horizontal'
  };

  // En çok harcanan kategoriyi bul
  const getTopSpendingCategory = () => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.category || t.charityCategory || 'Diğer';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    // En yüksek harcamayı bul
    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) return { category: 'Diğer', amount: 0 };

    const [topCategory, amount] = entries.reduce((max, curr) => 
      curr[1] > max[1] ? curr : max
    );

    return {
      category: topCategory,
      amount: amount
    };
  };

  const topCategory = getTopSpendingCategory();

  // Kategori renklerini tanımla
  const categoryColors = {
    'Ulaşım': '#F97316',     // Turuncu
    'İkramlık': '#EC4899',   // Pembe
    'Faaliyet': '#8B5CF6',   // Mor
    'Faturalar': '#EF4444',  // Kırmızı
    'Kamp': '#10B981',       // Yeşil
    'Eğitim': '#6366F1',     // İndigo
    'Kira': '#F59E0B',       // Amber
    'Zekat': '#22C55E',      // Yeşil
    'Sadaka': '#3B82F6',     // Mavi
    'Burs': '#A855F7',       // Mor
    'Genel Bağış': '#0EA5E9' // Açık Mavi
  };

  // Kategori dağılımını hesapla
  const getCategoryDistribution = () => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.category || t.charityCategory || 'Diğer';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: ((value / totalExpense) * 100).toFixed(1),
        color: categoryColors[name] || '#64748B', // Varsayılan renk
        legendFontColor: '#374151',
        legendFontSize: 12
      }))
      .sort((a, b) => b.value - a.value); // En yüksekten düşüğe sırala
  };

  const pieData = getCategoryDistribution();

  const totalBalance = transactions.reduce((sum, t) => 
    sum + (t.type === 'income' ? t.amount : -t.amount), 0
  );

  const totalZakat = transactions
    .filter(t => t.category === 'Zekat' || t.charityCategory === 'Zekat')
    .reduce((sum, t) => sum + t.amount, 0);

  // Para formatı için yardımcı fonksiyon
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Toplam gelir ve giderleri hesapla
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lineData = getMonthlyData();

  // Yardımcı fonksiyonları component içine taşıyalım
  const getCurrentMonthTotal = () => {
    const now = new Date();
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  };

  const getHighestExpense = () => {
    return Math.max(...transactions
      .filter(t => t.type === 'expense')
      .map(t => t.amount));
  };

  const getActiveCategories = () => {
    return new Set(transactions.map(t => t.category || t.charityCategory)).size;
  };

  // Kategori bazlı toplam harcamayı hesapla
  const getCategoryTotal = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Tüm kategorileri birleştir
    const allCategoryTotals = expenseTransactions.reduce((acc, t) => {
      const category = t.category || t.charityCategory || 'Diğer';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // En yüksek harcamaya sahip kategoriyi bul
    const [topCategory, totalAmount] = Object.entries(allCategoryTotals)
      .reduce((max, current) => 
        current[1] > max[1] ? current : max
      , ['', 0]);

    return {
      category: topCategory,
      amount: totalAmount,
      icon: getCategoryIcon(topCategory) // Kategori ikonunu al
    };
  };

  // Kategori ikonlarını belirle
  const getCategoryIcon = (category: string): string => {
    const categoryIcons: Record<string, string> = {
      // Genel Gider Kategorileri
      'Ulaşım': 'bus',
      'İkramlık': 'food-fork-drink',
      'Faaliyet': 'account-group',
      'Faturalar': 'receipt',
      'Kamp': 'tent',
      'Eğitim': 'school',
      'Kira': 'home',
      // Yardım Kategorileri
      'Zekat': 'hand-heart',
      'Sadaka': 'gift',
      'Burs': 'school-outline',
      'İkramlık İçin': 'food',
      'Genel Bağış': 'heart',
      'Diğer': 'dots-horizontal'
    };

    return categoryIcons[category] || 'currency-usd';
  };

  const topCategoryTotal = getCategoryTotal();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Üst Boşluk */}
      <View style={{ height: 44 }} />

      {/* Dashboard Kartları */}
      <View style={{ 
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16
      }}>
        <ThemedText style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          marginBottom: 16,
          color: '#1F2937'
        }}>
          Dashboard
        </ThemedText>
        
        {/* Gelir/Gider Kartları */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ 
            flex: 1, 
            marginRight: 8, 
            padding: 16, 
            backgroundColor: '#34D39910', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#34D39930'
          }}>
            <IconSymbol name="arrow.up.right.circle.fill" color="#34D399" size={24} />
            <ThemedText style={{ fontSize: 20, fontWeight: '600', marginTop: 8, color: '#34D399' }}>
              {formatCurrency(totalIncome)}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#6B7280' }}>
              Toplam Gelir
            </ThemedText>
          </View>

          <View style={{ 
            flex: 1, 
            marginLeft: 8, 
            padding: 16, 
            backgroundColor: '#EF444410', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#EF444430'
          }}>
            <IconSymbol name="arrow.down.right.circle.fill" color="#EF4444" size={24} />
            <ThemedText style={{ fontSize: 20, fontWeight: '600', marginTop: 8, color: '#EF4444' }}>
              {formatCurrency(totalExpense)}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#6B7280' }}>
              Toplam Gider
            </ThemedText>
          </View>
        </View>

        {/* En Çok Kategori ve Bakiye Kartları */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ 
            flex: 1, 
            marginRight: 8, 
            padding: 16, 
            backgroundColor: '#60A5FA10', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#60A5FA30'
          }}>
            <IconSymbol 
              name="chart.line.uptrend.xyaxis.circle.fill"
              color="#60A5FA" 
              size={24} 
            />
            <ThemedText style={{ 
              fontSize: 20, 
              fontWeight: '600', 
              marginTop: 8, 
              color: '#60A5FA'
            }}>
              {formatCurrency(topCategory.amount)}
            </ThemedText>
            <ThemedText style={{ 
              fontSize: 14, 
              color: '#6B7280',
              marginTop: 4
            }}>
              En Çok Harcama: {topCategory.category}
            </ThemedText>
          </View>

          <View style={{ 
            flex: 1, 
            marginLeft: 8, 
            padding: 16, 
            backgroundColor: '#8B5CF610', 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#8B5CF630'
          }}>
            <IconSymbol name="banknote" color="#8B5CF6" size={24} />
            <ThemedText style={{ fontSize: 20, fontWeight: '600', marginTop: 8, color: '#8B5CF6' }}>
              {formatCurrency(totalBalance)}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#6B7280' }}>
              Net Bakiye
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Aylık Genel Bakış Grafiği */}
      <View style={{ 
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
      }}>
        <ThemedText style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          marginBottom: 16,
          color: '#1F2937'
        }}>
          Aylık Genel Bakış
        </ThemedText>
        <LineChart
          data={lineData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            ...chartConfig,
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
            propsForLabels: {
              fontSize: 12,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#E5E7EB',
            }
          }}
          bezier
          style={{ borderRadius: 16 }}
          fromZero
          yAxisLabel="₺"
          yAxisSuffix=""
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <View style={{ width: 12, height: 12, backgroundColor: '#34D399', borderRadius: 6, marginRight: 8 }} />
            <ThemedText style={{ color: '#374151' }}>Gelir</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, backgroundColor: '#EF4444', borderRadius: 6, marginRight: 8 }} />
            <ThemedText style={{ color: '#374151' }}>Gider</ThemedText>
          </View>
        </View>
      </View>

      {/* Kategori Dağılımı Bölümü */}
      <View style={{ 
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
      }}>
        <ThemedText style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          marginBottom: 16,
          color: '#1F2937',
          textAlign: 'center'
        }}>
          Kategori Dağılımı
        </ThemedText>

        {/* Pasta Grafiği */}
        <View style={{ 
          height: 200, 
          marginBottom: 20,
          alignItems: 'center',
          justifyContent: 'center',
          width: '50%'
        }}>
          <PieChart
            data={pieData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              strokeWidth: 2,
              useShadowColorFromDataset: false
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[(screenWidth - 64) / 2, 0]}
            absolute
            hasLegend={false}
          />
        </View>

        {/* Kategori Listesi */}
        <View style={{ marginTop: 16 }}>
          {pieData.map((item, index) => (
            <View 
              key={item.name}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: index < pieData.length - 1 ? 1 : 0,
                borderBottomColor: '#E5E7EB'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                  marginRight: 8
                }} />
                <ThemedText style={{ 
                  fontSize: 14,
                  color: '#374151',
                  flex: 1
                }}>
                  {item.name}
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={{ 
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#374151',
                  marginRight: 8
                }}>
                  {formatCurrency(item.value)}
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: 12,
                  color: '#6B7280',
                  width: 45,
                  textAlign: 'right'
                }}>
                  %{item.percentage}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Toplam */}
        <View style={{
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
            Toplam Harcama
          </ThemedText>
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#EF4444' }}>
            {formatCurrency(pieData.reduce((sum, item) => sum + item.value, 0))}
          </ThemedText>
        </View>
      </View>

      {/* Özel İstatistikler kartı */}
      <View style={{ 
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
      }}>
        <ThemedText style={{ 
          fontSize: 18, 
          fontWeight: '600',
          color: '#1F2937',
          textAlign: 'center',
          marginBottom: 16
        }}>
          Özel İstatistikler
        </ThemedText>

        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between'
        }}>
          <StatCard
            title="Ortalama Gider"
            value={formatCurrency(totalExpense / (transactions.filter(t => t.type === 'expense').length || 1))}
            icon="calculator"
            color="#F59E0B"
          />
          <StatCard
            title="Bu Ay Toplam"
            value={formatCurrency(getCurrentMonthTotal())}
            icon="calendar"
            color="#10B981"
          />
          <StatCard
            title="En Yüksek Gider"
            value={formatCurrency(getHighestExpense())}
            icon="arrow.up.circle"
            color="#EF4444"
          />
          <StatCard
            title="Aktif Kategoriler"
            value={getActiveCategories().toString()}
            icon="folder"
            color="#8B5CF6"
          />
        </View>
      </View>
    </ScrollView>
  );
};

// İstatistik Kartı Komponenti
const StatCard = ({ title, value, icon, color }: { 
  title: string, 
  value: string | number, 
  icon: string, 
  color: string 
}) => (
  <View style={{ 
    width: '48%', 
    backgroundColor: `${color}10`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${color}30`
  }}>
    <IconSymbol name={icon} color={color} size={20} />
    <ThemedText style={{ 
      fontSize: 16, 
      fontWeight: '600',
      color: color,
      marginTop: 8 
    }}>
      {value}
    </ThemedText>
    <ThemedText style={{ 
      fontSize: 12,
      color: '#6B7280',
      marginTop: 4
    }}>
      {title}
    </ThemedText>
  </View>
);

export default DashboardScreen;