export function formatDateBR(date) {
  if (!date) return '—';
  if (typeof date === 'string' && date.includes('T')) {
    const [year, month, day] = date.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
  if (typeof date === 'string' && date.includes('-')) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  return new Date(date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'America/Sao_Paulo' });
}

export function formatDateTimeBR(date) {
  if (!date) return '—';
  // banco retorna string pura "2026-05-27T11:00:00" — formata direto sem converter timezone
  if (typeof date === 'string' && date.includes('T')) {
    const [datePart, timePart] = date.split('T');
    const [year, month, day]   = datePart.split('-');
    const [hour, minute]       = timePart.split(':');
    return `${day}/${month}/${year}, ${hour}:${minute}`;
  }
  return new Date(date).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' });
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
  // banco retorna string pura ex: "2026-05-27T11:00:00"
  if (typeof date === 'string') return date.slice(0, 16);
  return date.toISOString().slice(0, 16);
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}
