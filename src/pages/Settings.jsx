import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useTasks } from '../context/TasksContext';
import { getMemberTaskCount } from '../utils/taskUtils';
import { getRewardsFromStorage, saveRewardsToStorage } from '../utils/rewardsUtils';

export default function Settings() {
  const { members, addMember: addFamilyMember, removeMember: removeFamilyMember } = useFamily();
  const { tasks } = useTasks();
  const [inputValue, setInputValue] = useState('');
  const [rewards, setRewards] = useState(() => getRewardsFromStorage());

  useEffect(() => {
    if (rewards.length === 0) return;
    saveRewardsToStorage(rewards);
  }, [rewards]);

  const addReward = () => {
    const maxPoints = rewards.length ? Math.max(...rewards.map((r) => r.points), 0) : 0;
    setRewards([
      ...rewards,
      { id: `r-${Date.now()}`, points: maxPoints + 50, label: '' },
    ]);
  };

  const updateReward = (id, field, value) => {
    setRewards(
      rewards.map((r) =>
        r.id === id
          ? { ...r, [field]: field === 'points' ? (Number(value) || 0) : value }
          : r
      )
    );
  };

  const removeReward = (id) => {
    if (rewards.length <= 1) return;
    setRewards(rewards.filter((r) => r.id !== id));
  };

  const handleRemoveMember = (member) => {
    const count = getMemberTaskCount(tasks, member);
    if (count > 0 && !window.confirm(`У «${member}» есть задачи в ротации (${count}). Всё равно удалить?`)) {
      return;
    }
    removeFamilyMember(member);
  };

  const addMember = () => {
    const name = inputValue.trim();
    if (name && !members.includes(name)) {
      addFamilyMember(name);
      setInputValue('');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Настройки</h1>
        <p className="page-description">
          Добавьте участников семьи и настройте награды за выполнение домашних обязанностей. Ротация задач идёт по кругу между выбранными участниками.
        </p>
      </header>

      <section className="page-section">
        <div className="card-inline-form">
          <h2>Члены семьи</h2>
          <label className="field-label">Имя участника</label>
          <div className="inline-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Например: Мама, Папа, Соня"
              onKeyPress={(e) => e.key === 'Enter' && addMember()}
              className="input-text"
            />
            <button onClick={addMember} className="btn btn-primary">
              Добавить
            </button>
          </div>
          <p className="text-muted">
            Участников можно добавлять и удалять в любой момент.
          </p>
        </div>

        <ul className="member-list">
          {members.length === 0 ? (
            <li className="member-item member-item-empty">
              <span className="text-muted">
                Пока нет участников. Добавьте хотя бы одного, чтобы создавать
                задачи.
              </span>
            </li>
          ) : (
            members.map((member, index) => (
              <li key={index} className="member-item">
                <span>{member}</span>
                <span className="member-meta text-muted small">
                  Роль: член семьи
                </span>
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="btn btn-secondary btn-sm"
                >
                  Удалить
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="page-section settings-grid">
        <div className="settings-card">
          <h2>Награды</h2>
          <p className="text-muted small">
            Настройте реальные призы, которые семья выдаёт за накопленные
            баллы.
          </p>

          <div className="settings-options">
            <ul className="rewards-list">
              {rewards.map((r) => (
                <li key={r.id} className="reward-row">
                  <input
                    type="number"
                    min={0}
                    className="input-text reward-points-input"
                    value={r.points}
                    onChange={(e) => updateReward(r.id, 'points', e.target.value)}
                    aria-label="Баллы"
                  />
                  <span className="reward-equals">баллов =</span>
                  <input
                    type="text"
                    className="input-text reward-label-input"
                    value={r.label}
                    onChange={(e) => updateReward(r.id, 'label', e.target.value)}
                    placeholder="Название награды"
                    aria-label="Название награды"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm reward-remove-btn"
                    onClick={() => removeReward(r.id)}
                    disabled={rewards.length <= 1}
                    title="Удалить награду"
                    aria-label="Удалить награду"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-secondary mt-12" onClick={addReward}>
              + Добавить награду
            </button>
            <div className="rewards-preview mt-16">
              {rewards
                .filter((r) => r.label.trim())
                .sort((a, b) => a.points - b.points)
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
        </div>
      </section>
    </div>
  );
}