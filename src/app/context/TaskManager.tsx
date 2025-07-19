// components/TaskManager.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserProvider';
import toast from 'react-hot-toast';
import { User as FirebaseUser } from "firebase/auth";

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type TaskManagerChildrenProps = {
  tasks: Task[];
  handleAddTask: (taskData: Omit<Task, '_id'>) => Promise<void>;
  fetchTasks: () => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

type TaskManagerProps = {
  children: (props: TaskManagerChildrenProps) => React.ReactNode;
};

export default function TaskManager({ children }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useUser();

  // Utility function to safely parse JSON responses
  const safeParseJSON = async (res: Response) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('Failed to parse JSON response:', text);
      return null;
    }
  };

  // Handles both token types (regular and Firebase)
  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    const authType = localStorage.getItem('taskly_auth_type');
    let token = localStorage.getItem('taskly_token') || '';

    // Handle Firebase token refresh
    if (authType === 'firebase') {
      const isFirebaseUser = (user: unknown): user is FirebaseUser => {
        return Boolean(
          user &&
          typeof user === 'object' &&
          'getIdToken' in user &&
          typeof (user as FirebaseUser).getIdToken === 'function'
        );
      };

      if (isFirebaseUser(user)) {
        token = await user.getIdToken();
        localStorage.setItem('taskly_token', token);
      } else {
        throw new Error("Invalid Firebase user");
      }
    }

    if (!token) throw new Error("No authentication token available");
    return token;
  }, [user]);

  // Fetch tasks with proper error handling
  const fetchTasks = useCallback(async () => {
    if (!user) {
      console.warn("User not available - skipping task fetch");
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/task', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await safeParseJSON(response);
        throw new Error(errorData?.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid tasks data format received");
      }

      setTasks(data);
    } catch (error) {
      console.error("Task fetch error:", error);
      setTasks([]);
      toast.error(error instanceof Error ? error.message : 'Failed to load tasks');
    }
  }, [user, getAuthToken]);

  // Handle task creation with validation
  const handleAddTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      // Validate scheduled time
      if (new Date(taskData.scheduledAt) < new Date()) {
        throw new Error('Cannot schedule task in the past');
      }

      const token = await getAuthToken();
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData?.error || 'Task creation failed');
      }

      // Update local state and notify listeners
      setTasks(prev => [...prev, responseData]);
      window.dispatchEvent(new Event('tasks-updated'));
      toast.success('Task created successfully!');
    } catch (error) {
      console.error("Task creation error:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
      throw error;
    }
  };

  // Initial fetch and event listener setup
  useEffect(() => {
    fetchTasks();
    
    const handleTaskUpdate = () => fetchTasks();
    window.addEventListener('tasks-updated', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('tasks-updated', handleTaskUpdate);
    };
  }, [fetchTasks]);

  return children({ tasks, handleAddTask, fetchTasks, setTasks });
}