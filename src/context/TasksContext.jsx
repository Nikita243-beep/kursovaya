import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TASKS_KEY } from '../constants/storage';
import { getNextAssignee } from '../utils/rotationUtils';

function readTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(readTasks);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData) => {
    const members =
      Array.isArray(taskData.members) && taskData.members.length > 0
        ? taskData.members
        : [];
    const newTask = {
      id: Date.now(),
      ...taskData,
      currentAssignee: members[0] ?? null,
      lastCompleted: null,
      isCompleted: false,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const completeTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextAssignee = getNextAssignee(task.members, task.currentAssignee);
        return {
          ...task,
          currentAssignee: nextAssignee,
          lastCompleted: new Date().toISOString(),
        };
      })
    );
  }, []);

  const archiveTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isCompleted: true } : task
      )
    );
  }, []);

  const restoreTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isCompleted: false } : task
      )
    );
  }, []);

  const updateTask = useCallback((taskId, data) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextMembers = data.members ?? task.members;
        const currentAssignee = nextMembers.includes(task.currentAssignee)
          ? task.currentAssignee
          : nextMembers[0];
        return { ...task, ...data, currentAssignee };
      })
    );
  }, []);

  const value = {
    tasks,
    setTasks,
    addTask,
    completeTask,
    archiveTask,
    restoreTask,
    updateTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return ctx;
}
