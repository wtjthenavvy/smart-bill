import { CategoryPicker } from '@/components/CategoryPicker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccountStore } from '@/store/useAccountStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/categories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { analyzeBill } from '@/services/ai';

type TransactionType = 'expense' | 'income';

export default function AddTransactionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { accounts, fetchAccounts } = useAccountStore();
  const { addTransaction, updateTransaction, getTransactionById } = useTransactionStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  
  // AI 智能录入相关状态
  const [aiInput, setAiInput] = useState('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 加载账户数据
  useEffect(() => { fetchAccounts(); }, []);

  // 编辑模式下加载交易数据
  useEffect(() => {
    if (isEditMode && id) {
      loadTransaction(parseInt(id));
    }
  }, [id]);

  // 仅在新建模式下自动选择第一个账户
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId && !isEditMode) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, isEditMode]);

  // 仅在新建模式下，切换类型时重置分类
  useEffect(() => {
    if (!isEditMode) {
      setSelectedCategory((type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0]);
    }
  }, [type, isEditMode]);

  const loadTransaction = async (transactionId: number) => {
    setIsLoading(true);
    try {
      const transaction = await getTransactionById(transactionId);
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setSelectedAccountId(transaction.account_id);
        setDescription(transaction.description);
        setOriginalDate(transaction.date);

        // 设置分类
        const categories = transaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        const category = categories.find(c => c.name === transaction.category) || categories[0];
        setSelectedCategory(category);
      }
    } catch (error) {
      Alert.alert('错误', '加载交易记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }
    if (!selectedAccountId) {
      Alert.alert('提示', '请选择账户');
      return;
    }

    try {
      if (isEditMode && id) {
        await updateTransaction(parseInt(id), {
          type,
          amount: parseFloat(amount),
          category: selectedCategory.name,
          category_icon: selectedCategory.icon,
          account_id: selectedAccountId,
          date: originalDate || new Date().toISOString(),
          description: description || selectedCategory.name
        });
      } else {
        await addTransaction({
          type,
          amount: parseFloat(amount),
          category: selectedCategory.name,
          category_icon: selectedCategory.icon,
          account_id: selectedAccountId,
          date: new Date().toISOString(),
          description: description || selectedCategory.name
        });
      }
      router.back();
    } catch (error) {
      Alert.alert('错误', isEditMode ? '更新失败' : '保存失败');
    }
  };

  // 处理AI智能录入
  const handleAIAnalysis = async () => {
    if (!aiInput && !aiImage) {
      Alert.alert('提示', '请输入文字或上传小票');
      return;
    }

    setAiLoading(true);
    try {
      const result = await analyzeBill({
        text: aiInput,
        image: aiImage
      });

      // 自动填充表单
      setAmount(result.amount.toString());
      setDescription(result.note);
      
      // 查找匹配的分类
      const allCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      const matchedCategory = allCategories.find(cat => 
        cat.name.includes(result.category) || result.category.includes(cat.name)
      );
      
      if (matchedCategory) {
        setSelectedCategory(matchedCategory);
      } else {
        // 如果没有找到匹配的分类，使用第一个分类
        setSelectedCategory(allCategories[0]);
      }
    } catch (error) {
      console.error('AI分析失败:', error);
      Alert.alert('错误', 'AI分析失败: ' + (error as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  // 选择图片
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('提示', '需要相册权限才能上传图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setAiImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // 拍照
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('提示', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setAiImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // 清除AI图片
  const clearAiImage = () => {
    setAiImage(null);
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><X size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{isEditMode ? '编辑交易' : '记一笔'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveBtn, { color: isLoading ? colors.textSecondary : colors.primary }]}>
            {isLoading ? '加载中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AI 智能录入区域 */}
        <View style={[styles.aiSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.aiTitle, { color: colors.text }]}>✨ AI 智能录入</Text>
          
          <TextInput
            style={[styles.aiInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="输入交易描述，如：今天花了50元吃午饭"
            placeholderTextColor={colors.textSecondary}
            value={aiInput}
            onChangeText={setAiInput}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.aiImageContainer}>
            {aiImage ? (
              <View style={styles.aiImagePreviewContainer}>
                <Image source={{ uri: aiImage }} style={styles.aiImagePreview} />
                <TouchableOpacity style={styles.aiClearImageButton} onPress={clearAiImage}>
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.aiImageButton, { borderColor: colors.border }]} onPress={pickImage}>
                <Text style={[styles.aiImageButtonText, { color: colors.textSecondary }]}>上传小票</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={[styles.aiCameraButton, { borderColor: colors.border }]} onPress={takePhoto}>
              <Text style={[styles.aiImageButtonText, { color: colors.textSecondary }]}>拍照</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.aiAnalyzeButton, { backgroundColor: colors.primary }]} 
            onPress={handleAIAnalysis}
            disabled={aiLoading}
          >
            <Text style={styles.aiAnalyzeButtonText}>
              {aiLoading ? '分析中...' : 'AI 分析'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeBtn, type === 'expense' && { backgroundColor: colors.expense }]} onPress={() => setType('expense')}>
            <Text style={[styles.typeText, { color: type === 'expense' ? '#FFF' : colors.textSecondary }]}>支出</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === 'income' && { backgroundColor: colors.income }]} onPress={() => setType('income')}>
            <Text style={[styles.typeText, { color: type === 'income' ? '#FFF' : colors.textSecondary }]}>收入</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>金额</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: type === 'expense' ? colors.expense : colors.income }]}>¥</Text>
            <TextInput style={[styles.amountInput, { color: colors.text }]} placeholder="0.00" placeholderTextColor={colors.textSecondary} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>分类</Text>
          <CategoryPicker type={type} selectedCategory={selectedCategory.name} onSelect={(cat) => setSelectedCategory(cat)} />
        </View>
        <TouchableOpacity style={[styles.accountSelector, { backgroundColor: colors.card }]} onPress={() => setShowAccountPicker(!showAccountPicker)}>
          <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>账户</Text>
          <View style={styles.accountValue}>
            <Text style={[styles.accountName, { color: colors.text }]}>{selectedAccount?.name || '选择账户'}</Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
        {showAccountPicker && (
          <View style={[styles.accountList, { backgroundColor: colors.card }]}>
            {accounts.map((account) => (
              <TouchableOpacity key={account.id} style={[styles.accountItem, selectedAccountId === account.id && { backgroundColor: colors.primaryLight }]} onPress={() => { setSelectedAccountId(account.id); setShowAccountPicker(false); }}>
                <Text style={[styles.accountItemText, { color: colors.text }]}>{account.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>备注</Text>
          <TextInput style={[styles.descInput, { color: colors.text, borderColor: colors.border }]} placeholder="添加备注..." placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  saveBtn: { fontSize: 16, fontWeight: '600' },
  typeSelector: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 12 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  typeText: { fontSize: 16, fontWeight: '500' },
  amountCard: { marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 16 },
  amountLabel: { fontSize: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  currency: { fontSize: 32, fontWeight: 'bold', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 32, fontWeight: 'bold' },
  section: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  accountSelector: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16 },
  accountLabel: { fontSize: 14 },
  accountValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  accountName: { fontSize: 16, fontWeight: '500' },
  accountList: { marginHorizontal: 20, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  accountItem: { padding: 16 },
  accountItemText: { fontSize: 16 },
  descInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  
  // AI 智能录入相关样式
  aiSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  aiInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  aiImageContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  aiImageButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  aiCameraButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  aiImageButtonText: {
    fontSize: 16,
  },
  aiImagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  aiImagePreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  aiClearImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAnalyzeButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiAnalyzeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});