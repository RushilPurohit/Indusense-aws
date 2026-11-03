import React from 'react';
import { WifiOff, RefreshCw, AlertOctagon } from 'lucide-react';

interface ErrorBannerProps {
  mode: 'unreachable' | 'error' | 'demo';
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  mode,
  message,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  if (mode === 'unreachable') {
    return (
      <div
        className={`bg-rose-50 border-b border-rose-300 px-4 py-3 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center gap-3 min-w-0">
          <WifiOff className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Backend unreachable (/api).</span>{' '}
            <span className="text-rose-800">
              {message ||
                'Running in offline demo observation mode. Do not use these results for live maintenance decisions.'}
            </span>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 rounded text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 transition-colors shadow-sm shrink-0 min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Reconnecting...' : 'Retry Connection'}</span>
          </button>
        )}
      </div>
    );
  }

  if (mode === 'demo') {
    return (
      <div
        className={`bg-amber-50 border-b border-amber-300 px-4 py-2.5 text-amber-900 flex items-center justify-between gap-3 text-xs ${className}`}
        role="status"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>
            <strong>Demo Data Mode:</strong> Displaying simulated equipment scenarios for research evaluation.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-rose-50 border-b border-rose-200 px-4 py-3 text-rose-900 flex items-center justify-between gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
        <span className="text-xs sm:text-sm font-medium">{message || 'An unexpected error occurred.'}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
