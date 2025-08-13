/**
 * OCR诊断和测试工具
 * 帮助分析微软Computer Vision API识别效果差的具体原因
 */

import { ocrService } from '../services/ocr';
import { ImageProcessor } from './imageProcessor';

export interface DiagnosticResult {
  imageQuality: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  apiResponse: {
    success: boolean;
    responseTime: number;
    confidence: number;
    textLength: number;
    wordCount: number;
    errorMessage?: string;
  };
  comparison: {
    original: {
      size: string;
      dimensions: string;
      format: string;
    };
    optimized: {
      size: string;
      dimensions: string;
      format: string;
    };
    improvement: string;
  };
  suggestions: string[];
}

export class OCRDiagnostic {
  /**
   * 完整的OCR诊断
   */
  async fullDiagnostic(file: File): Promise<DiagnosticResult> {
    console.log('🔍 开始OCR全面诊断...');

    const startTime = Date.now();
    const result: DiagnosticResult = {
      imageQuality: { score: 0, issues: [], recommendations: [] },
      apiResponse: { success: false, responseTime: 0, confidence: 0, textLength: 0, wordCount: 0 },
      comparison: {
        original: { size: '', dimensions: '', format: '' },
        optimized: { size: '', dimensions: '', format: '' },
        improvement: ''
      },
      suggestions: []
    };

    try {
      // 1. 分析原始图片质量
      console.log('📊 分析图片质量...');
      result.imageQuality = await ImageProcessor.analyzeImageQuality(file);
      
      // 2. 获取原始图片信息
      const originalInfo = await this.getImageInfo(file);
      result.comparison.original = originalInfo;

      // 3. 优化图片并获取信息
      console.log('🛠️ 优化图片...');
      const optimizedFile = await ImageProcessor.optimizeForOCR(file);
      const optimizedInfo = await this.getImageInfo(optimizedFile);
      result.comparison.optimized = optimizedInfo;
      
      // 4. 计算改进程度
      const originalSize = file.size;
      const optimizedSize = optimizedFile.size;
      const sizeChange = ((optimizedSize - originalSize) / originalSize * 100).toFixed(1);
      result.comparison.improvement = `尺寸变化: ${sizeChange}%`;

      // 5. 测试OCR API
      console.log('🤖 测试OCR API...');
      const apiStartTime = Date.now();
      
      try {
        const ocrResult = await ocrService.recognizeImage(optimizedFile);
        const apiEndTime = Date.now();
        
        result.apiResponse = {
          success: true,
          responseTime: apiEndTime - apiStartTime,
          confidence: ocrResult.confidence,
          textLength: ocrResult.text.length,
          wordCount: ocrResult.words.length
        };

        console.log('✅ OCR测试成功:', result.apiResponse);

      } catch (error) {
        const apiEndTime = Date.now();
        result.apiResponse = {
          success: false,
          responseTime: apiEndTime - apiStartTime,
          confidence: 0,
          textLength: 0,
          wordCount: 0,
          errorMessage: error instanceof Error ? error.message : '未知错误'
        };

        console.error('❌ OCR测试失败:', error);
      }

      // 6. 生成建议
      result.suggestions = this.generateSuggestions(result);

      const totalTime = Date.now() - startTime;
      console.log(`🏁 诊断完成，总耗时: ${totalTime}ms`);

      return result;

    } catch (error) {
      console.error('诊断过程出错:', error);
      result.suggestions = [
        '诊断过程中发生错误',
        '请检查图片文件是否有效',
        '请检查网络连接是否正常'
      ];
      return result;
    }
  }

  /**
   * 快速测试不同的图片优化参数
   */
  async testOptimizationParameters(file: File): Promise<Array<{
    config: string;
    result: { success: boolean; confidence: number; textLength: number; error?: string };
  }>> {
    const testConfigs = [
      { name: '原始图片', options: null },
      { name: '标准优化', options: { maxWidth: 2048, quality: 0.95, enableSharpening: true } },
      { name: '高分辨率', options: { maxWidth: 3000, quality: 0.98, enableSharpening: true } },
      { name: '高对比度', options: { maxWidth: 2048, quality: 0.95, enableContrast: true, enableSharpening: true } },
      { name: '低压缩', options: { maxWidth: 2048, quality: 1.0, enableSharpening: false } }
    ];

    const results = [];

    for (const config of testConfigs) {
      console.log(`🧪 测试配置: ${config.name}`);
      
      try {
        let testFile = file;
        if (config.options) {
          testFile = await ImageProcessor.optimizeForOCR(file, config.options);
        }

        const ocrResult = await ocrService.recognizeImage(testFile);
        
        results.push({
          config: config.name,
          result: {
            success: true,
            confidence: ocrResult.confidence,
            textLength: ocrResult.text.length
          }
        });

      } catch (error) {
        results.push({
          config: config.name,
          result: {
            success: false,
            confidence: 0,
            textLength: 0,
            error: error instanceof Error ? error.message : '未知错误'
          }
        });
      }

      // 避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * 获取图片基本信息
   */
  private async getImageInfo(file: File): Promise<{ size: string; dimensions: string; format: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          dimensions: `${img.width}x${img.height}`,
          format: file.type || '未知'
        });
      };
      img.onerror = () => {
        resolve({
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          dimensions: '未知',
          format: file.type || '未知'
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(diagnostic: DiagnosticResult): string[] {
    const suggestions: string[] = [];

    // 基于图片质量分析的建议
    if (diagnostic.imageQuality.score < 70) {
      suggestions.push('🖼️ 图片质量较差，建议使用更清晰的照片');
      suggestions.push('📷 尝试在光线充足的环境下重新拍照');
      suggestions.push('🔍 确保文字清晰可见，没有模糊或反光');
    }

    // 基于API响应的建议
    if (!diagnostic.apiResponse.success) {
      if (diagnostic.apiResponse.errorMessage?.includes('API密钥')) {
        suggestions.push('🔑 请检查微软Azure Computer Vision API密钥配置');
        suggestions.push('🌐 确认API终结点地址正确');
      } else if (diagnostic.apiResponse.errorMessage?.includes('网络')) {
        suggestions.push('🌐 检查网络连接，确保能访问Azure服务');
      } else if (diagnostic.apiResponse.errorMessage?.includes('图片')) {
        suggestions.push('📷 尝试使用不同格式的图片（JPG/PNG）');
        suggestions.push('📏 确保图片大小在4MB以内');
      }
    } else {
      // API调用成功但效果不好的建议
      if (diagnostic.apiResponse.confidence < 70) {
        suggestions.push('⚡ 识别置信度较低，建议优化图片质量');
        suggestions.push('🔧 尝试调整图片对比度和清晰度');
      }
      
      if (diagnostic.apiResponse.textLength < 50) {
        suggestions.push('📝 识别到的文本较少，可能需要：');
        suggestions.push('  • 确保图片包含足够的文字内容');
        suggestions.push('  • 调整拍摄角度，避免文字倾斜');
        suggestions.push('  • 检查是否有遮挡或阴影');
      }

      if (diagnostic.apiResponse.responseTime > 10000) {
        suggestions.push('⏱️ API响应较慢，建议减小图片大小');
      }
    }

    // 基于文件大小的建议
    const originalSizeMB = parseFloat(diagnostic.comparison.original.size);
    if (originalSizeMB > 5) {
      suggestions.push('📦 图片文件较大，建议压缩以提高处理速度');
    } else if (originalSizeMB < 0.5) {
      suggestions.push('🔍 图片文件较小，可能分辨率不足，建议使用更高质量的图片');
    }

    // 基于优化效果的建议
    if (suggestions.length === 0) {
      suggestions.push('✅ 图片质量良好，OCR识别效果应该不错');
      suggestions.push('💡 如果仍有问题，可能是图片内容复杂或手写字迹识别困难');
    }

    return suggestions;
  }

  /**
   * 比较不同OCR服务的效果
   */
  async compareOCRServices(file: File): Promise<{
    microsoft: { success: boolean; confidence: number; textLength: number; time: number };
    // 可以添加其他OCR服务的比较
  }> {
    const results = {
      microsoft: { success: false, confidence: 0, textLength: 0, time: 0 }
    };

    // 测试微软OCR
    try {
      const startTime = Date.now();
      const ocrResult = await ocrService.recognizeImage(file);
      const endTime = Date.now();
      
      results.microsoft = {
        success: true,
        confidence: ocrResult.confidence,
        textLength: ocrResult.text.length,
        time: endTime - startTime
      };
    } catch (error) {
      console.error('微软OCR测试失败:', error);
    }

    return results;
  }
}
