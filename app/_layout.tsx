import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { isAuthenticated } from '../services/auth'; // ✅ 修正后的路径

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // 1. App 启动时，检查是否有 Token
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const hasToken = await isAuthenticated();
      setIsLoggedIn(!!hasToken);
    } catch (e) {
      console.log("Auth check failed", e);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); // 检查完毕，取消加载状态
    }
  };

  // 2. 路由守卫：根据登录状态自动跳转
  useEffect(() => {
    if (isLoading) return; // 如果还在检查中，什么都不做

    const inAuthGroup = segments[0] === 'auth'; // 检查当前是否在登录页

    if (!isLoggedIn && !inAuthGroup) {
      // 没登录 + 也没在登录页 -> 踢到登录页
      // ✅ 关键点：这里必须对应 app/auth/login.tsx 的路径
      router.replace('/auth/login'); 
      
    } else if (isLoggedIn && inAuthGroup) {
      // 已登录 + 还在登录页 -> 踢回首页
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, isLoading]);

  // 3. 如果正在检查 Token，显示转圈圈
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 4. 显示当前页面
  return <Slot />;
}