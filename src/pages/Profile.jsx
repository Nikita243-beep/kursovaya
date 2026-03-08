import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { useTasks } from '../context/TasksContext';
import { getMemberPoints } from '../utils/taskUtils';
import { getRewardsFromStorage } from '../utils/rewardsUtils';

export default function Profile() {
  const { members } = useFamily();
  const { tasks } = useTasks();
  const [selectedMember, setSelectedMember] = useState('');
  const rewards = getRewardsFromStorage();

  useEffect(() => {
    if (members.length === 0) {
      setSelectedMember('');
    } else if (!selectedMember || !members.includes(selectedMember)) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);

  const memberTasks = tasks.filter(
    (t) =>
      selectedMember &&
      Array.isArray(t.members) &&
      t.members.includes(selectedMember)
  );

  const completedCount = memberTasks.filter((t) => t.lastCompleted).length;
  const totalCount = memberTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const memberPoints = getMemberPoints(tasks, selectedMember);

  const categoryStats = memberTasks.reduce((acc, task) => {
    const category = task.category || (task.difficulty ? ({ easy: 'Лёгкие', medium: 'Средние', hard: 'Сложные' }[task.difficulty] || 'Общее') : 'Общее');
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const weekDayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weeklyStats = Array.from({ length: 7 }, (_, index) => {
    const jsDayWanted = index === 6 ? 0 : index + 1;
    const value = memberTasks.filter((t) => {
      if (!t.lastCompleted) return false;
      const d = new Date(t.lastCompleted);
      if (Number.isNaN(d.getTime())) return false;
      return d.getDay() === jsDayWanted;
    }).length;
    return {
      label: weekDayLabels[index],
      value,
    };
  });

  return (
    <div className="page">
      <header className="page-header">
        <h1>Профиль и награды</h1>
        <p className="page-description">
          Мотивация и вклад каждого участника семьи в выполнение домашних
          обязанностей.
        </p>
      </header>

      <section className="page-section">
        {members.length === 0 ? (
          <div className="empty-state">
            <h3>Участники ещё не добавлены</h3>
            <p className="text-muted">
              Добавьте членов семьи в разделе «Настройки», чтобы просматривать
              профиль и награды.
            </p>
          </div>
        ) : (
          <>
            <div className="profile-selector">
              <label className="field-label">Выберите участника</label>
              <select
                className="input-select"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                {members.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-main">
              <div className="profile-card">
                <div className="profile-avatar">
                  {selectedMember ? selectedMember.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="profile-info">
                  <h2>{selectedMember}</h2>
                  <p className="text-muted">
                    Общий вклад в выполнение задач и участие в ротации.
                  </p>
                  <div className="profile-progress">
                    <span className="small text-muted">
                      Прогресс: {completedCount} из {totalCount} задач
                    </span>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="small text-muted mt-16">
                      Баллы: <strong>{memberPoints}</strong>
                      {(() => {
                        const unlocked = rewards.filter((r) => r.label.trim() && memberPoints >= r.points);
                        return unlocked.length > 0 ? ` — доступно: ${unlocked.map((r) => r.label).join(', ')}` : '';
                      })()}
                    </p>
                  </div>
                  <Link
                    to={selectedMember ? `/tasks?member=${encodeURIComponent(selectedMember)}` : '/tasks'}
                    className="btn btn-primary btn-block"
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                  >
                    Мои задачи сегодня
                  </Link>
                </div>
              </div>

              <div className="profile-stats">
                <div className="profile-stat-card">
                  <h3>Задачи по категориям</h3>
                  {Object.keys(categoryStats).length === 0 ? (
                    <p className="text-muted small">
                      Пока нет задач, привязанных к этому участнику.
                    </p>
                  ) : (
                    <ul className="stat-list">
                      {Object.entries(categoryStats).map(
                        ([category, count]) => (
                          <li key={category}>
                            <span>{category}</span>
                            <span className="stat-pill">{count}</span>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>

                <div className="profile-stat-card">
                  <h3>Задачи за неделю</h3>
                  <div className="stat-bars">
                    {weeklyStats.map((item) => {
                      const maxVal = Math.max(...weeklyStats.map((s) => s.value), 1);
                      const heightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                      return (
                        <div key={item.label} className="stat-bar-item">
                          <div className="stat-bar">
                            <div
                              className="stat-bar-fill"
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="small text-muted">{item.label}</span>
                          {item.value > 0 && (
                            <span className="small stat-bar-value">{item.value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-rewards page-section">
              <h2>Награды и уровни</h2>
              <p className="text-muted small">
                Награды из настроек. Баллы начисляются за выполнение: лёгкая — 5, средняя — 10, сложная — 15.
              </p>
              <div className="rewards-grid">
                {rewards.map((r) => {
                  const unlocked = memberPoints >= r.points;
                  return (
                    <div
                      key={r.id}
                      className={`reward-card ${unlocked ? 'reward-card-active' : 'reward-card-locked'}`}
                    >
                      <h3>{r.points} баллов</h3>
                      <p className="text-muted small">
                        {r.label.trim() || 'Награда не задана'}
                      </p>
                      {!unlocked && (
                        <p className="small text-muted">
                          Осталось: {Math.max(0, r.points - memberPoints)} баллов
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

