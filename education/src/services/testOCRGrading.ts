/**
 * OCR识别后AI批改测试工具
 * 帮助诊断OCR → AI批改流程问题
 */

// 测试OCR结果到AI批改的完整流程
export const testOCRToAIGrading = async (ocrText: string) => {
  console.log('🧪 开始测试OCR到AI批改流程...');
  
  try {
    // 1. 验证OCR文字内容
    if (!ocrText || ocrText.trim().length < 10) {
      throw new Error('OCR识别文字太少，无法进行AI批改');
    }
    
    console.log('✅ OCR文字验证通过，长度:', ocrText.length);
    
    // 2. 检查API配置
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!openaiKey || openaiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API密钥未配置');
    }
    
    console.log('✅ OpenAI API密钥配置正常');
    
    // 3. 测试AI批改调用
    const { gradeAssignmentWithOCR } = await import('./openai');
    
    console.log('🤖 开始调用AI批改...');
    
    const result = await gradeAssignmentWithOCR([], ocrText, `
请分析以下从作业中识别的文字内容：

${ocrText}

请执行简化的批改任务：
1. 识别题目和答案
2. 简单批改和评分
3. 返回JSON格式结果

注意：这是测试模式，请返回简化但完整的结果。
    `);
    
    console.log('✅ AI批改测试成功!', result);
    
    return {
      success: true,
      result: result,
      message: 'OCR到AI批改流程测试成功'
    };
    
  } catch (error) {
    console.error('❌ OCR到AI批改测试失败:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      suggestion: '请检查API配置和网络连接'
    };
  }
};

// 快速测试函数 - 可在浏览器控制台使用
export const quickTestAIGrading = async () => {
  const testText = `
题目1：2 + 3 = ?
学生答案：5

题目2：北京是中国的什么？
学生答案：首都

题目3：英语"hello"是什么意思？
学生答案：你好
  `;
  
  console.log('🚀 开始快速测试...');
  const result = await testOCRToAIGrading(testText);
  
  if (result.success) {
    console.log('🎉 测试成功！系统运行正常');
    console.log('批改结果:', result.result);
  } else {
    console.log('⚠️ 测试失败:', result.error);
    console.log('建议:', result.suggestion);
  }
  
  return result;
};

// 在全局对象上暴露测试函数（开发模式）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).testAIGrading = quickTestAIGrading;
  (window as any).testOCRToAI = testOCRToAIGrading;
}
