function formatLastCompleted(isoOrString) {
  try {
    const d = new Date(isoOrString);
    if (Number.isNaN(d.getTime())) return isoOrString;
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoOrString;
  }
}

import { isOverdue } from '../utils/dateUtils';

export default function TaskCard({ task, onComplete, onArchive, onRestore, onEdit }) {
  const overdue = isOverdue(task.dueDate);

  return (
    <div className={`task-card ${overdue ? 'task-card-overdue' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-card-header-badges">
          {overdue && (
            <span className="task-difficulty task-difficulty-overdue">Просрочено</span>
          )}
          <span className="assignee-pill">
            Сейчас: <span>{task.currentAssignee}</span>
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description text-muted">{task.description}</p>
      )}

      <div className="task-card-meta">
        {task.dueDate && (
          <span className="task-due">
            Срок: {new Date(task.dueDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        )}
        {task.difficulty && !overdue && (
          <span className={`task-difficulty task-difficulty-${task.difficulty}`}>
            {task.difficulty === 'easy' ? 'Лёгкая' : task.difficulty === 'hard' ? 'Сложная' : 'Средняя'}
          </span>
        )}
      </div>

      {task.lastCompleted && (
        <p className="last-completed">
          Последнее выполнение: {formatLastCompleted(task.lastCompleted)}
        </p>
      )}

      {Array.isArray(task.members) && task.members.length > 0 && (
        <p className="task-rotation text-muted">
          Ротация между: {task.members.join(', ')}
        </p>
      )}

      <div className="task-actions">
        {!task.isCompleted && (
          <>
            <button onClick={onComplete} className="btn btn-success">
              Выполнено
            </button>
            <button onClick={onArchive} className="btn btn-secondary">
              Завершить задачу
            </button>
          </>
        )}
        {task.isCompleted && onRestore && (
          <button onClick={onRestore} className="btn btn-success">
            Вернуть в активные
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} type="button" className="btn btn-secondary">
            Редактировать
          </button>
        )}
      </div>
    </div>
  );
}