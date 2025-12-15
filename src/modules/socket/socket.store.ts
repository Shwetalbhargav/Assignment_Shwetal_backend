// Map userId -> Set<socketId> (supports multiple tabs/devices)
const userSockets = new Map<string, Set<string>>();

export function addUserSocket(userId: string, socketId: string) {
  const set = userSockets.get(userId) ?? new Set<string>();
  set.add(socketId);
  userSockets.set(userId, set);
}

export function removeUserSocket(userId: string, socketId: string) {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
}

export function getUserSockets(userId: string) {
  return userSockets.get(userId) ?? new Set<string>();
}
