/**
 * 完整的作业批改实现方案
 * 解决图片识别和OpenAI处理问题
 */

import { ocrService } from '../services/ocr';
import { gradeAssignmentWithOCR } from '../services/openai';

// 1. 图片预处理和OCR识别
export const processHomeworkImage = async (imageFile: File) => {
  try {
    console.log('📸 开始处理作业图片...');
    
    // 步骤1: 图片质量检查和优化
    const { ImageProcessor } = await import('../utils/imageProcessor');
    
    // 分析图片质量
    const quality = await ImageProcessor.analyzeImageQuality(imageFile);
    console.log('图片质量评分:', quality.score);
    
    if (quality.score < 50) {
      console.warn('⚠️ 图片质量较差，建议重新拍摄');
      return {
        success: false,
        error: '图片质量不佳',
        suggestions: quality.recommendations
      };
    }
    
    // 步骤2: 优化图片
    const optimizedFile = await ImageProcessor.optimizeForOCR(imageFile, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.95,
      enableSharpening: true,
      enableContrast: true
    });
    
    // 步骤3: OCR识别
    console.log('🔤 开始OCR文字识别...');
    const ocrResult = await ocrService.recognizeImage(optimizedFile);
    
    if (!ocrResult.text || ocrResult.text.trim().length < 20) {
      return {
        success: false,
        error: 'OCR识别到的文字太少',
        suggestions: ['请确保图片清晰', '检查光线是否充足', '避免倾斜拍摄']
      };
    }
    
    // 步骤4: 提取题目结构
    const questions = ocrService.extractQuestions(ocrResult);
    
    return {
      success: true,
      ocrText: ocrResult.text,
      questions,
      confidence: ocrResult.confidence,
      optimizedFile
    };
    
  } catch (error) {
    console.error('图片处理失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '处理失败',
      suggestions: ['检查图片格式', '确保网络连接正常', '重试上传']
    };
  }
};

// 2. 智能批改功能
export const gradeHomework = async (imageFiles: File[], ocrText?: string) => {
  try {
    console.log('🤖 开始智能批改...');
    
    // 构建详细的批改提示词
    const gradingPrompt = `你是一位专业的数学老师，请仔细分析这份作业并进行批改。

${ocrText ? `📝 OCR识别的文字内容：\n${ocrText}\n\n` : ''}

🎯 请按以下格式返回JSON结果：

{
  "title": "试卷标题",
  "subject": "数学",
  "grade": "初中",
  "totalQuestions": 总题目数,
  "correctAnswers": 正确题目数,
  "score": 总得分,
  "maxScore": 总分,
  "questions": [
    {
      "id": 1,
      "question": "题目内容（尽可能完整）",
      "studentAnswer": "学生的答案",
      "correctAnswer": "正确答案",
      "isCorrect": true/false,
      "points": 得分,
      "maxPoints": 满分,
      "explanation": "详细解题过程和错误分析",
      "knowledgePoints": ["相关知识点"],
      "difficulty": "easy/medium/hard"
    }
  ],
  "weaknessAnalysis": {
    "weakPoints": [
      {
        "topic": "薄弱知识点",
        "mastery": 掌握程度(0-100),
        "questions": [相关题目ID],
        "suggestions": ["学习建议"]
      }
    ],
    "strengths": ["优势领域"]
  },
  "overallFeedback": "总体评价和建议"
}

📋 批改要求：
1. 仔细识别每道题的题目内容和学生答案
2. 对错题给出详细的解题步骤
3. 指出学生的错误原因
4. 提供相关知识点复习建议
5. 给出鼓励性的总体评价

请确保返回有效的JSON格式。`;

    // 调用增强版的批改服务
    const result = await gradeAssignmentWithOCR(imageFiles, ocrText, gradingPrompt);
    
    return {
      success: true,
      result
    };
    
  } catch (error) {
    console.error('批改失败:', error);
    
    // 提供详细的错误处理
    let errorMessage = '批改失败';
    let suggestions: string[] = [];
    
    if (error instanceof Error) {
      if (error.message.includes('API密钥')) {
        errorMessage = 'OpenAI API配置问题';
        suggestions = [
          '检查VITE_OPENAI_API_KEY是否正确',
          '确认API密钥有效且有余额',
          '可以先尝试OCR模式提取文字'
        ];
      } else if (error.message.includes('视觉功能')) {
        errorMessage = 'API不支持图像识别';
        suggestions = [
          '您的OpenAI账户可能没有GPT-4o视觉功能',
          '建议使用OCR+文字模式',
          '先点击"OCR识别"提取文字，再进行批改'
        ];
      } else if (error.message.includes('网络')) {
        errorMessage = '网络连接问题';
        suggestions = [
          '检查网络连接',
          '稍后重试',
          '确认能访问OpenAI服务'
        ];
      } else {
        errorMessage = error.message;
        suggestions = ['检查图片质量', '重试上传', '联系技术支持'];
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      suggestions
    };
  }
};

// 3. 完整的工作流程
export const completeHomeworkFlow = async (imageFiles: File[]) => {
  const results = {
    imageProcessing: null as any,
    grading: null as any,
    success: false
  };
  
  try {
    // 步骤1: 处理所有图片
    console.log('🔄 开始完整作业处理流程...');
    
    const imageProcessingPromises = imageFiles.map(file => processHomeworkImage(file));
    const imageResults = await Promise.all(imageProcessingPromises);
    
    // 检查是否有失败的图片处理
    const failedImages = imageResults.filter(r => !r.success);
    if (failedImages.length > 0) {
      console.warn('部分图片处理失败:', failedImages);
    }
    
    // 合并所有成功识别的文字内容
    const successfulResults = imageResults.filter(r => r.success);
    if (successfulResults.length === 0) {
      throw new Error('所有图片处理都失败了');
    }
    
    const combinedOCRText = successfulResults
      .map((r, index) => `图片${index + 1}内容：\n${r.ocrText}`)
      .join('\n\n---\n\n');
    
    results.imageProcessing = {
      total: imageFiles.length,
      successful: successfulResults.length,
      failed: failedImages.length,
      combinedText: combinedOCRText,
      averageConfidence: successfulResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / successfulResults.length
    };
    
    // 步骤2: 智能批改
    console.log('📝 合并文字内容，开始智能批改...');
    const gradingResult = await gradeHomework(imageFiles, combinedOCRText);
    
    results.grading = gradingResult;
    results.success = gradingResult.success;
    
    if (gradingResult.success && gradingResult.result) {
      console.log('✅ 作业批改完成！');
      console.log('批改结果:', {
        总题数: gradingResult.result.totalQuestions,
        正确数: gradingResult.result.correctAnswers,
        得分: `${gradingResult.result.score}/${gradingResult.result.maxScore}`
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('完整流程失败:', error);
    results.success = false;
    return results;
  }
};

// 4. 使用示例和测试函数
export const testHomeworkGrading = async (imageFile: File) => {
  console.log('🧪 开始测试作业批改功能...');
  
  try {
    // 测试1: 图片处理
    const imageResult = await processHomeworkImage(imageFile);
    console.log('图片处理结果:', imageResult);
    
    if (!imageResult.success) {
      console.error('图片处理失败:', imageResult.error);
      return;
    }
    
    // 测试2: 批改功能
    const gradingResult = await gradeHomework([imageFile], imageResult.ocrText);
    console.log('批改结果:', gradingResult);
    
    if (gradingResult.success) {
      console.log('🎉 测试成功！批改功能正常工作');
    } else {
      console.error('❌ 批改失败:', gradingResult.error);
    }
    
  } catch (error) {
    console.error('测试过程出错:', error);
  }
};
