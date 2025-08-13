/**
 * API功能测试脚本
 * 用于验证OpenAI和微软OCR API的功能状态
 */

// 测试OpenAI API (文字模式)
export const testOpenAITextMode = async () => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return { success: false, error: 'OpenAI API密钥未配置' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: '请回复"OpenAI文字模式正常"'
        }],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `API调用失败: ${response.status} - ${error}` };
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';
    
    return { 
      success: true, 
      result, 
      hasVisionCapability: false // 仅测试文字模式
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
};

// 测试OpenAI API (视觉模式)
export const testOpenAIVisionMode = async () => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return { success: false, error: 'OpenAI API密钥未配置' };
    }

    // 创建一个简单的测试图像 (1x1像素的白色PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请分析这张图片并回复"OpenAI视觉模式正常"'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${testImageBase64}`,
                detail: 'low'
              }
            }
          ]
        }],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `视觉API调用失败: ${response.status} - ${error}` };
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';
    
    // 检查是否返回了拒绝视觉功能的消息
    if (result.includes("unable to process images") || 
        result.includes("cannot analyze images") ||
        result.includes("I can't see")) {
      return { 
        success: false, 
        error: '账户没有GPT-4o视觉功能权限',
        hasVisionCapability: false
      };
    }
    
    return { 
      success: true, 
      result, 
      hasVisionCapability: true
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
};

// 测试微软OCR API
export const testMicrosoftOCR = async () => {
  try {
    const endpoint = import.meta.env.VITE_AZURE_VISION_ENDPOINT;
    const apiKey = import.meta.env.VITE_AZURE_VISION_KEY;
    
    if (!endpoint || !apiKey) {
      return { success: false, error: '微软OCR API未配置' };
    }

    // 简单的连接测试
    const response = await fetch(`${endpoint}/vision/v3.2/read/analyze`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://via.placeholder.com/150x50/000000/FFFFFF?text=TEST'
      })
    });

    if (response.status === 401) {
      return { success: false, error: 'OCR API密钥无效' };
    }
    
    if (response.status === 403) {
      return { success: false, error: 'OCR API访问被拒绝' };
    }

    // 202是正常的提交响应
    if (response.status === 202) {
      return { success: true, result: 'OCR API连接正常' };
    }

    return { 
      success: false, 
      error: `OCR API响应异常: ${response.status}` 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '网络连接失败' 
    };
  }
};

// 综合API状态检测
export const checkAPIStatus = async () => {
  console.log('🔍 开始检测API状态...');
  
  const results = {
    openaiText: await testOpenAITextMode(),
    openaiVision: await testOpenAIVisionMode(),
    microsoftOCR: await testMicrosoftOCR()
  };

  // 生成建议
  const recommendations: string[] = [];
  
  if (!results.openaiText.success) {
    recommendations.push('🔑 配置OpenAI API密钥');
  }
  
  if (!results.openaiVision.success) {
    if (results.openaiText.success) {
      recommendations.push('💡 OpenAI账户无视觉功能，建议使用OCR+文字模式');
    } else {
      recommendations.push('🔍 检查OpenAI账户权限和余额');
    }
  }
  
  if (!results.microsoftOCR.success) {
    recommendations.push('🖼️ 配置微软Azure Computer Vision API作为OCR备用方案');
  }

  // 确定推荐的使用模式
  let recommendedMode = '';
  if (results.openaiVision.success) {
    recommendedMode = '🎯 推荐使用：图像直接识别模式';
  } else if (results.openaiText.success && results.microsoftOCR.success) {
    recommendedMode = '🎯 推荐使用：OCR + 文字批改模式';
  } else if (results.openaiText.success) {
    recommendedMode = '⚠️ 仅文字模式可用，需要手动输入题目内容';
  } else {
    recommendedMode = '❌ 需要配置API才能使用批改功能';
  }

  console.log('📊 API状态检测结果:', {
    OpenAI文字模式: results.openaiText.success ? '✅' : '❌',
    OpenAI视觉模式: results.openaiVision.success ? '✅' : '❌',
    微软OCR: results.microsoftOCR.success ? '✅' : '❌',
    推荐模式: recommendedMode
  });

  return {
    results,
    recommendations,
    recommendedMode,
    summary: {
      hasTextMode: results.openaiText.success,
      hasVisionMode: results.openaiVision.success,
      hasOCR: results.microsoftOCR.success,
      canUseDirect: results.openaiVision.success,
      canUseOCR: results.openaiText.success && results.microsoftOCR.success,
      needsConfiguration: !results.openaiText.success
    }
  };
};

// 在控制台中运行测试的便捷函数
export const runQuickTest = async () => {
  const status = await checkAPIStatus();
  
  console.log('\n🎯 快速配置建议:');
  status.recommendations.forEach(rec => console.log(rec));
  
  console.log('\n' + status.recommendedMode);
  
  return status;
};
