import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { OCRDiagnostic, DiagnosticResult } from '../utils/ocrDiagnostic';

interface OCRDiagnosticPanelProps {
  file: File | null;
  onDiagnosticComplete?: (result: DiagnosticResult) => void;
}

export const OCRDiagnosticPanel: React.FC<OCRDiagnosticPanelProps> = ({ 
  file, 
  onDiagnosticComplete 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const runDiagnostic = async () => {
    if (!file) return;

    setIsRunning(true);
    setResult(null);

    try {
      const diagnostic = new OCRDiagnostic();
      const diagnosticResult = await diagnostic.fullDiagnostic(file);
      
      setResult(diagnosticResult);
      onDiagnosticComplete?.(diagnosticResult);
    } catch (error) {
      console.error('诊断失败:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!file) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        请先选择图片文件
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          OCR识别诊断
        </h3>
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? '诊断中...' : '开始诊断'}
        </button>
      </div>

      {isRunning && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">正在分析图片质量和OCR效果...</span>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* 图片质量评分 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📊 图片质量评估</h4>
            <div className="flex items-center space-x-4 mb-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.imageQuality.score)}`}>
                质量评分: {result.imageQuality.score}/100
              </div>
            </div>
            
            {result.imageQuality.issues.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">发现的问题:</p>
                <ul className="space-y-1">
                  {result.imageQuality.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* API响应结果 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">🤖 OCR API测试结果</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">状态</p>
                <p className={`font-medium ${result.apiResponse.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.apiResponse.success ? '成功' : '失败'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">响应时间</p>
                <p className="font-medium">{(result.apiResponse.responseTime / 1000).toFixed(1)}秒</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">识别置信度</p>
                <p className={`font-medium ${getConfidenceColor(result.apiResponse.confidence)}`}>
                  {result.apiResponse.confidence}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">识别文本长度</p>
                <p className="font-medium">{result.apiResponse.textLength} 字符</p>
              </div>
            </div>

            {result.apiResponse.errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">{result.apiResponse.errorMessage}</p>
              </div>
            )}
          </div>

          {/* 优化建议 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">💡 优化建议</h4>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* 高级信息 */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {showAdvanced ? '隐藏' : '显示'}详细技术信息
            </button>
            
            {showAdvanced && (
              <div className="mt-3 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">🔧 技术详情</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">原始图片</p>
                    <p>尺寸: {result.comparison.original.dimensions}</p>
                    <p>大小: {result.comparison.original.size}</p>
                    <p>格式: {result.comparison.original.format}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">优化后图片</p>
                    <p>尺寸: {result.comparison.optimized.dimensions}</p>
                    <p>大小: {result.comparison.optimized.size}</p>
                    <p>格式: {result.comparison.optimized.format}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{result.comparison.improvement}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>点击"开始诊断"来分析图片质量和OCR识别效果</p>
        </div>
      )}
    </div>
  );
};
