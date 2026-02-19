'use client';

import { useState } from 'react';

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
type Assignee = 'human' | 'ai';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: Assignee;
  createdAt: string;
}

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Build Mission Control', status: 'in-progress', assignee: 'ai', createdAt: '2026-02-19' },
    { id: '2', title: 'Test Otto AI Trading', status: 'todo', assignee: 'ai', createdAt: '2026-02-19' },
    { id: '3', title: 'Monitor Web4 Opportunities', status: 'in-progress', assignee: 'ai', createdAt: '2026-02-19' },
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      status: 'todo',
      assignee: 'ai',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const columns: { status: TaskStatus; label: string }[] = [
    { status: 'todo', label: '📋 To Do' },
    { status: 'in-progress', label: '🔥 In Progress' },
    { status: 'done', label: '✅ Done' },
    { status: 'blocked', label: '🚫 Blocked' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🎯 Tasks Board</h1>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add new task..."
          className="flex-1 p-2 border rounded-lg"
        />
        <button onClick={addTask} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Add
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col.status} className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-bold mb-4">{col.label}</h2>
            {tasks.filter(t => t.status === col.status).map(task => (
              <div key={task.id} className="bg-white p-3 rounded mb-2 shadow-sm">
                <p className="font-medium">{task.title}</p>
                <div className="flex gap-2 mt-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                    className="text-sm border rounded px-2"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {task.assignee === 'ai' ? '🤖 AI' : '👤 Human'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
