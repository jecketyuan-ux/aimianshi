import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  }
  return `${mins}分钟`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  
  return formatDate(d);
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'text-success-600 bg-success-50';
    case 'medium':
      return 'text-warning-600 bg-warning-50';
    case 'hard':
      return 'text-error-600 bg-error-50';
    default:
      return 'text-secondary-600 bg-secondary-50';
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '简单';
    case 'medium':
      return '中等';
    case 'hard':
      return '困难';
    default:
      return difficulty;
  }
}

export function getInterviewTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'technical': '技术面试',
    'behavioral': '行为面试',
    'system-design': '系统设计',
    'coding': '编程面试',
    'full-stack': '全栈面试',
    'phone-screen': '电话筛选',
    'onsite': '现场面试',
  };
  return labels[type] || type;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'algorithms': '算法',
    'data-structures': '数据结构',
    'system-design': '系统设计',
    'behavioral': '行为问题',
    'database': '数据库',
    'web-development': 'Web开发',
    'mobile-development': '移动开发',
    'machine-learning': '机器学习',
    'devops': 'DevOps',
    'networking': '网络',
    'security': '安全',
  };
  return labels[category] || category;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-warning-600';
  return 'text-error-600';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  return new Promise((resolve, reject) => {
    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('密码长度至少6位');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码需要包含至少一个大写字母');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码需要包含至少一个小写字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码需要包含至少一个数字');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getProgrammingLanguageIcon(language: string): string {
  const icons: Record<string, string> = {
    'javascript': '⚡',
    'typescript': '🔷',
    'python': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'go': '🐹',
    'rust': '🦀',
    'csharp': '🔷',
    'php': '🐘',
    'ruby': '💎',
    'swift': '🍎',
    'kotlin': '🎯',
  };
  return icons[language] || '📝';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}