export const getNextAssignee = (members, current) => {
  if (!Array.isArray(members) || members.length === 0) return current ?? null;
  const idx = members.indexOf(current);
  if (idx === -1) return members[0];
  return members[(idx + 1) % members.length];
};