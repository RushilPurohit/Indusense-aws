import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const formatTimeAgo = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
};

export const formatNumber = (num: number, decimals = 2) => {
  return num.toFixed(decimals);
};
