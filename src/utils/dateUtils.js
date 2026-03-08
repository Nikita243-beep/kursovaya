/** Локальная дата в формате YYYY-MM-DD */
export function toLocalDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Задача просрочена (срок в прошлом) */
export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

/** Колонка доски: 'today' | 'week' | 'later' */
export function getBoardColumnKey(task) {
  if (!task.dueDate) return 'later';
  const now = new Date();
  const due = new Date(task.dueDate);
  if (toLocalDateKey(now) === toLocalDateKey(due)) return 'today';
  const diffMs = due.getTime() - now.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  if (diffMs > 0 && diffMs <= oneWeek) return 'week';
  return 'later';
}
