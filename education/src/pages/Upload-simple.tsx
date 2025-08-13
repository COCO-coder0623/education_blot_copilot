import { useState, useRef } from 'react';
import { Upload as UploadIcon, File, X, CheckCircle, Eye, Zap } from 'lucide-react';

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file: File) => file.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleOneClickGrading = async () => {
    if (files.length === 0) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('🚀 开始一键批改...');
      
      // 模拟批改过程
      setUploadProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(75);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(100);
      
      // 显示成功信息
      setTimeout(() => {
        alert('批改完成！这是一个演示版本，实际功能需要配置API密钥。');
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (err) {
      console.error('批改失败:', err);
      setError('批改失败，请重试');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">上传作业</h1>
        <p className="text-lg text-gray-600">拖拽图片到下方区域，或点击选择文件</p>
      </div>

      {/* 上传区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <UploadIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                拖拽作业图片到这里
              </h3>
              <p className="text-gray-600 mb-4">支持 JPG、PNG、WEBP 格式，最大 10MB</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                选择文件
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            已选择文件 ({files.length})
          </h3>
          <div className="space-y-3 mb-6">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadProgress === 100 && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">批改进度</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 批改按钮 */}
          <div className="flex justify-end">
            <div className="flex space-x-4">
              <button
                onClick={handleOneClickGrading}
                disabled={uploading || files.length === 0}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>正在批改...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>一键批改</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">功能说明</h4>
        <ul className="space-y-2 text-blue-800">
          <li>• <strong>一键批改</strong>：自动完成图片识别+AI批改的完整流程，最简单快捷</li>
          <li>• 错题会自动添加到错题本，包含详细解析</li>
          <li>• 系统会分析知识薄弱点并推荐练习题</li>
          <li>• 确保图片清晰，题目和答案完整可见</li>
          <li>• 支持数学、语文、英语、物理、化学等多学科</li>
          <li>• 推荐使用<strong>一键批改</strong>功能，自动优化图片质量并完成全流程</li>
        </ul>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>注意</strong>：当前为演示版本。要使用完整功能，请在 .env 文件中配置 API 密钥：
            <br />• VITE_AZURE_VISION_ENDPOINT 和 VITE_AZURE_VISION_KEY (用于OCR)
            <br />• VITE_OPENAI_API_KEY (用于AI批改)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
