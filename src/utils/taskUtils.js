/** Сумма баллов участника по выполненным задачам (в которых он в ротации) */
export function getMemberPoints(tasks, memberName) {
  if (!memberName) return 0;
  return tasks
    .filter(
      (t) =>
        Array.isArray(t.members) &&
        t.members.includes(memberName) &&
        t.lastCompleted
    )
    .reduce((sum, t) => sum + (t.points ?? 10), 0);
}

/** Количество активных задач, где участник в ротации */
export function getMemberTaskCount(tasks, memberName) {
  if (!memberName) return 0;
  return tasks.filter(
    (t) =>
      !t.isCompleted &&
      Array.isArray(t.members) &&
      t.members.includes(memberName)
  ).length;
}
