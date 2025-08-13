import { GradingResult } from './openai';

class GradingHistoryService {
  private storageKey = 'gradingHistory';

  // 保存批改结果
  saveGradingResult(result: GradingResult): void {
    const history = this.getAllResults();
    history.unshift(result); // 添加到开头
    
    // 限制历史记录数量（最多保存100条）
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(history));
  }

  // 获取所有批改结果
  getAllResults(): GradingResult[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // 根据ID获取批改结果
  getResultById(id: string): GradingResult | null {
    const results = this.getAllResults();
    return results.find(r => r.id === id) || null;
  }

  // 获取最近的批改结果
  getRecentResults(limit: number = 10): GradingResult[] {
    return this.getAllResults().slice(0, limit);
  }

  // 按学科筛选
  getResultsBySubject(subject: string): GradingResult[] {
    return this.getAllResults().filter(r => r.subject === subject);
  }

  // 按日期范围筛选
  getResultsByDateRange(startDate: string, endDate: string): GradingResult[] {
    return this.getAllResults().filter(r => 
      r.date >= startDate && r.date <= endDate
    );
  }

  // 获取统计数据
  getStats() {
    const results = this.getAllResults();
    const totalAssignments = results.length;
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + (r.score / r.maxScore * 100), 0) / results.length 
      : 0;

    return {
      totalAssignments,
      totalQuestions,
      totalCorrect,
      averageScore: Math.round(averageScore),
      correctRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      subjectStats: this.getSubjectStats(results),
      recentTrend: this.getRecentTrend(results)
    };
  }

  // 删除批改结果
  deleteResult(id: string): void {
    const results = this.getAllResults().filter(r => r.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(results));
  }

  private getSubjectStats(results: GradingResult[]) {
    const subjectMap = new Map<string, { count: number; totalScore: number; maxScore: number }>();
    
    results.forEach(result => {
      const existing = subjectMap.get(result.subject) || { count: 0, totalScore: 0, maxScore: 0 };
      existing.count += 1;
      existing.totalScore += result.score;
      existing.maxScore += result.maxScore;
      subjectMap.set(result.subject, existing);
    });

    const stats: Record<string, { count: number; averageScore: number }> = {};
    subjectMap.forEach((value, subject) => {
      stats[subject] = {
        count: value.count,
        averageScore: Math.round((value.totalScore / value.maxScore) * 100)
      };
    });

    return stats;
  }

  private getRecentTrend(results: GradingResult[]) {
    const recent = results.slice(0, 10).reverse(); // 最近10次，按时间正序
    return recent.map(r => ({
      date: r.date,
      score: Math.round((r.score / r.maxScore) * 100)
    }));
  }
}

export const gradingHistoryService = new GradingHistoryService();