import { useEffect, useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useTasks } from '../context/TasksContext';
import { toLocalDateKey } from '../utils/dateUtils';

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // 1–7, где 1 — понедельник
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1));
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysInMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return d.getDate();
}

/** Воскресенье = 0, понедельник = 1, ... суббота = 6 */
function getWeekday(date) {
  return new Date(date).getDay();
}

export default function Calendar() {
  const { members } = useFamily();
  const { tasks } = useTasks();
  const [view, setView] = useState('week');
  const [selectedMember, setSelectedMember] = useState('all');
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const baseDate = startOfWeek(now);
  let days = [];
  if (view === 'day') {
    days = [new Date(now.getFullYear(), now.getMonth(), now.getDate())];
  } else if (view === 'month') {
    const monthStart = startOfMonth(now);
    monthStart.setMonth(monthStart.getMonth() + monthOffset);
    const count = daysInMonth(monthStart);
    days = Array.from({ length: count }, (_, i) => addDays(new Date(monthStart), i));
  } else {
    days = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i));
  }

  const activeTasks = tasks.filter((t) => !t.isCompleted);

  const filteredTasks = activeTasks.filter((task) => {
    if (selectedMember !== 'all') {
      if (!Array.isArray(task.members) || !task.members.includes(selectedMember)) {
        return false;
      }
      // Показывать только задачи, где сейчас очередь выбранного участника
      if (task.currentAssignee !== selectedMember) {
        return false;
      }
    }
    return true;
  });

  const tasksWithoutDate = filteredTasks.filter((t) => !t.dueDate || !t.dueDate.trim());

  const tasksByDate = days.reduce((acc, day) => {
    const key = toLocalDateKey(day);
    acc[key] = [];
    filteredTasks.forEach((task) => {
      const repeat = task.repeat || 'none';
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      const taskDateKey = taskDate ? toLocalDateKey(taskDate) : null;
      const dayWeekday = getWeekday(day);
      const isSaturday = dayWeekday === 6;
      const isSunday = dayWeekday === 0;
      const isWeekend = isSaturday || isSunday;

      if (repeat === 'every_day') {
        acc[key].push({ ...task, _recurring: true });
        return;
      }
      if (repeat === 'weekends' && isWeekend) {
        acc[key].push({ ...task, _recurring: true });
        return;
      }
      if (repeat === 'none' && taskDateKey && taskDateKey === key) {
        acc[key].push(task);
      }
    });
    return acc;
  }, {});

  const formatDayLabel = (date) =>
    date.toLocaleDateString('ru-RU', {
      weekday: view === 'month' ? undefined : 'short',
      day: '2-digit',
      month: '2-digit',
    });

  const monthTitle =
    view === 'month' && days.length > 0
      ? days[0].toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
      : null;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Календарь задач</h1>
        <p className="page-description">
          Просмотр нагрузки по дням и повторяющихся обязанностей. Задачи с датой показываются в день срока, с повтором — в каждый подходящий день.
        </p>
      </header>

      <section className="page-section">
        <div className="calendar-toolbar">
          <div className="calendar-view-toggle">
            <button
              type="button"
              className={view === 'day' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setView('day')}
            >
              День
            </button>
            <button
              type="button"
              className={view === 'week' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setView('week')}
            >
              Неделя
            </button>
            <button
              type="button"
              className={view === 'month' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setView('month')}
            >
              Месяц
            </button>
          </div>

          {view === 'month' && (
            <div className="calendar-month-nav">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setMonthOffset((o) => o - 1)}
              >
                ← Назад
              </button>
              <span className="calendar-month-title">{monthTitle}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setMonthOffset((o) => o + 1)}
              >
                Вперёд →
              </button>
            </div>
          )}

          <div className="calendar-filters">
            <label>
              <span className="small text-muted">Член семьи</span>
              <select
                className="input-select"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="all">Все</option>
                {members.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {tasksWithoutDate.length > 0 && (
        <section className="page-section calendar-undo-section">
          <h2 className="section-header">Задачи без срока</h2>
          <p className="text-muted small mb-12">
            Эти задачи не привязаны к дате. Назначьте срок в разделе «Задачи» или выполняйте по необходимости.
          </p>
          <ul className="calendar-undo-list">
            {tasksWithoutDate.map((task) => (
              <li key={task.id} className="calendar-task-chip">
                <span className="calendar-task-title">{task.title}</span>
                {task.currentAssignee && (
                  <span className="calendar-task-assignee">{task.currentAssignee}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="page-section">
        <div
          className={
            view === 'day'
              ? 'calendar-grid calendar-grid-single'
              : view === 'month'
                ? 'calendar-grid calendar-grid-month'
                : 'calendar-grid'
          }
        >
          {days.map((day) => {
            const key = toLocalDateKey(day);
            const dayTasks = tasksByDate[key] || [];
            const totalLoad = dayTasks.length;
            const isToday = key === toLocalDateKey(now);

            return (
              <div
                key={key}
                className={`calendar-day ${isToday ? 'calendar-day-today' : ''}`}
              >
                <div className="calendar-day-header">
                  <span className="calendar-day-label">
                    {formatDayLabel(day)}
                  </span>
                  <span className="calendar-day-load">
                    {totalLoad} {totalLoad === 1 ? 'задача' : totalLoad < 5 ? 'задачи' : 'задач'}
                  </span>
                </div>
                <div className="calendar-day-tasks">
                  {dayTasks.length === 0 ? (
                    <p className="text-muted small">Задач нет.</p>
                  ) : (
                    dayTasks.map((task, idx) => (
                      <div
                        key={task.id + key + idx}
                        className="calendar-task-chip"
                        title={[task.title, task._recurring && 'Повтор', task.currentAssignee && `Исполнитель: ${task.currentAssignee}`].filter(Boolean).join(' · ')}
                      >
                        <div className="calendar-task-chip-main">
                          <span className="calendar-task-title-text">{task.title}</span>
                          <div className="calendar-task-chip-meta">
                            {task._recurring && (
                              <span className="calendar-task-repeat-badge" aria-hidden title="Повторяющаяся">↻</span>
                            )}
                            {task._recurring && task.currentAssignee && <span className="calendar-task-chip-sep" aria-hidden>·</span>}
                            {task.currentAssignee && (
                              <span className="calendar-task-assignee">{task.currentAssignee}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

