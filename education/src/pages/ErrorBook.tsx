import React, { useState } from 'react';
import { Calendar, Filter, BookOpen, Target, TrendingDown, Search } from 'lucide-react';
import { errorBookService } from '../services/errorBook';

const ErrorBook: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 从错题本服务获取数据
  const errorEntries = errorBookService.getAllErrors();
  const stats = errorBookService.getErrorStats();

  // 获取所有学科
  const subjects = ['全部', ...Array.from(new Set(errorEntries.map(e => e.subject)))];
  
  const filteredEntries = errorEntries.filter(entry => {
    const matchesDate = !selectedDate || entry.date === selectedDate;
    const matchesSubject = !selectedSubject || selectedSubject === '全部' || entry.subject === selectedSubject;
    const matchesSearch = !searchTerm || 
      entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.question.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesSubject && matchesSearch;
  });

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'mastered':
        return 'bg-green-100 text-green-800';
      case 'improving':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs_practice':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMasteryText = (level: string) => {
    switch (level) {
      case 'mastered':
        return '已掌握';
      case 'improving':
        return '进步中';
      case 'needs_practice':
        return '需练习';
      default:
        return '未知';
    }
  };

  // 处理错题复习
  const handlePracticeError = (errorId: string) => {
    errorBookService.updateErrorReview(errorId);
    // 强制重新渲染组件
    window.location.reload();
  };

  // 删除错题
  const handleDeleteError = (errorId: string) => {
    if (confirm('确定要删除这道错题吗？')) {
      errorBookService.deleteError(errorId);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的错题本</h1>
          <p className="text-gray-600">回顾错题，巩固知识，提升成绩</p>
        </div>
        
        {/* 统计卡片 */}
        <div className="mt-6 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">总错题</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.needsPractice}</div>
            <div className="text-sm text-gray-600">需练习</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.improving}</div>
            <div className="text-sm text-gray-600">进步中</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
            <div className="text-sm text-gray-600">已掌握</div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              选择日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              学科筛选
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              搜索题目
            </label>
            <input
              type="text"
              placeholder="搜索知识点或题目内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 错题列表 */}
      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无错题记录</h3>
            <p className="text-gray-500">根据当前筛选条件未找到相关错题</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{entry.topic}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{entry.subject}</span>
                      <span>•</span>
                      <span>{entry.date}</span>
                      <span>•</span>
                      <span>复习 {entry.reviewCount} 次</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMasteryColor(entry.masteryLevel)}`}>
                    {getMasteryText(entry.masteryLevel)}
                  </span>
                  <button 
                    onClick={() => handlePracticeError(entry.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    重新练习
                  </button>
                  <button 
                    onClick={() => handleDeleteError(entry.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">题目：</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{entry.question}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">你的答案：</h5>
                    <p className="bg-red-50 text-red-800 p-3 rounded-lg">{entry.studentAnswer}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">正确答案：</h5>
                    <p className="bg-green-50 text-green-800 p-3 rounded-lg">{entry.correctAnswer}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">详细解释：</h5>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{entry.explanation}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">相关知识点：</h5>
                  <div className="flex flex-wrap gap-2">
                    {entry.knowledgePoints.map((point, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 常见错误 */}
                {entry.commonMistakes && entry.commonMistakes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">常见错误：</h5>
                    <ul className="bg-red-50 p-4 rounded-lg space-y-1">
                      {entry.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="text-red-700 text-sm">• {mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 练习题推荐 */}
                {entry.practiceQuestions && entry.practiceQuestions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">推荐练习题：</h5>
                    <ul className="bg-green-50 p-4 rounded-lg space-y-1">
                      {entry.practiceQuestions.map((practice, idx) => (
                        <li key={idx} className="text-green-700 text-sm">{idx + 1}. {practice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 来源信息 */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  来源：{entry.sourceAssignmentTitle} | 复习次数：{entry.reviewCount}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 学习建议 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6" />
          <h2 className="text-xl font-semibold">学习建议</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">重点复习</h3>
            <ul className="space-y-1 text-sm text-purple-100">
              <li>• 重点关注"需练习"状态的错题</li>
              <li>• 定期回顾已掌握的知识点</li>
              <li>• 完成推荐的练习题</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">练习建议</h3>
            <ul className="space-y-1 text-sm text-purple-100">
              <li>• 每天复习3-5道错题</li>
              <li>• 利用GPT-4o的详细解析理解错误原因</li>
              <li>• 通过练习题巩固相关知识点</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBook;