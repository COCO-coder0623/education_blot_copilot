// 🧪 API配置和功能测试脚本
// 在浏览器控制台中运行以测试真实API功能

console.log('🎯 开始测试API配置和功能...');

// 测试环境变量配置
function testEnvConfig() {
  console.log('\n📋 检查环境变量配置:');
  
  const ocrEndpoint = import.meta.env.VITE_AZURE_VISION_ENDPOINT;
  const ocrKey = import.meta.env.VITE_AZURE_VISION_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  console.log('OCR Endpoint:', ocrEndpoint ? '✅ 已配置' : '❌ 未配置');
  console.log('OCR Key:', ocrKey ? `✅ 已配置 (${ocrKey.substring(0, 10)}...)` : '❌ 未配置');
  console.log('OpenAI Key:', openaiKey ? `✅ 已配置 (${openaiKey.substring(0, 15)}...)` : '❌ 未配置');
  
  const allConfigured = ocrEndpoint && ocrKey && openaiKey;
  console.log('\n🎉 配置状态:', allConfigured ? '✅ 完整配置' : '❌ 配置不完整');
  
  return { ocrEndpoint, ocrKey, openaiKey, allConfigured };
}

// 测试Azure OCR API连接
async function testAzureOCR() {
  console.log('\n🔍 测试Azure OCR API连接...');
  
  const endpoint = import.meta.env.VITE_AZURE_VISION_ENDPOINT;
  const key = import.meta.env.VITE_AZURE_VISION_KEY;
  
  if (!endpoint || !key) {
    console.error('❌ Azure OCR API 配置不完整');
    return false;
  }
  
  try {
    // 测试API连通性（使用一个小的测试图片URL）
    const testUrl = 'https://via.placeholder.com/300x100/000000/FFFFFF?text=Test+OCR';
    
    const response = await fetch(`${endpoint}/vision/v3.2/read/analyze`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: testUrl })
    });
    
    if (response.ok) {
      console.log('✅ Azure OCR API 连接成功');
      console.log('- 状态码:', response.status);
      console.log('- 操作位置:', response.headers.get('Operation-Location'));
      return true;
    } else {
      console.error('❌ Azure OCR API 连接失败');
      console.error('- 状态码:', response.status);
      console.error('- 错误信息:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Azure OCR API 测试失败:', error.message);
    return false;
  }
}

// 测试OpenAI API连接
async function testOpenAI() {
  console.log('\n🤖 测试OpenAI API连接...');
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OpenAI API 密钥未配置');
    return false;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const gpt4Models = data.data.filter(model => model.id.includes('gpt-4'));
      
      console.log('✅ OpenAI API 连接成功');
      console.log('- 可用的GPT-4模型数量:', gpt4Models.length);
      console.log('- 支持视觉的模型:', gpt4Models.filter(m => m.id.includes('vision') || m.id.includes('gpt-4o')).map(m => m.id));
      return true;
    } else {
      console.error('❌ OpenAI API 连接失败');
      console.error('- 状态码:', response.status);
      console.error('- 错误信息:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API 测试失败:', error.message);
    return false;
  }
}

// 测试完整功能流程
async function testCompleteWorkflow() {
  console.log('\n🚀 测试完整功能流程...');
  
  try {
    // 动态导入服务模块
    const { ocrService } = await import('./src/services/ocr.js');
    const { gradeAssignmentWithOCR } = await import('./src/services/openai.js');
    
    console.log('✅ 服务模块导入成功');
    
    // 创建测试图片
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // 绘制测试内容
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 200);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('1. 计算: 5 + 3 = ?', 20, 50);
    ctx.fillText('学生答案: 8', 20, 80);
    ctx.fillText('2. 计算: 2 × 4 = ?', 20, 120);
    ctx.fillText('学生答案: 8', 20, 150);
    
    // 转换为File对象
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const testFile = new File([blob], 'test-homework.png', { type: 'image/png' });
    
    console.log('📸 测试图片创建成功');
    
    // 测试OCR识别
    console.log('🔍 测试OCR识别...');
    const ocrResult = await ocrService.recognizeImage(testFile);
    console.log('✅ OCR识别完成:', ocrResult);
    
    // 测试AI批改
    console.log('🤖 测试AI批改...');
    const gradingResult = await gradeAssignmentWithOCR([testFile], ocrResult.text);
    console.log('✅ AI批改完成:', gradingResult);
    
    return { ocrResult, gradingResult };
    
  } catch (error) {
    console.error('❌ 完整流程测试失败:', error);
    return null;
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🎯 开始完整API和功能测试...\n');
  
  // 1. 测试环境配置
  const envConfig = testEnvConfig();
  
  if (!envConfig.allConfigured) {
    console.log('\n⚠️ 部分API未配置，跳过连接测试');
    return;
  }
  
  // 2. 测试API连接
  const azureOK = await testAzureOCR();
  const openaiOK = await testOpenAI();
  
  if (!azureOK || !openaiOK) {
    console.log('\n⚠️ API连接测试失败，跳过功能测试');
    return;
  }
  
  // 3. 测试完整功能
  const workflowResult = await testCompleteWorkflow();
  
  // 4. 总结
  console.log('\n📊 测试结果总结:');
  console.log('环境配置:', envConfig.allConfigured ? '✅' : '❌');
  console.log('Azure OCR:', azureOK ? '✅' : '❌');
  console.log('OpenAI API:', openaiOK ? '✅' : '❌');
  console.log('完整流程:', workflowResult ? '✅' : '❌');
  
  if (envConfig.allConfigured && azureOK && openaiOK && workflowResult) {
    console.log('\n🎉 所有测试通过！AI作业批改功能完全就绪！');
    console.log('💡 现在可以正常使用上传页面的三个功能：');
    console.log('   🟣 一键批改 - 完整自动化流程');
    console.log('   🟢 OCR识别题目 - 仅识别文字');
    console.log('   🔵 高级批改 - 先识别后批改');
  } else {
    console.log('\n❌ 部分测试失败，请检查配置和网络连接');
  }
}

// 在控制台提供快捷测试函数
if (typeof window !== 'undefined') {
  window.testEnvConfig = testEnvConfig;
  window.testAzureOCR = testAzureOCR;
  window.testOpenAI = testOpenAI;
  window.testCompleteWorkflow = testCompleteWorkflow;
  window.runAllTests = runAllTests;
  
  console.log('\n🛠️ 测试函数已加载到 window 对象:');
  console.log('- testEnvConfig() - 检查环境变量');
  console.log('- testAzureOCR() - 测试Azure OCR API');
  console.log('- testOpenAI() - 测试OpenAI API'); 
  console.log('- testCompleteWorkflow() - 测试完整流程');
  console.log('- runAllTests() - 运行所有测试');
  console.log('\n💡 在控制台运行 runAllTests() 开始完整测试');
}
