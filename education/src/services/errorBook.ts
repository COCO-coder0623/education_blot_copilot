import { Question, GradingResult } from './openai';

export interface ErrorBookEntry {
  id: string;
  date: string;
  subject: string;
  topic: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  knowledgePoints: string[];
  commonMistakes?: string[];
  practiceQuestions?: string[];
  reviewCount: number;
  masteryLevel: 'needs_practice' | 'improving' | 'mastered';
  difficulty: 'easy' | 'medium' | 'hard';
  sourceAssignmentId: string;
  sourceAssignmentTitle: string;
}

class ErrorBookService {
  private storageKey = 'errorBook';

  // 获取所有错题
  getAllErrors(): ErrorBookEntry[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  // 添加错题到错题本
  addErrorsFromGrading(gradingResult: GradingResult): void {
    const existingErrors = this.getAllErrors();
    const newErrors: ErrorBookEntry[] = [];

    // 只添加错题
    gradingResult.questions
      .filter(q => !q.isCorrect)
      .forEach(question => {
        const errorEntry: ErrorBookEntry = {
          id: `${gradingResult.id}_${question.id}`,
          date: gradingResult.date,
          subject: gradingResult.subject,
          topic: this.extractTopicFromKnowledgePoints(question.knowledgePoints),
          question: question.question,
          studentAnswer: question.studentAnswer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          knowledgePoints: question.knowledgePoints,
          commonMistakes: question.commonMistakes,
          practiceQuestions: question.practiceQuestions,
          reviewCount: 0,
          masteryLevel: 'needs_practice',
          difficulty: question.difficulty,
          sourceAssignmentId: gradingResult.id,
          sourceAssignmentTitle: gradingResult.title
        };
        newErrors.push(errorEntry);
      });

    // 合并并保存
    const allErrors = [...existingErrors, ...newErrors];
    localStorage.setItem(this.storageKey, JSON.stringify(allErrors));
  }

  // 更新错题复习状态
  updateErrorReview(errorId: string): void {
    const errors = this.getAllErrors();
    const errorIndex = errors.findIndex(e => e.id === errorId);
    
    if (errorIndex !== -1) {
      errors[errorIndex].reviewCount += 1;
      
      // 根据复习次数更新掌握程度
      if (errors[errorIndex].reviewCount >= 3) {
        errors[errorIndex].masteryLevel = 'mastered';
      } else if (errors[errorIndex].reviewCount >= 1) {
        errors[errorIndex].masteryLevel = 'improving';
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(errors));
    }
  }

  // 按日期筛选错题
  getErrorsByDate(date: string): ErrorBookEntry[] {
    return this.getAllErrors().filter(error => error.date === date);
  }

  // 按学科筛选错题
  getErrorsBySubject(subject: string): ErrorBookEntry[] {
    return this.getAllErrors().filter(error => error.subject === subject);
  }

  // 按掌握程度筛选错题
  getErrorsByMasteryLevel(level: 'needs_practice' | 'improving' | 'mastered'): ErrorBookEntry[] {
    return this.getAllErrors().filter(error => error.masteryLevel === level);
  }

  // 获取错题统计
  getErrorStats() {
    const errors = this.getAllErrors();
    return {
      total: errors.length,
      needsPractice: errors.filter(e => e.masteryLevel === 'needs_practice').length,
      improving: errors.filter(e => e.masteryLevel === 'improving').length,
      mastered: errors.filter(e => e.masteryLevel === 'mastered').length,
      bySubject: this.groupBySubject(errors),
      byDate: this.groupByDate(errors)
    };
  }

  // 删除错题
  deleteError(errorId: string): void {
    const errors = this.getAllErrors().filter(e => e.id !== errorId);
    localStorage.setItem(this.storageKey, JSON.stringify(errors));
  }

  // 清空错题本
  clearAllErrors(): void {
    localStorage.removeItem(this.storageKey);
  }

  private extractTopicFromKnowledgePoints(knowledgePoints: string[]): string {
    return knowledgePoints[0] || '未知知识点';
  }

  private groupBySubject(errors: ErrorBookEntry[]) {
    return errors.reduce((acc, error) => {
      acc[error.subject] = (acc[error.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByDate(errors: ErrorBookEntry[]) {
    return errors.reduce((acc, error) => {
      acc[error.date] = (acc[error.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const errorBookService = new ErrorBookService();