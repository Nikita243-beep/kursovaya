import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';

export default function EditTaskModal({ task, onSave, onClose }) {
  const { members: familyMembers } = useFamily();
  const [title, setTitle] = useState('');
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [difficulty, setDifficulty] = useState(2);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setMembers(Array.isArray(task.members) ? [...task.members] : []);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? task.dueDate.slice(0, 16) : '');
      setRepeat(task.repeat || 'none');
      setDifficulty(
        task.difficulty === 'easy' ? 1 : task.difficulty === 'hard' ? 3 : 2
      );
    }
  }, [task]);

  const toggleMember = (member) => {
    if (members.includes(member)) {
      setMembers(members.filter((m) => m !== member));
    } else {
      setMembers([...members, member]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task || !title.trim() || members.length === 0) return;
    const difficultyLabel =
      difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard';
    const points = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 15;
    onSave(task.id, {
      title: title.trim(),
      description: description.trim() || '',
      members,
      dueDate: dueDate || null,
      repeat,
      difficulty: difficultyLabel,
      points,
    });
    onClose();
  };

  if (!task) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="edit-task-title">Редактировать задачу</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="edit-task-form">
          <label className="field-label">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название задачи"
            className="input-text mb-12"
            autoFocus
          />
          <label className="field-label">Описание (по желанию)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание"
            className="input-text mb-12 add-task-textarea"
            rows={2}
          />
          <label className="field-label">Участники ротации</label>
          <div className="member-choices mb-12">
            {familyMembers.map((member) => (
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
          <label className="field-label">Срок</label>
          <input
            type="datetime-local"
            className="input-text mb-12"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <label className="field-label">Повторяемость</label>
          <select
            className="input-select mb-12"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          >
            <option value="none">Без повтора</option>
            <option value="every_day">Каждый день</option>
            <option value="weekends">По выходным</option>
          </select>
          <label className="field-label">Сложность</label>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="difficulty-range mb-12"
          />
          <div className="difficulty-labels small text-muted mb-12">
            <span>Лёгкая</span>
            <span>Средняя</span>
            <span>Сложная</span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim() || members.length === 0}
              className="btn btn-primary"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
