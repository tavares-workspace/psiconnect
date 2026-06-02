import { statusLabel, statusClass } from '../utils/formatUtils';
export default function StatusBadge({ status }) {
  const cores = {
    scheduled: 'text-blue-600',
    completed:  'text-green-600',
    cancelled:  'text-gray-400',
  };
  return (
    <span className={`text-xs font-medium ${cores[status] || 'text-gray-400'}`}>
      {statusLabel(status)}
    </span>
  );
}
