import React, { useState } from 'react';
import { User, Settings, Award, TrendingUp, Calendar, BookOpen } from 'lucide-react';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const userStats = {
    totalAssignments: 45,
    correctRate: 87,
    studyDays: 120,
    totalStudyTime: '156h',
    improvements: [
      { subject: '数学', before: 75, after: 87, change: '+12%' },
      { subject: '物理', before: 68, after: 82, change: '+14%' },
      { subject: '英语', before: 80, after: 89, change: '+9%' },
      { subject: '化学', before: 72, after: 78, change: '+6%' }
    ]
  };

  const achievements = [
    {
      id: 1,
      title: '学习新星',
      description: '连续7天完成学习任务',
      icon: '⭐',
      unlocked: true,
      date: '2025-01-10'
    },
    {
      id: 2,
      title: '错题终结者',
      description: '单日纠正10道错题',
      icon: '🎯',
      unlocked: true,
      date: '2025-01-08'
    },
    {
      id: 3,
      title: '数学达人',
      description: '数学正确率超过90%',
      icon: '🧮',
      unlocked: false,
      progress: 87
    },
    {
      id: 4,
      title: '持之以恒',
      description: '连续30天使用应用',
      icon: '🔥',
      unlocked: false,
      progress: 23
    }
  ];

  const recentActivity = [
    {
      date: '2025-01-11',
      type: 'assignment',
      content: '完成数学作业批改',
      score: 85
    },
    {
      date: '2025-01-11',
      type: 'practice',
      content: '练习二次函数专项',
      score: 78
    },
    {
      date: '2025-01-10',
      type: 'review',
      content: '复习物理错题',
      score: 92
    },
    {
      date: '2025-01-10',
      type: 'assignment',
      content: '完成英语语法练习',
      score: 89
    }
  ];

  const tabs = [
    { id: 'overview', label: '学习概况', icon: TrendingUp },
    { id: 'achievements', label: '成就徽章', icon: Award },
    { id: 'activity', label: '学习记录', icon: Calendar },
    { id: 'settings', label: '个人设置', icon: Settings }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 个人信息卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">小明同学</h1>
              <div className="space-y-1 text-blue-100">
                <p>初二年级 · 数学班</p>
                <p>加入时间：2024年8月</p>
                <p>学习天数：{userStats.studyDays}天</p>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-0 grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{userStats.correctRate}%</div>
              <div className="text-blue-100 text-sm">平均正确率</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{userStats.totalStudyTime}</div>
              <div className="text-blue-100 text-sm">总学习时长</div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 标签内容 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">学习概况</h2>
            
            {/* 学习统计 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">{userStats.totalAssignments}</div>
                <div className="text-gray-600">作业总数</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{userStats.correctRate}%</div>
                <div className="text-gray-600">平均正确率</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">{userStats.studyDays}</div>
                <div className="text-gray-600">学习天数</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{userStats.totalStudyTime}</div>
                <div className="text-gray-600">学习时长</div>
              </div>
            </div>

            {/* 进步情况 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">各科进步情况</h3>
              <div className="space-y-4">
                {userStats.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{improvement.subject}</h4>
                        <p className="text-sm text-gray-500">
                          {improvement.before}% → {improvement.after}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${improvement.after}%` }}
                        ></div>
                      </div>
                      <span className="text-green-600 font-medium text-sm">{improvement.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">成就徽章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    achievement.unlocked
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  
                  {achievement.unlocked ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">于 {achievement.date} 解锁</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>进度</span>
                        <span>{achievement.progress}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">最近学习记录</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{activity.content}</h4>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{activity.score}分</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      activity.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'practice' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {activity.type === 'assignment' ? '作业' :
                       activity.type === 'practice' ? '练习' : '复习'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">个人设置</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                  <input
                    type="text"
                    defaultValue="小明"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>初二</option>
                    <option>初一</option>
                    <option>初三</option>
                    <option>高一</option>
                    <option>高二</option>
                    <option>高三</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主修学科</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['数学', '物理', '化学', '英语', '语文', '生物', '历史', '地理'].map((subject) => (
                    <label key={subject} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked={['数学', '物理', '化学', '英语'].includes(subject)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;