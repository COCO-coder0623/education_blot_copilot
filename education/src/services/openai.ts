import OpenAI from 'openai';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL,
  dangerouslyAllowBrowser: true // 注意：生产环境中应该通过后端API调用
});

export interface Question {
  id: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  explanation: string;
  knowledgePoints: string[];
  commonMistakes?: string[];
  practiceQuestions?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GradingResult {
  id: string;
  title: string;
  subject: string;
  grade: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  maxScore: number;
  questions: Question[];
  weaknessAnalysis: {
    weakPoints: Array<{
      topic: string;
      mastery: number;
      questions: number[];
      suggestions: string[];
    }>;
    strengths: string[];
  };
  timeSpent: string;
  date: string;
}

// 修复和验证AI返回的JSON数据
const fixAndValidateAIResponse = (jsonStr: string): any => {
  try {
    // 常见的JSON修复操作
    let fixedJson = jsonStr
      .trim()
      // 修复可能的换行问题
      .replace(/\n/g, ' ')
      // 修复可能的转义问题
      .replace(/\\\"/g, '"')
      // 修复可能的尾随逗号
      .replace(/,(\s*[}\]])/g, '$1');
    
    // 尝试解析
    const parsed = JSON.parse(fixedJson);
    
    // 验证和修复数据结构
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('缺少questions字段');
    }
    
    // 修复每个题目的数据
    parsed.questions = parsed.questions.map((q: any, index: number) => ({
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
    }));
    
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
    
    return parsed;
    
  } catch (error) {
    console.error('JSON修复失败:', error);
    throw error;
  }
};

// 将图片转换为base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // 移除data:image/...;base64,前缀
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 调用GPT-4o进行作业批改（支持OCR文字内容和自定义提示词）
export const gradeAssignmentWithOCR = async (
  images: File[], 
  ocrText?: string,
  customPrompt?: string
): Promise<GradingResult> => {
  try {
    // 检查API密钥是否配置
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('请在 .env 文件中配置有效的 VITE_OPENAI_API_KEY');
    }

    let content: any[] = [];
    let useOCRMode = false;

    // 如果提供了OCR文字，优先使用文字模式
    if (ocrText && ocrText.trim().length > 0) {
      console.log('🔤 使用OCR文字模式进行批改');
      useOCRMode = true;
      
      content = [{
        type: "text" as const,
        text: customPrompt || `请分析以下从作业图片中提取的文字内容，执行作业批改任务：

📝 OCR提取的文字内容：
${ocrText}

🎯 请执行以下任务：
1. 识别并分析试卷内容，包括：
   - 试卷标题和学科
   - 每道题目的完整题干
   - 学生的答案
   - 如果有标准答案，也请识别

2. 对每道题进行批改：
   - 判断对错
   - 给出正确答案
   - 计算得分

3. 对错题进行详细分析：
   - 详细解释正确解法
   - 指出学生错误的原因
   - 列出相关知识点
   - 提供常见错误类型
   - 推荐类似练习题

4. 分析学生的薄弱知识点并给出学习建议

请以JSON格式返回结果，格式如下：
{
  "title": "试卷标题",
  "subject": "学科名称",
  "grade": "年级",
  "questions": [
    {
      "id": 1,
      "question": "题目内容",
      "studentAnswer": "学生答案",
      "correctAnswer": "正确答案",
      "isCorrect": true/false,
      "points": 实际得分,
      "maxPoints": 满分,
      "explanation": "详细解释",
      "knowledgePoints": ["知识点1", "知识点2"],
      "commonMistakes": ["常见错误1", "常见错误2"],
      "practiceQuestions": ["练习题1", "练习题2"],
      "difficulty": "easy/medium/hard"
    }
  ],
  "weaknessAnalysis": {
    "weakPoints": [
      {
        "topic": "薄弱知识点",
        "mastery": 掌握程度百分比,
        "questions": [相关题目ID],
        "suggestions": ["建议1", "建议2"]
      }
    ],
    "strengths": ["优势点1", "优势点2"]
  }
}

💡 注意事项：
- 如果文字内容不完整或有识别错误，请根据上下文推断
- 确保分析准确、详细，特别关注错题的教学价值
- 如果无法确定某些信息，请在explanation中说明`
      }];
    } else {
      console.log('🖼️ 使用图像模式进行批改');
      
      // 将所有图片转换为base64
      const base64Images = await Promise.all(images.map(imageToBase64));
      
      // 构建图像消息内容
      content = [
        {
          type: "text" as const,
          text: `请分析这些作业图片，执行以下任务：

1. 识别并提取试卷的完整内容，包括：
   - 试卷标题和学科
   - 每道题目的完整题干
   - 学生的答案
   - 如果有标准答案，也请识别

2. 对每道题进行批改：
   - 判断对错
   - 给出正确答案
   - 计算得分

3. 对错题进行详细分析：
   - 详细解释正确解法
   - 指出学生错误的原因
   - 列出相关知识点
   - 提供常见错误类型
   - 推荐类似练习题

4. 分析学生的薄弱知识点并给出学习建议

请以JSON格式返回结果，格式如下：
{
  "title": "试卷标题",
  "subject": "学科名称",
  "grade": "年级",
  "questions": [
    {
      "id": 1,
      "question": "题目内容",
      "studentAnswer": "学生答案",
      "correctAnswer": "正确答案",
      "isCorrect": true/false,
      "points": 实际得分,
      "maxPoints": 满分,
      "explanation": "详细解释",
      "knowledgePoints": ["知识点1", "知识点2"],
      "commonMistakes": ["常见错误1", "常见错误2"],
      "practiceQuestions": ["练习题1", "练习题2"],
      "difficulty": "easy/medium/hard"
    }
  ],
  "weaknessAnalysis": {
    "weakPoints": [
      {
        "topic": "薄弱知识点",
        "mastery": 掌握程度百分比,
        "questions": [相关题目ID],
        "suggestions": ["建议1", "建议2"]
      }
    ],
    "strengths": ["优势点1", "优势点2"]
  }
}

请确保分析准确、详细，特别关注错题的教学价值。`
        },
        ...base64Images.map(base64 => ({
          type: "image_url" as const,
          image_url: {
            url: `data:image/jpeg;base64,${base64}`,
            detail: "high" as const
          }
        }))
      ];
    }

    // 选择合适的模型
    const model = useOCRMode ? "gpt-4o" : "gpt-4o"; // OCR模式也使用gpt-4o，但不需要视觉功能

    console.log(`🤖 调用${model}进行批改 (${useOCRMode ? 'OCR文字模式' : '图像模式'})`);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('未收到GPT-4o响应');
    }

    // 检查是否为错误消息或非JSON响应
    if (result.includes('抱歉') || result.includes('无法处理') || result.includes('不能') || result.includes('无法识别')) {
      throw new Error(`AI无法处理内容: ${result}`);
    }
    
    // 检查是否是API权限问题（仅在图像模式下）
    if (!useOCRMode && (
        result.includes("I'm unable to directly analyze images") || 
        result.includes("cannot analyze images") ||
        result.includes("cannot process images") ||
        result.includes("OCR software")
    )) {
      throw new Error(`API密钥权限不足: 您的OpenAI API密钥可能没有GPT-4o视觉功能的访问权限。建议：
1. 检查API密钥是否正确且有效
2. 确认OpenAI账户是否有足够的余额
3. 确认账户是否已启用GPT-4o视觉功能
4. 可以先尝试使用OCR模式：上传图片 → OCR识别 → 文字批改`);
    }

    // 检查响应是否包含JSON格式
    if (!result.includes('{') && !result.includes('}')) {
      // 如果是图像模式失败，提示用户尝试OCR模式
      if (!useOCRMode) {
        throw new Error(`图像识别失败，AI返回: ${result}
        
建议解决方案：
1. 先点击"OCR识别"按钮提取文字
2. 然后再进行批改（将自动使用文字模式）
3. 或者检查您的OpenAI API是否支持GPT-4o视觉功能`);
      } else {
        throw new Error(`AI返回非结构化数据: ${result}`);
      }
    }

    // 解析JSON响应
    let parsedResult;
    try {
      // 提取JSON部分（可能包含在代码块中）
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/\{[\s\S]*\}/);
      let jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : result;
      
      if (!jsonStr) {
        throw new Error('响应中未找到有效的JSON数据');
      }
      
      // 使用修复函数处理JSON
      parsedResult = fixAndValidateAIResponse(jsonStr);
      
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      console.error('原始响应内容:', result);
      
      // 提供更详细的错误信息和fallback方案
      let errorDetail = '';
      if (result.includes('```json')) {
        errorDetail = '检测到JSON代码块但解析失败';
      } else if (result.includes('{')) {
        errorDetail = '检测到JSON数据但格式不完整';
      } else {
        errorDetail = 'AI返回的不是JSON格式数据';
      }
      
      // 尝试提供一个基本的fallback结果
      console.log('🔄 尝试创建fallback批改结果...');
      
      parsedResult = {
        id: Date.now().toString(),
        title: '批改结果（格式修复）',
        subject: '数学',
        grade: '未知',
        totalQuestions: 1,
        correctAnswers: 0,
        score: 0,
        maxScore: 100,
        questions: [{
          id: 1,
          question: '由于AI返回数据格式问题，无法正确解析题目',
          studentAnswer: '解析失败',
          correctAnswer: '请重新批改',
          isCorrect: false,
          points: 0,
          maxPoints: 1,
          explanation: `原始AI响应存在格式问题: ${errorDetail}。请重新尝试批改，或联系技术支持。`,
          knowledgePoints: ['数据解析'],
          commonMistakes: ['格式错误'],
          practiceQuestions: [],
          difficulty: 'medium' as const
        }],
        weaknessAnalysis: {
          weakPoints: [{
            topic: '数据解析问题',
            mastery: 0,
            questions: [1],
            suggestions: ['重新尝试批改', '检查图片质量', '联系技术支持']
          }],
          strengths: []
        },
        timeSpent: '处理失败',
        date: new Date().toISOString()
      };
      
      console.warn('⚠️ 使用fallback批改结果');
    }

    // 补充必要的字段
    const gradingResult: GradingResult = {
      id: Date.now().toString(),
      title: parsedResult.title || '作业批改',
      subject: parsedResult.subject || '未知学科',
      grade: parsedResult.grade || '未知年级',
      totalQuestions: parsedResult.questions?.length || 0,
      correctAnswers: parsedResult.questions?.filter((q: Question) => q.isCorrect).length || 0,
      score: parsedResult.questions?.reduce((sum: number, q: Question) => sum + q.points, 0) || 0,
      maxScore: parsedResult.questions?.reduce((sum: number, q: Question) => sum + q.maxPoints, 0) || 100,
      questions: parsedResult.questions || [],
      weaknessAnalysis: parsedResult.weaknessAnalysis || { weakPoints: [], strengths: [] },
      timeSpent: '未知',
      date: new Date().toISOString().split('T')[0]
    };

    return gradingResult;

  } catch (error) {
    console.error('GPT-4o批改错误:', error);
    throw new Error(`批改失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 保留原始函数作为兼容性接口
export const gradeAssignment = async (images: File[]): Promise<GradingResult> => {
  return gradeAssignmentWithOCR(images);
};

// 模拟数据（用于开发测试）
export const getMockGradingResult = (): GradingResult => {
  return {
    id: Date.now().toString(),
    title: '二次函数综合练习',
    subject: '数学',
    grade: '初二',
    totalQuestions: 5,
    correctAnswers: 3,
    score: 75,
    maxScore: 100,
    questions: [
      {
        id: 1,
        question: '已知二次函数 f(x) = x² - 4x + 3，求该函数的对称轴方程。',
        studentAnswer: 'x = 2',
        correctAnswer: 'x = 2',
        isCorrect: true,
        points: 20,
        maxPoints: 20,
        explanation: '二次函数 f(x) = ax² + bx + c 的对称轴方程为 x = -b/(2a)。在此题中，a = 1, b = -4，所以对称轴为 x = -(-4)/(2×1) = 2。',
        knowledgePoints: ['二次函数的基本性质', '对称轴公式'],
        difficulty: 'easy'
      },
      {
        id: 2,
        question: '求二次函数 f(x) = x² - 4x + 3 的最小值。',
        studentAnswer: '1',
        correctAnswer: '-1',
        isCorrect: false,
        points: 0,
        maxPoints: 20,
        explanation: '二次函数在对称轴处取得最值。由于 a = 1 > 0，函数开口向上，在 x = 2 处取得最小值。f(2) = 2² - 4×2 + 3 = 4 - 8 + 3 = -1。',
        knowledgePoints: ['二次函数的最值', '函数的极值计算'],
        commonMistakes: ['忘记计算对称轴处的函数值', '符号计算错误'],
        practiceQuestions: [
          '求 f(x) = 2x² - 8x + 5 的最小值',
          '已知 f(x) = -x² + 6x - 8，求其最大值'
        ],
        difficulty: 'medium'
      }
    ],
    weaknessAnalysis: {
      weakPoints: [
        {
          topic: '二次函数的最值计算',
          mastery: 40,
          questions: [2],
          suggestions: [
            '复习二次函数的对称轴和最值公式',
            '练习更多关于函数最值的计算题',
            '注意符号计算的准确性'
          ]
        }
      ],
      strengths: [
        '对称轴公式掌握较好',
        '基础概念理解清晰'
      ]
    },
    timeSpent: '45分钟',
    date: new Date().toISOString().split('T')[0]
  };
};