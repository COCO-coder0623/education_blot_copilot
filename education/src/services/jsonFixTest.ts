/**
 * JSON修复和验证测试工具
 * 专门解决AI返回JSON格式问题
 */

// 测试有问题的JSON数据
const problematicJSON = `{
  "title": "数学作业",
  "subject": "数学", 
  "grade": "初中",
  "questions": [
    {
      "id": 1,
      "question": "3.88888 是循环小数。",
      "studentAnswer": "×",
      "correctAnswer": "√",
      "isCorrect": false,
      "points": 0,
      "maxPoints": 1,
      "explanation": "3.88888 是循环小数，因为小数部分 '88888' 是无限重复的。",
      "knowledgePoints": ["循环小数的定义"],
      "commonMistakes": ["误认为有限小数"],
      "practiceQuestions": ["判断以下数是否为循环小数：4.33333"],
      "difficulty": "easy"
    }
  ],
  "weaknessAnalysis": {
    "weakPoints": [
      {
        "topic": "循环小数的定义",
        "mastery": 50,
        "questions": [1],
        "suggestions": ["复习循环小数的定义和特征"]
      }
    ],
    "strengths": ["正比例关系"]
  }
}`;

// JSON修复函数（与openai.ts中的函数相同）
export const fixAndValidateJSON = (jsonStr: string): any => {
  try {
    console.log('🔧 开始修复JSON数据...');
    
    // 常见的JSON修复操作
    let fixedJson = jsonStr
      .trim()
      // 修复可能的换行问题
      .replace(/\n/g, ' ')
      // 修复可能的转义问题
      .replace(/\\\"/g, '"')
      // 修复可能的尾随逗号
      .replace(/,(\s*[}\]])/g, '$1')
      // 修复单引号问题
      .replace(/'/g, '"');
    
    console.log('📝 修复后的JSON:', fixedJson.substring(0, 200) + '...');
    
    // 尝试解析
    const parsed = JSON.parse(fixedJson);
    console.log('✅ JSON解析成功');
    
    // 验证和修复数据结构
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('缺少questions字段');
    }
    
    console.log(`📊 发现 ${parsed.questions.length} 道题目`);
    
    // 修复每个题目的数据
    parsed.questions = parsed.questions.map((q: any, index: number) => {
      const fixed = {
        id: q.id || (index + 1),
        question: String(q.question || '题目信息缺失'),
        studentAnswer: String(q.studentAnswer || ''),
        correctAnswer: String(q.correctAnswer || ''),
        isCorrect: Boolean(q.isCorrect),
        points: Number(q.points) || 0,
        maxPoints: Number(q.maxPoints) || 1,
        explanation: String(q.explanation || '暂无解释'),
        knowledgePoints: Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [],
        commonMistakes: Array.isArray(q.commonMistakes) ? q.commonMistakes : [],
        practiceQuestions: Array.isArray(q.practiceQuestions) ? q.practiceQuestions : [],
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium'
      };
      
      console.log(`✅ 题目${index + 1}修复完成:`, fixed.question.substring(0, 30) + '...');
      return fixed;
    });
    
    // 确保weaknessAnalysis存在
    if (!parsed.weaknessAnalysis) {
      parsed.weaknessAnalysis = {
        weakPoints: [],
        strengths: []
      };
    } else {
      // 修复weaknessAnalysis结构
      if (!Array.isArray(parsed.weaknessAnalysis.weakPoints)) {
        parsed.weaknessAnalysis.weakPoints = [];
      }
      if (!Array.isArray(parsed.weaknessAnalysis.strengths)) {
        parsed.weaknessAnalysis.strengths = [];
      }
    }
    
    // 确保基本字段存在
    parsed.title = parsed.title || '作业批改结果';
    parsed.subject = parsed.subject || '未知学科';
    parsed.grade = parsed.grade || '未知年级';
    
    console.log('🎉 JSON数据修复和验证完成');
    return parsed;
    
  } catch (error) {
    console.error('❌ JSON修复失败:', error);
    throw new Error(`JSON修复失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 测试函数
export const testJSONFix = () => {
  console.log('🧪 开始测试JSON修复功能...');
  
  try {
    const result = fixAndValidateJSON(problematicJSON);
    console.log('✅ 测试成功！修复后的数据:', result);
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

// 在开发环境下暴露到全局
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).testJSONFix = testJSONFix;
  (window as any).fixAndValidateJSON = fixAndValidateJSON;
}
