import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../../services/auth'; // 引用刚才修好的 auth 服务

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    
    setLoading(true);
    try {
      // 调用我们在 services/auth.ts 里写好的登录方法
      const result = await login(email, password);
      Alert.alert('成功', '登录成功！');
      // 登录成功后，替换路由跳转回首页
      router.replace('/(tabs)'); 
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请检查邮箱或密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎回来 👋</Text>
      <Text style={styles.subtitle}>登录你的智能记账助手</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>邮箱</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入邮箱"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>密码</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? '登录中...' : '立即登录'}</Text>
      </TouchableOpacity>
      
      {/* 临时为了方便测试，加一个注册入口提示 */}
      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>还没有账号？去注册 (暂未实现)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E1E1E', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 48 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, fontSize: 16,
    borderWidth: 1, borderColor: '#E0E0E0'
  },
  button: {
    backgroundColor: '#6C63FF', borderRadius: 12, padding: 18, alignItems: 'center',
    marginTop: 24, shadowColor: '#6C63FF', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }
  },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6C63FF', fontSize: 14 }
});