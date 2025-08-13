import React, { useState } from 'react';
import { Target, Brain, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react';

const Practice: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('recommended');

  const categories = [
    { id: 'recommended', label: '智能推荐', icon: Brain },
    { id: 'weakness', label: '薄弱知识点', icon: Target },
    { id: 'review', label: '复习巩固', icon: CheckCircle }
  ];

  const recommendedPractice = [
    {
      id: 1,
      title: '二次函数最值专项练习',
      subject: '数学',
      difficulty: 'medium',
      questionCount: 15,
      estimatedTime: '25分钟',
      description: '针对你在二次函数最值计算中的错误，精选相关练习题',
      knowledgePoints: ['二次函数最值', '对称轴计算', '函数图像'],
      priority: 'high',
      completionRate: 0
    },
    {
      id: 2,
      title: '牛顿第二定律应用练习',
      subject: '物理',
      difficulty: 'medium',
      questionCount: 12,
      estimatedTime: '20分钟',
      description: '加强对力与加速度关系的理解和计算能力',
      knowledgePoints: ['牛顿第二定律', '力的计算', '加速度'],
      priority: 'medium',
      completionRate: 0
    },
    {
      id: 3,
      title: '现在完成时语法强化',
      subject: '英语',
      difficulty: 'easy',
      questionCount: 20,
      estimatedTime: '15分钟',
      description: '掌握现在完成时的构成和使用场景',
      knowledgePoints: ['现在完成时', '时态转换', '语法填空'],
      priority: 'medium',
      completionRate: 0
    }
  ];

  const weaknessTopics = [
    {
      id: 4,
      title: '化学方程式配平训练',
      subject: '化学',
      difficulty: 'hard',
      questionCount: 10,
      estimatedTime: '30分钟',
      description: '系统练习化学方程式配平的方法和技巧',
      knowledgePoints: ['化学方程式', '原子守恒', '配平技巧'],
      masteryLevel: 45,
      completionRate: 0
    },
    {
      id: 5,
      title: '三角函数性质综合',
      subject: '数学',
      difficulty: 'hard',
      questionCount: 18,
      estimatedTime: '35分钟',
      description: '深入理解三角函数的性质和图像变换',
      knowledgePoints: ['三角函数', '函数性质', '图像变换'],
      masteryLevel: 60,
      completionRate: 0
    }
  ];

  const reviewTopics = [
    {
      id: 6,
      title: '一元二次方程复习',
      subject: '数学',
      difficulty: 'easy',
      questionCount: 8,
      estimatedTime: '12分钟',
      description: '巩固已掌握的一元二次方程求解方法',
      knowledgePoints: ['一元二次方程', '因式分解', '求根公式'],
      lastPracticed: '3天前',
      completionRate: 100
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'low':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getCurrentPracticeList = () => {
    switch (selectedCategory) {
      case 'recommended':
        return recommendedPractice;
      case 'weakness':
        return weaknessTopics;
      case 'review':
        return reviewTopics;
      default:
        return recommendedPractice;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">智能练习推荐</h1>
        <p className="text-lg text-gray-600">基于你的错题分析，AI为你推荐最适合的练习内容</p>
      </div>

      {/* 类别选择 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 练习统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">推荐练习</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-600">平均正确率</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2.5h</div>
              <div className="text-sm text-gray-600">本周练习</div>
            </div>
          </div>
        </div>
      </div>

      {/* 练习列表 */}
      <div className="space-y-6">
        {getCurrentPracticeList().map((practice) => (
          <div
            key={practice.id}
            className={`rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
              practice.priority ? getPriorityColor(practice.priority) : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{practice.title}</h3>
                  {practice.priority === 'high' && (
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      重点推荐
                    </div>
                  )}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {practice.subject}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{practice.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(practice.difficulty)}`}>
                      {getDifficultyText(practice.difficulty)}
                    </span>
                    <span className="text-sm text-gray-600">{practice.questionCount}题</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{practice.estimatedTime}</span>
                  </div>
                  {practice.masteryLevel && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>掌握度:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${practice.masteryLevel}%` }}
                        ></div>
                      </div>
                      <span>{practice.masteryLevel}%</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {practice.knowledgePoints.map((point, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {point}
                    </span>
                  ))}
                </div>

                {practice.completionRate !== undefined && practice.completionRate > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${practice.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{practice.completionRate}% 完成</span>
                  </div>
                )}
              </div>

              <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <span>开始练习</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                {practice.completionRate === 100 && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <Star className="w-4 h-4" />
                    <span>已完成</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 学习提示 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">学习小贴士</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">高效练习建议</h3>
            <ul className="space-y-1 text-sm text-indigo-100">
              <li>• 优先完成红色标记的重点练习</li>
              <li>• 每次练习后及时复习错题</li>
              <li>• 保持每天至少30分钟练习时间</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">进步追踪</h3>
            <ul className="space-y-1 text-sm text-indigo-100">
              <li>• 定期查看知识点掌握度变化</li>
              <li>• 关注正确率提升趋势</li>
              <li>• 及时调整学习重点</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;