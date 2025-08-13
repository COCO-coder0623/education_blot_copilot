import React from 'react';
import { Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { ExtractedQuestion } from '../services/ocr';

interface QuestionDisplayProps {
  questions: ExtractedQuestion[];
  onQuestionUpdate: (questionId: number, updates: Partial<ExtractedQuestion>) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ questions, onQuestionUpdate }) => {
  const handleQuestionEdit = (questionId: number, field: keyof ExtractedQuestion, value: any) => {
    onQuestionUpdate(questionId, { [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">OCR识别结果</h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
          识别到 {questions.length} 道题目
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  题目 {question.questionNumber || (index + 1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  question.confidence >= 80 ? 'bg-green-100 text-green-800' :
                  question.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  置信度 {question.confidence}%
                </span>
              </div>
              <Edit3 className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4">
              {/* 题目内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">题目内容：</label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => handleQuestionEdit(question.id, 'questionText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="请输入题目内容..."
                />
              </div>

              {/* 选择题选项 */}
              {question.options && question.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选项：</label>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600 w-6">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options!];
                            newOptions[optionIndex] = e.target.value;
                            handleQuestionEdit(question.id, 'options', newOptions);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`选项 ${String.fromCharCode(65 + optionIndex)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 学生答案 */}
              {question.studentAnswer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">学生答案：</label>
                  <input
                    type="text"
                    value={question.studentAnswer}
                    onChange={(e) => handleQuestionEdit(question.id, 'studentAnswer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="学生的答案..."
                  />
                </div>
              )}

              {/* 识别质量提示 */}
              <div className="flex items-center space-x-2 text-sm">
                {question.confidence >= 80 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">识别质量良好</span>
                  </>
                ) : question.confidence >= 60 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700">识别质量一般，建议检查</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">识别质量较差，请仔细检查</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">使用说明</h4>
        <ul className="space-y-1 text-blue-800 text-sm">
          <li>• 请仔细检查OCR识别的题目内容是否准确</li>
          <li>• 可以直接编辑题目文本和选项内容</li>
          <li>• 置信度低的题目建议重点检查</li>
          <li>• 确认无误后可进行AI智能批改</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionDisplay;