import { useState, useEffect } from 'react';
import { useTasks } from '../context/TasksContext';

export default function RedistributeModal({ onClose }) {
  const { tasks: tasksFromContext, setTasks } = useTasks();
  const [tasks, setTasksLocal] = useState(tasksFromContext);

  useEffect(() => {
    setTasksLocal(tasksFromContext);
  }, [tasksFromContext]);

  const activeTasks = tasks.filter((t) => !t.isCompleted && Array.isArray(t.members) && t.members.length > 0);

  const setAssignee = (taskId, member) => {
    setTasksLocal((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, currentAssignee: member } : t
      )
    );
  };

  const handleSave = () => {
    setTasks(tasks);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="redistribute-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="redistribute-title">Перераспределение задач</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <p className="text-muted small mb-12">
          Выберите, кто выполняет каждую задачу сейчас. Ротация при отметке «Выполнено» продолжится от выбранного участника.
        </p>
        {activeTasks.length === 0 ? (
          <p className="text-muted">Нет активных задач с назначенными участниками.</p>
        ) : (
          <ul className="redistribute-list">
            {activeTasks.map((task) => (
              <li key={task.id} className="redistribute-item">
                <span className="redistribute-task-title">{task.title}</span>
                <select
                  className="input-select redistribute-select"
                  value={task.currentAssignee || task.members[0] || ''}
                  onChange={(e) => setAssignee(task.id, e.target.value)}
                >
                  {task.members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
