const TYPE_STYLES = {
  success: 'bg-green-800 border-green-600 text-green-100',
  error:   'bg-red-900 border-red-600 text-red-100',
  warn:    'bg-yellow-800 border-yellow-600 text-yellow-100',
  info:    'bg-gray-800 border-gray-600 text-gray-100',
};

const ICONS = {
  success: '✓',
  error:   '✕',
  warn:    '⚠',
  info:    'ℹ',
};

export const ToastContainer = ({ toasts, dismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto animate-slide-in ${TYPE_STYLES[t.type] || TYPE_STYLES.info}`}
        >
          <span className="font-bold text-sm flex-shrink-0 mt-0.5">{ICONS[t.type] || 'ℹ'}</span>
          <span className="text-sm flex-1 leading-relaxed">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-sm ml-1"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
