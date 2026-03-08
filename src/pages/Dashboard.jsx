import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AddTaskForm from '../components/AddTaskForm';
import TaskCard from '../components/TaskCard';
import EditTaskModal from '../components/EditTaskModal';
import { useFamily } from '../context/FamilyContext';
import { useTasks } from '../context/TasksContext';
import { getBoardColumnKey } from '../utils/dateUtils';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const memberFromUrl = searchParams.get('member') || '';

  const { tasks, addTask, completeTask, archiveTask, restoreTask, updateTask } =
    useTasks();
  const [selectedMember, setSelectedMember] = useState(memberFromUrl || 'all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState('list');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { members: familyMembers } = useFamily();

  useEffect(() => {
    if (memberFromUrl && familyMembers.includes(memberFromUrl)) {
      setSelectedMember(memberFromUrl);
    }
  }, [memberFromUrl, familyMembers]);

  const handleUpdateTask = (taskId, data) => {
    updateTask(taskId, data);
    setEditingTaskId(null);
  };

  const editingTask = useMemo(
    () => (editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null),
    [editingTaskId, tasks]
  );

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter === 'active' && task.isCompleted) return false;
      if (statusFilter === 'completed' && !task.isCompleted) return false;
      if (selectedMember !== 'all') {
        if (!Array.isArray(task.members) || !task.members.includes(selectedMember)) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, selectedMember]);

  const activeCount = useMemo(() => tasks.filter((t) => !t.isCompleted).length, [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.isCompleted).length, [tasks]);

  const boardColumns = useMemo(() => {
    const today = [];
    const week = [];
    const later = [];
    visibleTasks.forEach((task) => {
      const col = getBoardColumnKey(task);
      if (col === 'today') today.push(task);
      else if (col === 'week') week.push(task);
      else later.push(task);
    });
    return { today, week, later };
  }, [visibleTasks]);

  const emptyStateMessage =
    statusFilter === 'completed'
      ? 'Нет завершённых задач.'
      : statusFilter === 'all' && visibleTasks.length === 0
        ? 'Нет задач. Добавьте первую выше.'
        : 'Добавьте первую задачу, чтобы начать учитывать домашние обязанности и ротацию.';

  return (
    <div className="page">
      <header className="page-header">
        <h1>Домашние обязанности</h1>
        <p className="page-description">
          Создавайте задачи, распределяйте их между членами семьи и
          автоматически вращайте обязанности.
        </p>
      </header>

      <section className="page-section">
        <div className="tasks-toolbar">
          <div className="tasks-toolbar-left">
            <div className="tasks-filters">
              <label className="small text-muted">
                Член семьи
                <select
                  className="input-select mt-8"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="all">Все</option>
                  {familyMembers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="small text-muted">
                Статус
                <select
                  className="input-select mt-8"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="active">Активные</option>
                  <option value="all">Все</option>
                  <option value="completed">Завершённые</option>
                </select>
              </label>
            </div>
          </div>

          <div className="tasks-toolbar-right">
            <div className="view-toggle">
              <button
                type="button"
                className={
                  viewMode === 'list'
                    ? 'btn btn-primary btn-sm'
                    : 'btn btn-secondary btn-sm'
                }
                onClick={() => setViewMode('list')}
              >
                Список
              </button>
              <button
                type="button"
                className={
                  viewMode === 'board'
                    ? 'btn btn-primary btn-sm'
                    : 'btn btn-secondary btn-sm'
                }
                onClick={() => setViewMode('board')}
              >
                Доска
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Активные задачи</span>
          <span className="summary-value">{activeCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Завершённые задачи</span>
          <span className="summary-value">{completedCount}</span>
        </div>
      </section>

      <section className="page-section">
        {showAddForm ? (
          <div className="add-task-section">
            <AddTaskForm
              onAdd={(data) => {
                addTask(data);
                setShowAddForm(false);
              }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-16"
              onClick={() => setShowAddForm(false)}
            >
              Свернуть форму
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            ＋ Добавить задачу
          </button>
        )}
      </section>

      <section className="page-section">
        <div className="section-header">
          <h2>
            {statusFilter === 'active' && 'Активные задачи'}
            {statusFilter === 'completed' && 'Завершённые задачи'}
            {statusFilter === 'all' && 'Все задачи'}
          </h2>
          <span className="badge badge-pill">{visibleTasks.length}</span>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            <h3>
              {statusFilter === 'completed' ? 'Нет завершённых задач' : 'Пока нет задач'}
            </h3>
            <p className="text-muted">{emptyStateMessage}</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="task-list">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id)}
                onArchive={() => archiveTask(task.id)}
                onRestore={() => restoreTask(task.id)}
                onEdit={() => setEditingTaskId(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="task-board">
            <div className="task-column">
              <h3>Сегодня</h3>
              {boardColumns.today.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => completeTask(task.id)}
                  onArchive={() => archiveTask(task.id)}
                  onRestore={() => restoreTask(task.id)}
                  onEdit={() => setEditingTaskId(task.id)}
                />
              ))}
            </div>
            <div className="task-column">
              <h3>На этой неделе</h3>
              {boardColumns.week.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => completeTask(task.id)}
                  onArchive={() => archiveTask(task.id)}
                  onRestore={() => restoreTask(task.id)}
                  onEdit={() => setEditingTaskId(task.id)}
                />
              ))}
            </div>
            <div className="task-column">
              <h3>Позже</h3>
              {boardColumns.later.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => completeTask(task.id)}
                  onArchive={() => archiveTask(task.id)}
                  onRestore={() => restoreTask(task.id)}
                  onEdit={() => setEditingTaskId(task.id)}
                />
              ))}
            </div>
          </div>
        )}
      </section>
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleUpdateTask}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  );
}