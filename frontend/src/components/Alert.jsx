export default function Alert({ type = 'error', message }) {
  if (!message) return null;
  const cor = {
    error:   'text-red-600 border-red-200',
    success: 'text-green-700 border-green-200',
    info:    'text-gray-600 border-gray-200',
  };
  return (
    <div className={`border-l-2 pl-3 py-1.5 text-sm mb-4 ${cor[type]}`}>
      {message}
    </div>
  );
}
