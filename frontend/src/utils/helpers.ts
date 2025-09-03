export const formatSalary = (salary: string): string => {
  if (!salary || salary === 'Not specified') {
    return 'Salary not specified';
  }
  return salary;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getJobTypeColor = (type: string): string => {
  const colors = {
    'Full-time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Contract': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Remote': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Internship': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};