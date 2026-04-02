export function formatDateBR(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'UTC' });
}

export function formatDateTimeBR(date) {
  if (!date) return '—';
  return new Date(date).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export function formatTimeBR(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}

export function formatPhone(phone) {
  if (!phone) return '—';
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return phone;
}

export function statusLabel(status) {
  const map = { scheduled:'Agendada', completed:'Realizada', cancelled:'Cancelada' };
  return map[status] || status;
}

export function statusClass(status) {
  const map = { scheduled:'badge-scheduled', completed:'badge-completed', cancelled:'badge-cancelled' };
  return map[status] || 'badge-scheduled';
}

export function toInputDatetime(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 16);
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}
