import { statusLabel, statusClass } from '../utils/formatUtils';
export default function StatusBadge({ status }) {
  const dots = { scheduled: 'bg-blue-500', completed: 'bg-green-500', cancelled: 'bg-red-500' };
  return (
    <span className={statusClass(status)}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`} />
      {statusLabel(status)}
    </span>
  );
}
