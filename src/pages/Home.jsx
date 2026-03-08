import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { useTasks } from '../context/TasksContext';
import { getMemberPoints } from '../utils/taskUtils';
import { getRewardsFromStorage } from '../utils/rewardsUtils';
import RedistributeModal from '../components/RedistributeModal';

function getTodayLabel() {
  return new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function Home() {
  const { tasks } = useTasks();
  const { members } = useFamily();
  const [period, setPeriod] = useState('today');
  const [showRedistribute, setShowRedistribute] = useState(false);
  const rewards = getRewardsFromStorage();

  const activeTasks = tasks.filter((t) => !t.isCompleted);

  const perMemberStats = members.map((name) => {
    const memberTasks = activeTasks.filter(
      (t) => Array.isArray(t.members) && t.members.includes(name)
    );
    const total = memberTasks.length;
    const completed = memberTasks.filter((t) => t.lastCompleted).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const upcoming = memberTasks.slice(0, 3);

    return { name, total, completed, progress, upcoming };
  });

  const urgentTasks = activeTasks.filter((task) => {
    if (!task.dueDate) return false;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    return diffMs < 0 || diffMs <= oneDay;
  });

  const scoresByMember = members.reduce(
    (acc, name) => {
      acc[name] = getMemberPoints(tasks, name);
      return acc;
    },
    {}
  );

  const bestHelper =
    members.length > 0
      ? members.reduce(
          (best, name) => {
            const score = scoresByMember[name] ?? 0;
            if (score > best.score) return { name, score };
            return best;
          },
          { name: members[0], score: scoresByMember[members[0]] ?? 0 }
        )
      : null;

  const handleRedistribute = () => {
    setShowRedistribute(true);
  };

  return (
    <div className="page">
      <header className="page-header home-header">
        <div>
          <h1>Сегодня в семье</h1>
          <p className="page-description">
            Кратко: кто и какие задачи выполняет сегодня. Добавьте семью и
            задачи, чтобы увидеть картину дня.
          </p>
          <p className="small text-muted">
            1) В «Настройках» добавьте членов семьи. 2) В разделе «Задачи»
            создайте обязанности. 3) Возвращайтесь сюда, чтобы смотреть, кто
            чем занят.
          </p>
        </div>
        <div className="home-header-right">
          <span className="home-date">{getTodayLabel()}</span>
          <div className="home-period-toggle">
            <button
              type="button"
              className={
                period === 'today'
                  ? 'btn btn-primary btn-sm'
                  : 'btn btn-secondary btn-sm'
              }
              onClick={() => setPeriod('today')}
            >
              Сегодня
            </button>
            <button
              type="button"
              className={
                period === 'week'
                  ? 'btn btn-primary btn-sm'
                  : 'btn btn-secondary btn-sm'
              }
              onClick={() => setPeriod('week')}
            >
              Неделя
            </button>
          </div>
        </div>
      </header>

      <section className="page-section">
        {members.length === 0 ? (
          <div className="empty-state">
            <h3>Начните с добавления семьи и задач</h3>
            <p className="text-muted">
              Перейдите на экран «Настройки», чтобы добавить членов семьи и
              затем создайте первые задачи в разделе «Задачи».
            </p>
          </div>
        ) : (
          <div className="family-grid">
            {perMemberStats.map((m) => {
              const progressDeg = Math.round((m.progress / 100) * 360);
              return (
                <article key={m.name} className="family-card">
                  <div className="family-card-main">
                    <div
                      className="progress-ring"
                      style={{
                        background: `conic-gradient(var(--success) ${progressDeg}deg, var(--border) 0deg)`,
                      }}
                    >
                      <div className="progress-ring-inner">
                        <span className="progress-ring-value">
                          {m.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="family-card-info">
                      <h3>{m.name}</h3>
                      <p className="text-muted">
                        Выполнено {m.completed} из {m.total} задач
                      </p>
                    </div>
                  </div>

                  <div className="family-card-tasks">
                    {m.upcoming.length === 0 ? (
                      <p className="text-muted small">
                        На сегодня задач не назначено.
                      </p>
                    ) : (
                      <>
                        <p className="small">Ближайшие задачи:</p>
                        <ul>
                          {m.upcoming.map((task) => (
                            <li key={task.id}>{task.title}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <Link
                    to={`/tasks?member=${encodeURIComponent(m.name)}`}
                    className="btn btn-success btn-block"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    Мои задачи
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="page-section home-secondary">
        <div className="home-urgent">
          <div className="section-header">
            <h2>Срочно</h2>
          </div>
          {urgentTasks.length === 0 ? (
            <p className="text-muted small">
              Срочных задач нет. Можно распределять обязанности спокойнее.
            </p>
          ) : (
            <ul className="urgent-list">
              {urgentTasks.map((task) => (
                <li key={task.id}>
                  <span className="urgent-title">{task.title}</span>
                  {task.currentAssignee && (
                    <span className="urgent-assignee">
                      → {task.currentAssignee}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-16"
            onClick={handleRedistribute}
          >
            Перераспределить
          </button>
        </div>
        {showRedistribute && (
          <RedistributeModal onClose={() => setShowRedistribute(false)} />
        )}

        <div className="home-motivation">
          <div className="section-header">
            <h2>Мотивация</h2>
          </div>
          {bestHelper ? (
            <div className="best-helper-card">
              <p className="small text-muted">Лучший помощник недели</p>
              <div className="best-helper-main">
                <div className="best-helper-avatar">
                  {bestHelper.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{bestHelper.name}</h3>
                  <p className="text-muted">
                    Баллы: <strong>{bestHelper.score}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted small">
              Награды появятся, когда участники начнут выполнять задачи.
            </p>
          )}

          <p className="text-muted small mb-2">Награды за баллы (настраиваются в Настройках):</p>
          <div className="rewards-preview">
            {rewards
              .filter((r) => r.label.trim())
              .map((r, i) => (
                <span
                  key={r.id}
                  className={`reward-badge ${i % 2 === 0 ? 'reward-badge-gold' : 'reward-badge-blue'}`}
                >
                  {r.points} баллов — {r.label}
                </span>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

