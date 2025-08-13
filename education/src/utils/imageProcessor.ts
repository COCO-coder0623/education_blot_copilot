/**
 * 图片处理工具类
 * 解决微软Computer Vision API识别效果差的问题
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  enableSharpening?: boolean;
  enableContrast?: boolean;
  enableDenoising?: boolean;
}

export class ImageProcessor {
  
  /**
   * 优化图片质量以提高OCR识别效果
   */
  static async optimizeForOCR(file: File, options: ImageProcessingOptions = {}): Promise<File> {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 0.95,
      format = 'jpeg',
      enableSharpening = true,
      enableContrast = true,
      enableDenoising = false
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // 计算优化后的尺寸
          const { width, height } = this.calculateOptimalSize(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          if (!ctx) {
            throw new Error('无法获取Canvas上下文');
          }

          // 启用图像平滑
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);

          // 应用图像增强
          if (enableContrast || enableSharpening) {
            this.applyImageEnhancements(ctx, width, height, {
              enableSharpening,
              enableContrast,
              enableDenoising
            });
          }

          // 转换为优化格式
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片处理失败'));
                return;
              }

              const optimizedFile = new File(
                [blob], 
                `optimized_${file.name}`, 
                { 
                  type: `image/${format}`,
                  lastModified: Date.now()
                }
              );

              console.log(`📸 图片优化完成:`, {
                原始大小: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                优化后大小: `${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`,
                原始尺寸: `${img.width}x${img.height}`,
                优化后尺寸: `${width}x${height}`,
                压缩比: `${((1 - optimizedFile.size / file.size) * 100).toFixed(1)}%`
              });

              resolve(optimizedFile);
            },
            `image/${format}`,
            quality
          );

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 计算最优尺寸
   */
  private static calculateOptimalSize(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ) {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // 如果图片太小，适当放大以提高识别效果
    if (width < 800 && height < 600) {
      const scale = Math.min(1200 / width, 900 / height);
      width *= scale;
      height *= scale;
    }

    // 如果图片太大，按比例缩放
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width *= scale;
      height *= scale;
    }

    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  /**
   * 应用图像增强效果
   */
  private static applyImageEnhancements(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    options: { enableSharpening: boolean; enableContrast: boolean; enableDenoising: boolean }
  ) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    if (options.enableContrast) {
      this.enhanceContrast(data);
    }

    if (options.enableSharpening) {
      this.applySharpeningFilter(imageData, width, height);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 增强对比度
   */
  private static enhanceContrast(data: Uint8ClampedArray, factor: number = 1.2) {
    for (let i = 0; i < data.length; i += 4) {
      // 对RGB通道应用对比度增强
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
    }
  }

  /**
   * 应用锐化滤镜
   */
  private static applySharpeningFilter(imageData: ImageData, width: number, height: number) {
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    // 锐化核
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB通道
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += tempData[px] * kernel[ky + 1][kx + 1];
            }
          }
          const px = (y * width + x) * 4 + c;
          data[px] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  }

  /**
   * 检查图片质量是否适合OCR
   */
  static async analyzeImageQuality(file: File): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // 检查分辨率
        const totalPixels = img.width * img.height;
        if (totalPixels < 300000) { // 少于30万像素
          issues.push('图片分辨率较低');
          recommendations.push('使用更高分辨率的相机或扫描仪');
          score -= 20;
        }

        // 检查宽高比
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 3 || aspectRatio < 0.3) {
          issues.push('图片宽高比异常');
          recommendations.push('确保图片比例正常，避免过度拉伸');
          score -= 15;
        }

        // 检查文件大小
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > 10) {
          issues.push('文件过大');
          recommendations.push('适当压缩图片以提高处理速度');
          score -= 10;
        } else if (sizeInMB < 0.1) {
          issues.push('文件过小可能影响清晰度');
          recommendations.push('使用更高质量的图片');
          score -= 15;
        }

        resolve({
          score: Math.max(0, score),
          issues,
          recommendations
        });
      };

      img.onerror = () => {
        resolve({
          score: 0,
          issues: ['无法加载图片'],
          recommendations: ['请检查图片格式是否正确']
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 转换为高质量的ArrayBuffer（用于API调用）
   */
  static async toHighQualityArrayBuffer(file: File): Promise<ArrayBuffer> {
    // 先优化图片
    const optimizedFile = await this.optimizeForOCR(file, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.95,
      format: 'jpeg',
      enableSharpening: true,
      enableContrast: true
    });

    // 转换为ArrayBuffer
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(optimizedFile);
    });
  }

  /**
   * 获取图片的EXIF信息和建议
   */
  static async getImageMetadata(file: File): Promise<{
    filename: string;
    size: string;
    type: string;
    lastModified: string;
    recommendations: string[];
  }> {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const recommendations: string[] = [];

    // 检查文件格式
    if (!file.type.startsWith('image/')) {
      recommendations.push('⚠️ 请确保上传的是图片文件');
    } else if (file.type === 'image/gif') {
      recommendations.push('💡 GIF格式可能影响识别效果，建议使用JPG或PNG');
    }

    // 检查文件名
    if (file.name.includes('screenshot') || file.name.includes('截图')) {
      recommendations.push('📸 截图质量可能不如直接拍照，建议使用相机拍摄');
    }

    return {
      filename: file.name,
      size: `${sizeInMB}MB`,
      type: file.type || '未知',
      lastModified: new Date(file.lastModified).toLocaleString(),
      recommendations
    };
  }
}
