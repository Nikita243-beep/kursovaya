import { ROTATION_SETTINGS_KEY } from '../constants/storage';

const DEFAULT_REWARDS = [
  { id: '100', points: 100, label: 'Поход в кино' },
  { id: '200', points: 200, label: 'Совместная игра' },
];

/**
 * Читает награды из localStorage. Поддерживает старый формат (reward100/reward200).
 * @returns {Array<{ id: string, points: number, label: string }>}
 */
export function getRewardsFromStorage() {
  try {
    const raw = localStorage.getItem(ROTATION_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (Array.isArray(parsed.rewards) && parsed.rewards.length > 0) {
      return parsed.rewards.map((r) => ({
        id: r.id || `r-${r.points}-${Date.now()}`,
        points: Number(r.points) || 0,
        label: String(r.label || '').trim() || 'Награда',
      })).filter((r) => r.points >= 0).sort((a, b) => a.points - b.points);
    }
    const migrated = [];
    if (parsed.reward100 != null) {
      migrated.push({ id: '100', points: 100, label: String(parsed.reward100 || 'Поход в кино') });
    }
    if (parsed.reward200 != null) {
      migrated.push({ id: '200', points: 200, label: String(parsed.reward200 || 'Совместная игра') });
    }
    if (migrated.length > 0) return migrated;
  } catch (_) {}
  return [...DEFAULT_REWARDS];
}

/**
 * Сохраняет массив наград в localStorage.
 * @param {Array<{ id: string, points: number, label: string }>} rewards
 */
export function saveRewardsToStorage(rewards) {
  const normalized = rewards
    .map((r) => ({
      id: r.id || `r-${r.points}-${Math.random().toString(36).slice(2)}`,
      points: Number(r.points) || 0,
      label: String(r.label || '').trim() || 'Награда',
    }))
    .filter((r) => r.points >= 0)
    .sort((a, b) => a.points - b.points);
  const existing = localStorage.getItem(ROTATION_SETTINGS_KEY);
  let rest = {};
  try {
    if (existing) rest = JSON.parse(existing);
  } catch (_) {}
  delete rest.reward100;
  delete rest.reward200;
  localStorage.setItem(ROTATION_SETTINGS_KEY, JSON.stringify({ ...rest, rewards: normalized }));
}
