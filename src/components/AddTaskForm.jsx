import { useState } from 'react';
import { useFamily } from '../context/FamilyContext';

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [difficulty, setDifficulty] = useState(2);

  const { members: familyMembers } = useFamily();

  const toggleMember = (member) => {
    if (members.includes(member)) {
      setMembers(members.filter(m => m !== member));
    } else {
      setMembers([...members, member]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && members.length > 0) {
      const difficultyLabel =
        difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard';
      const points = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 15;

      onAdd({
        title: title.trim(),
        description: description.trim() || '',
        members,
        dueDate: dueDate || null,
        repeat,
        difficulty: difficultyLabel,
        points,
      });
      setTitle('');
      setMembers([]);
      setDescription('');
      setDueDate('');
      setRepeat('none');
      setDifficulty(2);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <h3>Добавить новую задачу</h3>
      <p className="text-muted mb-12">
        Опишите обязанность и выберите участников, между которыми будет
        происходить ротация.
      </p>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название задачи (например: Вынести мусор)"
        className="input-text mb-12"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Краткое описание (по желанию)"
        className="input-text mb-12 add-task-textarea"
        rows={3}
      />

      <p className="mb-12">
        <strong>Выберите участников для ротации:</strong>
      </p>
      {familyMembers.length === 0 ? (
        <p className="text-muted">Сначала добавьте участников в разделе «Участники»</p>
      ) : (
        <div className="member-choices">
          {familyMembers.map(member => (
            <label key={member} className="member-choice">
              <input
                type="checkbox"
                checked={members.includes(member)}
                onChange={() => toggleMember(member)}
              />
              <span>{member}</span>
            </label>
          ))}
        </div>
      )}

      <div className="add-task-grid mb-12">
        <div>
          <p className="mb-12">
            <strong>Когда выполнять:</strong>
          </p>
          <input
            type="datetime-local"
            className="input-text mb-12"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <label className="field-label small">
            Повторяемость
            <select
              className="input-select mt-8"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            >
              <option value="none">Без повтора</option>
              <option value="every_day">Каждый день</option>
              <option value="weekends">По выходным</option>
            </select>
          </label>
        </div>

        <div>
          <p className="mb-12">
            <strong>Сложность и ротация:</strong>
          </p>
          <label className="field-label small">Сложность задачи</label>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="difficulty-range"
          />
          <div className="difficulty-labels small text-muted">
            <span>Лёгкая</span>
            <span>Средняя</span>
            <span>Сложная</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim() || members.length === 0}
        className="btn btn-primary"
      >
        Создать задачу
      </button>
    </form>
  );
}