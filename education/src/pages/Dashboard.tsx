import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { gradingHistoryService } from '../services/gradingHistory';
import { errorBookService } from '../services/errorBook';

const Dashboard: React.FC = () => {
  // 获取真实数据
  const gradingStats = gradingHistoryService.getStats();
  const errorStats = errorBookService.getErrorStats();
  const recentResults = gradingHistoryService.getRecentResults(3);

  const stats = [
    {
      label: '总作业数',
      value: gradingStats.totalAssignments.toString(),
      change: '+' + Math.max(0, gradingStats.totalAssignments - 10),
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: '错题总数',
      value: errorStats.total.toString(),
      change: errorStats.needsPractice > 0 ? `${errorStats.needsPractice}需练习` : '全部掌握',
      icon: AlertCircle,
      color: 'bg-red-500'
    },
    {
      label: '平均正确率',
      value: `${gradingStats.correctRate}%`,
      change: gradingStats.correctRate > 80 ? '优秀' : '需提升',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      label: '平均分数',
      value: `${gradingStats.averageScore}分`,
      change: gradingStats.averageScore > 85 ? '优秀' : '良好',
      icon: Clock,
      color: 'bg-purple-500'
    }
  ];

  // 获取薄弱知识点
  const weakPoints = errorBookService.getErrorsByMasteryLevel('needs_practice')
    .slice(0, 4)
    .map(error => ({
      topic: error.topic,
      subject: error.subject,
      level: error.reviewCount === 0 ? 'high' : 'medium'
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">欢迎回来，小明！</h1>
        <p className="text-blue-100 mb-6">继续你的学习之旅，让AI助手帮你提升成绩</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          <span>上传新作业</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 最近分析 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">最近批改 (GPT-4o)</h2>
              <Link to="/errorbook" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                查看全部
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentResults.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">暂无批改记录，请先上传作业</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center space-x-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>上传作业</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              recentResults.map((item) => {
                const percentageScore = Math.round((item.score / item.maxScore) * 100);
                const errorCount = item.totalQuestions - item.correctAnswers;
                
                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">{item.subject}</span>
                      <span className="text-sm text-gray-500">{item.date}</span>
                      <span className="text-sm text-blue-600">GPT-4o批改</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{percentageScore}分</div>
                    <div className="text-sm text-red-600">{errorCount}道错题</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentageScore}%` }}
                    ></div>
                  </div>
                  <Link
                    to={`/analysis/${item.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
                );
              })
            )}
          </div>
        </div>

        {/* 薄弱知识点 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">薄弱知识点</h2>
              <Link to="/errorbook" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                开始练习
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {weakPoints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无薄弱知识点</p>
                <p className="text-sm text-gray-400 mt-1">继续保持！</p>
              </div>
            ) : (
              weakPoints.map((point, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{point.topic}</h4>
                  <p className="text-sm text-gray-500">{point.subject}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  point.level === 'high' ? 'bg-red-100 text-red-700' :
                  point.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {point.level === 'high' ? '需重点加强' :
                   point.level === 'medium' ? '需要练习' : '基本掌握'}
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;