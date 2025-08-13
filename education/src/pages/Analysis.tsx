import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Lightbulb, BookOpen, ArrowLeft, Star } from 'lucide-react';
import { gradingHistoryService } from '../services/gradingHistory';
import { errorBookService } from '../services/errorBook';

const Analysis: React.FC = () => {
  const { id } = useParams();
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // 从历史记录中获取分析数据
  const analysis = id ? gradingHistoryService.getResultById(id) : null;

  // 处理错题复习
  const handleReviewError = (questionId: number) => {
    if (analysis) {
      const errorId = `${analysis.id}_${questionId}`;
      errorBookService.updateErrorReview(errorId);
      // 可以添加一些UI反馈
    }
  };

  if (!analysis) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">未找到分析结果</h3>
          <p className="text-gray-500">请检查链接是否正确或重新上传作业</p>
        </div>
      </div>
    );
  }

  const percentageScore = Math.round((analysis.score / analysis.maxScore) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 返回按钮 */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>

      {/* 分析概览 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{analysis.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span>{analysis.subject}</span>
              <span>•</span>
              <span>{analysis.date}</span>
              <span>•</span>
              <span>GPT-4o智能批改</span>
            </div>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="text-4xl font-bold text-blue-600 mb-1">{percentageScore}分</div>
            <div className="text-gray-600">
              {analysis.correctAnswers}/{analysis.totalQuestions} 题正确 ({analysis.score}/{analysis.maxScore}分)
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${percentageScore}%` }}
          ></div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analysis.correctAnswers}</div>
            <div className="text-green-700 text-sm">答对题目</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {analysis.totalQuestions - analysis.correctAnswers}
            </div>
            <div className="text-red-700 text-sm">答错题目</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysis.totalQuestions}</div>
            <div className="text-blue-700 text-sm">总题数</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{percentageScore}%</div>
            <div className="text-purple-700 text-sm">正确率</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 题目详解 */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">题目详解</h2>
          {analysis.questions.map((q, index) => (
            <div
              key={q.id}
              className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
                selectedQuestion === q.id ? 'border-blue-300 shadow-md' : 'border-gray-200'
              }`}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-700">第{index + 1}题</span>
                      {q.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{q.points}/{q.maxPoints}分</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">题目：</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{q.question}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">你的答案：</h5>
                    <p className={`p-3 rounded-lg ${
                      q.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {q.studentAnswer}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">正确答案：</h5>
                    <p className="bg-blue-50 text-blue-800 p-3 rounded-lg">{q.correctAnswer}</p>
                  </div>
                </div>

                {selectedQuestion === q.id && (
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    {/* 详细解释 */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h5 className="font-semibold text-gray-900">详细解释</h5>
                      </div>
                      <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">{q.explanation}</p>
                    </div>

                    {/* 知识点 */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">涉及知识点</h5>
                      <div className="flex flex-wrap gap-2">
                        {q.knowledgePoints.map((point, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 常见错误（仅错题显示） */}
                    {!q.isCorrect && q.commonMistakes && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">常见错误</h5>
                        <ul className="bg-red-50 p-4 rounded-lg space-y-1">
                          {q.commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="text-red-700 text-sm">• {mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 练习题推荐（仅错题显示） */}
                    {!q.isCorrect && q.practiceQuestions && q.practiceQuestions.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">推荐练习题</h5>
                        <div className="bg-green-50 p-4 rounded-lg space-y-2">
                          {q.practiceQuestions.map((practice, idx) => (
                            <div key={idx} className="text-green-700 text-sm">
                              {idx + 1}. {practice}
                            </div>
                          ))}
                          <button
                            onClick={() => handleReviewError(q.id)}
                            className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                          >
                            标记为已复习
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 薄弱点分析 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">学习分析</h2>
          
          {/* 薄弱知识点 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">需要加强</h3>
            </div>
            {analysis.weaknessAnalysis.weakPoints.map((weak, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{weak.topic}</h4>
                  <span className="text-sm text-red-600 font-medium">掌握度 {weak.mastery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${weak.mastery}%` }}
                  ></div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-2">学习建议：</h5>
                  <ul className="space-y-1">
                    {weak.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-red-700 text-sm">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* 优势分析 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">掌握较好</h3>
            </div>
            <ul className="space-y-2">
              {analysis.weaknessAnalysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 行动建议 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">下一步行动</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>重点复习薄弱知识点</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>完成推荐的练习题</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>定期回顾错题本</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;