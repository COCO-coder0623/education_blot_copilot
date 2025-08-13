// 微软Computer Vision OCR服务
export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface ExtractedQuestion {
  id: number;
  questionNumber: string;
  questionText: string;
  options?: string[];
  studentAnswer?: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class OCRService {
  private endpoint: string;
  private apiKey: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_AZURE_VISION_ENDPOINT || '';
    this.apiKey = import.meta.env.VITE_AZURE_VISION_KEY || '';
  }

  // 检查API配置
  private validateConfig(): void {
    if (!this.endpoint || !this.apiKey) {
      throw new Error(`请配置微软Azure Computer Vision API：
      
📝 配置步骤：
1. 在Azure门户创建Computer Vision资源
2. 在 education/.env 文件中添加：
   VITE_AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   VITE_AZURE_VISION_KEY=your_api_key_here
3. 重启开发服务器

💡 获取API密钥：
• 登录 https://portal.azure.com
• 创建或选择Computer Vision资源
• 在"密钥和终结点"页面获取密钥和终结点`);
    }
  }

  // 将图片转换为优化的ArrayBuffer
  private async fileToOptimizedArrayBuffer(file: File): Promise<{
    buffer: ArrayBuffer;
    contentType: string;
    metadata: any;
  }> {
    // 导入图片处理工具
    const { ImageProcessor } = await import('../utils/imageProcessor');
    
    try {
      // 分析图片质量
      const quality = await ImageProcessor.analyzeImageQuality(file);
      console.log('📊 图片质量分析:', quality);
      
      if (quality.score < 50) {
        console.warn('⚠️ 图片质量较差，可能影响识别效果:', quality.issues);
      }
      
      // 优化图片用于OCR
      const optimizedFile = await ImageProcessor.optimizeForOCR(file, {
        maxWidth: 3000,  // 微软API支持更高分辨率
        maxHeight: 3000,
        quality: 0.95,   // 高质量
        format: 'jpeg',
        enableSharpening: true,
        enableContrast: true,
        enableDenoising: false
      });
      
      // 获取元数据
      const metadata = await ImageProcessor.getImageMetadata(optimizedFile);
      
      // 转换为ArrayBuffer
      const buffer = await ImageProcessor.toHighQualityArrayBuffer(optimizedFile);
      
      return {
        buffer,
        contentType: optimizedFile.type,
        metadata
      };
      
    } catch (error) {
      console.warn('图片优化失败，使用原始图片:', error);
      
      // 降级处理：直接使用原始文件
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            buffer: reader.result as ArrayBuffer,
            contentType: file.type || 'image/jpeg',
            metadata: { optimized: false }
          });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }
  }

  // 调用微软OCR API（优化版本）
  private async callMicrosoftOCR(imageBuffer: ArrayBuffer, contentType: string): Promise<any> {
    // 使用Read API 3.2，这是最新且效果最好的版本
    const url = `${this.endpoint}/vision/v3.2/read/analyze`;
    
    console.log('🔍 开始调用微软OCR API:', {
      endpoint: this.endpoint,
      contentType,
      bufferSize: `${(imageBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`
    });
    
    // 第一步：提交图片进行分析
    const submitResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Content-Type': contentType,
        'User-Agent': 'AI-Education-SaaS/1.0'
      },
      body: imageBuffer
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('❌ OCR API提交失败:', {
        status: submitResponse.status,
        statusText: submitResponse.statusText,
        error: errorText
      });
      
      // 详细的错误处理
      if (submitResponse.status === 400) {
        throw new Error('图片格式或大小不符合要求。请确保图片清晰、格式正确(JPG/PNG)且小于4MB');
      } else if (submitResponse.status === 401) {
        throw new Error('API密钥无效。请检查VITE_AZURE_VISION_KEY配置');
      } else if (submitResponse.status === 403) {
        throw new Error('API访问被拒绝。请检查订阅状态和配额');
      } else if (submitResponse.status === 429) {
        throw new Error('API调用次数超限。请稍后重试或升级订阅');
      } else if (submitResponse.status === 413) {
        throw new Error('图片文件过大。请压缩图片后重试');
      }
      
      throw new Error(`微软OCR API调用失败: ${submitResponse.status} - ${errorText}`);
    }

    // 获取操作位置
    const operationLocation = submitResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('未获取到操作位置，请检查API配置');
    }

    console.log('✅ OCR任务已提交，等待处理结果...');

    // 第二步：智能轮询结果
    let result;
    let attempts = 0;
    const maxAttempts = 60; // 增加最大尝试次数
    const baseDelay = 500;   // 基础延迟500ms

    while (attempts < maxAttempts) {
      // 动态延迟：前几次快速检查，然后逐渐增加延迟
      const delay = attempts < 3 ? baseDelay : 
                   attempts < 10 ? baseDelay * 2 : 
                   baseDelay * 4;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'User-Agent': 'AI-Education-SaaS/1.0'
        }
      });

      if (!resultResponse.ok) {
        console.error(`获取OCR结果失败: ${resultResponse.status}`);
        throw new Error(`获取OCR结果失败: ${resultResponse.status}`);
      }

      result = await resultResponse.json();
      
      console.log(`🔄 OCR处理状态 (${attempts + 1}/${maxAttempts}):`, result.status);
      
      if (result.status === 'succeeded') {
        console.log('🎉 OCR识别成功！');
        break;
      } else if (result.status === 'failed') {
        console.error('❌ OCR分析失败:', result);
        throw new Error('OCR分析失败。可能原因：图片质量不佳、文字不清晰或格式不支持');
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('OCR分析超时。请尝试：1)使用更清晰的图片 2)减小图片文件大小 3)稍后重试');
    }

    return result;
  }

  // 识别单张图片
  async recognizeImage(imageFile: File): Promise<OCRResult> {
    this.validateConfig();

    try {
      console.log('开始微软OCR识别:', imageFile.name);
      
      // 转换图片为优化的二进制数据
      const { buffer: imageBuffer, contentType: optimizedContentType, metadata } = await this.fileToOptimizedArrayBuffer(imageFile);
      
      console.log('📁 图片处理信息:', metadata);
      
      // 使用优化后的内容类型，如果失败则降级到原始逻辑
      let finalContentType = optimizedContentType;
      if (!finalContentType || finalContentType === '') {
        // 根据文件扩展名推断MIME类型
        const extension = imageFile.name.toLowerCase().split('.').pop();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            finalContentType = 'image/jpeg';
            break;
          case 'png':
            finalContentType = 'image/png';
            break;
          case 'bmp':
            finalContentType = 'image/bmp';
            break;
          case 'gif':
            finalContentType = 'image/gif';
            break;
          default:
            finalContentType = 'image/jpeg'; // 默认为JPEG
        }
      }
      
      // 调用微软OCR API
      const result = await this.callMicrosoftOCR(imageBuffer, finalContentType);
      
      // 解析结果（改进版本）
      const words: OCRResult['words'] = [];
      let fullText = '';
      let totalConfidence = 0;
      let wordCount = 0;

      if (result.analyzeResult && result.analyzeResult.readResults) {
        console.log('📋 解析OCR识别结果...');
        
        for (const page of result.analyzeResult.readResults) {
          console.log(`📄 处理第${page.page}页，共${page.lines?.length || 0}行文本`);
          
          for (const line of page.lines) {
            // 改进的文本处理：保留更多空间信息
            const lineText = line.text.trim();
            if (lineText) {
              fullText += lineText + '\n';
            }
            
            // 处理单词级别的信息（提高精度）
            if (line.words) {
              for (const word of line.words) {
                const wordConfidence = (word.confidence || 0) * 100;
                
                // 只保留高置信度的单词
                if (wordConfidence > 30) { // 降低阈值以保留更多文本
                  words.push({
                    text: word.text,
                    confidence: Math.round(wordConfidence),
                    bbox: {
                      x0: word.boundingBox[0],
                      y0: word.boundingBox[1],
                      x1: word.boundingBox[4],
                      y1: word.boundingBox[5]
                    }
                  });
                  totalConfidence += wordConfidence;
                  wordCount++;
                }
              }
            }
          }
        }
        
        console.log(`📊 识别统计: 共${wordCount}个单词，${fullText.split('\n').filter(l => l.trim()).length}行文本`);
      } else {
        console.warn('⚠️ OCR结果格式异常，可能没有识别到文本');
        throw new Error('OCR结果格式异常。可能原因：图片中没有可识别的文字或图片质量太差');
      }

      const averageConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;

      // 输出详细的识别信息
      console.log('✅ 微软OCR识别完成:', {
        识别文本行数: fullText.split('\n').filter(l => l.trim()).length,
        识别单词数: wordCount,
        平均置信度: `${averageConfidence.toFixed(1)}%`,
        文本预览: fullText.substring(0, 100) + (fullText.length > 100 ? '...' : '')
      });

      // 如果识别到的文本太少，给出建议
      if (fullText.trim().length < 20) {
        console.warn('⚠️ 识别到的文本较少，建议检查图片质量');
      }

      if (averageConfidence < 70) {
        console.warn('⚠️ 识别置信度较低，建议优化图片质量');
      }

      return {
        text: fullText.trim(),
        confidence: Math.round(averageConfidence),
        words
      };

    } catch (error) {
      console.error('微软OCR识别错误:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('请配置微软Azure')) {
          throw error; // 直接抛出配置错误
        } else if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('API密钥无效或已过期，请检查Azure Computer Vision配置');
        } else if (error.message.includes('429')) {
          throw new Error('API调用频率超限，请稍后重试');
        } else if (error.message.includes('Network')) {
          throw new Error('网络连接失败，请检查网络连接后重试');
        }
      }
      
      throw new Error(`图片识别失败: ${error instanceof Error ? error.message : '未知错误'}，请确保图片清晰可读`);
    }
  }

  // 从OCR结果中提取题目
  extractQuestions(ocrResult: OCRResult): ExtractedQuestion[] {
    const text = ocrResult.text;
    console.log('OCR识别原始文本:', text);
    const words = ocrResult.words;
    const questions: ExtractedQuestion[] = [];

    // 题目编号的正则表达式（优化后的模式）
    const questionPatterns = [
      /^(\d+)[.．、]\s*/gm,  // 1. 2. 3.
      /^第(\d+)题[：:]\s*/gm,  // 第1题：
      /^\((\d+)\)\s*/gm,     // (1) (2)
      /^（(\d+)）\s*/gm,     // （1）（2）
      /^[\(（]([一二三四五六七八九十]+)[\)）]\s*/gm,  // (一) (二)
      /^(\d+)[\s]*[、.．]\s*/gm  // 处理数字后直接跟顿号的情况
    ];

    let questionId = 1;
    // 更好的文本分割和清理
    const lines = text.split(/[\r\n]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log('分割后的行:', lines);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 检查是否包含题目编号
      let questionMatch = null;
      let questionNumber = '';
      
      for (const pattern of questionPatterns) {
        pattern.lastIndex = 0; // 重置正则表达式
        const match = pattern.exec(line);
        if (match) {
          questionMatch = match;
          questionNumber = match[1];
          break;
        }
      }

      if (questionMatch) {
        // 提取题目文本
        let questionText = line.substring(questionMatch.index + questionMatch[0].length);
        
        // 如果当前行的题目文本太短，尝试合并下几行
        let nextLineIndex = i + 1;
        while (nextLineIndex < lines.length && questionText.length < 20) {
          const nextLine = lines[nextLineIndex].trim();
          // 如果下一行不是新题目的开始，则合并
          if (!this.isNewQuestion(nextLine)) {
            questionText += ' ' + nextLine;
            nextLineIndex++;
          } else {
            break;
          }
        }

        // 检查是否有选择题选项
        const { options, optionsEndIndex } = this.extractOptions(questionText, lines, nextLineIndex);
        
        // 更新下一个题目的搜索起始位置
        nextLineIndex = Math.max(nextLineIndex, optionsEndIndex);
        
        // 尝试识别学生答案
        const studentAnswer = this.extractStudentAnswer(questionText, words);

        // 计算题目在图片中的位置
        const position = this.calculateQuestionPosition(questionText, words);

        questions.push({
          id: questionId++,
          questionNumber,
          questionText: questionText.trim(),
          options: options.length > 0 ? options : undefined,
          studentAnswer,
          confidence: this.calculateQuestionConfidence(questionText, words),
          position
        });

        // 更新循环索引
        i = nextLineIndex - 1;
      }
    }
    
    console.log('提取的题目:', questions);
    return questions;
  }

  // 检查是否是新题目的开始
  private isNewQuestion(line: string): boolean {
    const questionPatterns = [
      /^\d+[.．、]\s*/,
      /^第\d+题[：:]\s*/,
      /^\(\d+\)\s*/,
      /^（\d+）\s*/,
      /^[\(（][一二三四五六七八九十]+[\)）]\s*/,
      /^\d+[\s]*[、.．]\s*/
    ];

    return questionPatterns.some(pattern => pattern.test(line));
  }

  // 提取选择题选项
  private extractOptions(questionText: string, lines: string[], startIndex: number): { options: string[]; optionsEndIndex: number } {
    const options: string[] = [];
    let optionsEndIndex = startIndex;
    
    const optionPatterns = [
      /^[ABCD][.．、]\s*(.+)/i,
      /^[ABCD][：:]\s*(.+)/i,
      /^\([ABCD]\)\s*(.+)/i,
      /^（[ABCD]）\s*(.+)/i,
      /^[ABCD][\s]*[.．、]\s*(.+)/i
    ];

    for (let i = startIndex; i < Math.min(startIndex + 8, lines.length); i++) {
      const line = lines[i].trim();
      let foundOption = false;
      
      for (const pattern of optionPatterns) {
        const match = pattern.exec(line);
        if (match) {
          options.push(match[1].trim());
          optionsEndIndex = i + 1;
          foundOption = true;
          break;
        }
      }
      
      // 如果遇到新题目，停止
      if (this.isNewQuestion(line)) {
        break;
      }
      
      // 如果这一行没有找到选项且已经有选项了，可能选项已经结束
      if (!foundOption && options.length > 0 && line.length > 10) {
        break;
      }
      
      // 如果选项数量达到4个，停止
      if (options.length >= 4) {
        optionsEndIndex = i + 1;
        break;
      }
    }

    return { options, optionsEndIndex };
  }

  // 提取学生答案
  private extractStudentAnswer(questionText: string, words: any[]): string | undefined {
    // 查找可能的答案标记
    const answerPatterns = [
      /答案[：:]\s*([ABCD\d]+)/gi,
      /选择[：:]\s*([ABCD])/gi,
      /答[：:]\s*([ABCD\d]+)/gi,
      /我的答案[：:]\s*([ABCD\d]+)/gi,
      /选[：:]\s*([ABCD])/gi
    ];

    for (const pattern of answerPatterns) {
      const match = pattern.exec(questionText);
      if (match) {
        return match[1];
      }
    }

    // 在OCR识别的单词中查找可能的答案标记
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i];
      const nextWord = words[i + 1];
      
      if ((word.text.includes('答') || word.text.includes('选')) && /^[ABCD\d]$/.test(nextWord.text)) {
        return nextWord.text;
      }
    }

    return undefined;
  }

  // 计算题目在图片中的位置
  private calculateQuestionPosition(questionText: string, words: any[]): { x: number; y: number; width: number; height: number } {
    // 找到题目文本对应的单词
    const questionWords = words.filter(word =>
      questionText.includes(word.text) && word.text.length > 1
    );

    if (questionWords.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    // 计算边界框
    const minX = Math.min(...questionWords.map(w => w.bbox.x0));
    const minY = Math.min(...questionWords.map(w => w.bbox.y0));
    const maxX = Math.max(...questionWords.map(w => w.bbox.x1));
    const maxY = Math.max(...questionWords.map(w => w.bbox.y1));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // 计算题目识别的置信度
  private calculateQuestionConfidence(questionText: string, words: any[]): number {
    const questionWords = words.filter(word =>
      questionText.includes(word.text) && word.text.length > 1
    );

    if (questionWords.length === 0) return 0;

    const avgConfidence = questionWords.reduce((sum, word) => sum + word.confidence, 0) / questionWords.length;
    return Math.round(avgConfidence);
  }

  // 清理资源（微软API不需要特殊清理）
  async cleanup(): Promise<void> {
    // 微软OCR API是无状态的，不需要清理
    console.log('微软OCR服务清理完成');
  }

  // 批量处理多张图片
  async recognizeMultipleImages(imageFiles: File[]): Promise<ExtractedQuestion[]> {
    const allQuestions: ExtractedQuestion[] = [];
    let questionIdOffset = 1;

    for (const imageFile of imageFiles) {
      try {
        console.log(`开始处理图片: ${imageFile.name}`);
        const ocrResult = await this.recognizeImage(imageFile);
        const questions = this.extractQuestions(ocrResult);
        
        // 调整题目ID以避免重复
        questions.forEach(q => {
          q.id = questionIdOffset++;
        });
        
        allQuestions.push(...questions);
        console.log(`图片 ${imageFile.name} 处理完成，识别到 ${questions.length} 道题目`);
      } catch (error) {
        console.error(`处理图片 ${imageFile.name} 时出错:`, error);
        throw error; // 重新抛出错误以便上层处理
      }
    }

    console.log(`批量处理完成，总共识别到 ${allQuestions.length} 道题目`);
    return allQuestions;
  }
}

export const ocrService = new OCRService();