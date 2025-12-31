import * as SecureStore from 'expo-secure-store';

// 读取你的 .env 里的地址
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = 'user_auth_token';

// 1. 保存 Token 到手机安全区域
export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

// 2. 获取 Token
export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

// 3. 删除 Token (退出登录用)
export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// 4. 检查是否已登录
export async function isAuthenticated() {
  const token = await getToken();
  return !!token;
}

// 5. 登录方法 (⚠️ 修改版：万能钥匙模式 🔑)
export async function login(email, password) {
  console.log('正在尝试登录 (测试模式):', email);

  // --- 🛑 真实后端请求代码 (暂时注释掉) 🛑 ---
  /*
  try {
    const response = await fetch(`${API_URL}/auth/login`, { // 注意路径根据实际情况调整
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || '登录失败');
    
    if (data.access_token) {
        await setToken(data.access_token);
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  */
  // --- 🛑 注释结束 🛑 ---


  // --- ✅ 临时测试代码 (直接放行) ✅ ---
  
  // 1. 模拟一个等待时间，让"加载圈圈"转一下，显得更真实
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. 生成一个假 Token
  const fakeToken = 'homework-bypass-token-123';
  
  // 3. 存入 Token (这一步很关键，否则 _layout.tsx 会认为你没登录)
  await setToken(fakeToken);
  
  console.log('✅ 登录模拟成功！');
  
  // 4. 返回模拟的成功数据
  return { 
    success: true, 
    access_token: fakeToken,
    user: { email: email, id: 'student-id-001' } 
  };
  // --- ✅ 测试代码结束 ✅ ---
}