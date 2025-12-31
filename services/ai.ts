import { getToken } from './auth';

interface BillData {
  amount: number;
  category: string;
  date: string;
  note: string;
}

interface AnalyzeOptions {
  text?: string;
  image?: string; // Base64格式的图片
}

/**
 * 分析账单信息
 * @param input 用户输入的文字或图片（Base64格式）
 * @returns Promise<BillData>
 */
export const analyzeBill = async (input: string | { text?: string; image?: string }): Promise<BillData> => {
  try {
    // 获取认证token
    const token = await getToken();
    
    if (!token) {
      throw new Error('用户未认证，请先登录');
    }

    // 处理输入参数
    let text: string | undefined;
    let image: string | undefined;
    
    if (typeof input === 'string') {
      text = input;
    } else {
      text = input.text;
      image = input.image;
    }

    // 验证输入
    if (!text && !image) {
      throw new Error('必须提供文本或图片输入');
    }

    // 构建请求体
    const requestBody: AnalyzeOptions = {};
    
    if (text) {
      requestBody.text = text;
    }
    
    if (image) {
      requestBody.image = image;
    }

    // 从环境变量获取API基础URL
    const API_URL = process.env.API_URL;
    
    if (!API_URL) {
      throw new Error('API_URL 未配置');
    }

    // 调用InsForge的AI Agent接口
    const response = await fetch(`${API_URL}/ai/analyze-bill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'AI分析失败' }));
      throw new Error(errorData.message || `AI分析失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // 验证返回的数据格式
    if (!isValidBillData(result)) {
      throw new Error('AI返回的数据格式不正确');
    }

    return result;
  } catch (error) {
    console.error('AI记账分析错误:', error);
    throw error;
  }
};

/**
 * 验证AI返回的数据格式是否正确
 */
function isValidBillData(data: any): data is BillData {
  return (
    typeof data === 'object' &&
    typeof data.amount === 'number' &&
    typeof data.category === 'string' &&
    typeof data.date === 'string' &&
    typeof data.note === 'string'
  );
}