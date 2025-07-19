'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Delete from './DeleteTask';
import TaskCardCalendar from './TaskCardCalendar';
import EditTask from './EditTask';
import { useRouter } from 'next/navigation';


type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type Props = {
  isAuthenticated: boolean;
} 

const TaskCard = ({isAuthenticated}: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();

  const safeParseJSON = async (res: Response) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('safeParseJSON: Failed to parse JSON response:', e, 'Response text:', text);
      return null;
    }
  };

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('You are not authorized to perform this action')
      return;
    }

    try {
      const res = await fetch('/api/task', {
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorBody = await safeParseJSON(res);
        console.error("fetchTasks: API response not OK. Status:", res.status, "Error Body:", errorBody);
        throw new Error(errorBody?.error || `Failed to fetch tasks with status: ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("fetchTasks: API did not return an array of tasks:", data);
        setTasks([]);
        toast.error("Failed to load tasks due to unexpected data format.");
        return;
      }
      console.log("fetchTasks: Successfully fetched tasks. Count:", data.length);
      setTasks(data);
    } catch (error) {
      console.error('fetchTasks: Error fetching tasks:', error);
      setTasks([]);
      toast.error('Failed to load tasks.');
    }
  }, [setTasks]); 

  useEffect(() => {
    console.log("useEffect: Calling fetchTasks on component mount/update.");
    fetchTasks();
  }, [fetchTasks]); 

  useEffect(() => {
    console.log("useEffect [tasks-updated]: Setting up custom event listener.");
    const handleUpdate = () => {
      console.log("tasks-updated event received. Re-fetching tasks.");
      fetchTasks(); // 
    };
    window.addEventListener("tasks-updated", handleUpdate);
    return () => {
        console.log("useEffect [tasks-updated]: Cleaning up custom event listener.");
        window.removeEventListener("tasks-updated", handleUpdate);
    };
  }, [fetchTasks]); 


  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('You are not Authenticated to perform this action')
      router.push('/login')
      return;
    }

    const scheduledTime = new Date(newScheduledAt);
    if (scheduledTime < new Date()) {
      toast.error('Cannot schedule task in the past.');
      return;
    }

    const taskData = {
      title: newTitle,
      description: newDescription,
      scheduledAt: newScheduledAt,
    };

    try {
      console.log('handleAddTask: Sending task:', taskData);

      const res = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const resBody = await safeParseJSON(res);

      if (!res.ok) {
        console.error("handleAddTask: API response not OK. Status:", res.status, "Error Body:", resBody);
        throw new Error(resBody?.error || 'Server error');
      }

      setTasks((prev) => [...prev, resBody]);
      window.dispatchEvent(new Event('tasks-updated'));
      toast.success('Task created!');
      setShowModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewScheduledAt('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`An error occurred: ${error.message}`);
        console.error('handleAddTask: Error:', error.message);
      } else {
        toast.error('An unknown error occurred.');
        console.error('handleAddTask: Unknown error:', error);
      }
    }
  };

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.error('You are not Authenticated to perform this action')
      return;
    }
    console.log("handleOpenModal: Called (no authentication).");
    setShowModal(true);
  };

  

  return (
    <>
      {tasks.map((task) => (
        <div
          key={task._id}
          className="flex justify-between items-start gap-4 p-4 rounded-lg shadow-md bg-white border border-gray-200 mb-4"
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
            <p className="text-md text-black mb-1">
              {task.scheduledAt
                ? new Date(task.scheduledAt).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : 'No scheduled date'}
            </p>
            <p className="text-sm text-gray-700 mb-2">{task.description}</p>
            <span className="inline-block text-xs px-2 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700 mb-3">
              Scheduled
            </span>
            <div className="flex gap-3 mt-2">
              <EditTask task={task} setTasks={setTasks} />
              <Delete taskId={task._id} setTasks={setTasks} />
            </div>
          </div>
        </div>
      ))}

      <div
        onClick={handleOpenModal}
        className="p-4 bg-white rounded-xl font-medium flex lg:w-[30vh] justify-between items-center mt-5 shadow-lg cursor-pointer"
      >
        <p className="text-black">Add New Task</p>
        <p className="px-4 text-white text-xl font-medium bg-orange-400 rounded-lg">+</p>
      </div>

      {showModal && ( // Removed 'user &&' condition here
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-4xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Task</h2>

            <form onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 mb-2 border-0 rounded-lg focus:outline-none bg-gray-200"
                required
              />

              <div>
                <input
                  type="text"
                  readOnly
                  value={newScheduledAt ? new Date(newScheduledAt).toLocaleString() : ''}
                  placeholder="Pick date and time"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full p-2 mb-2 rounded-lg focus:outline-none bg-gray-200 cursor-pointer"
                  required
                />

                {showCalendar && (
                  <div className="mb-2">
                    <TaskCardCalendar
                      value={newScheduledAt ? new Date(newScheduledAt) : null}
                      onChange={(date) => {
                        const existing = newScheduledAt ? new Date(newScheduledAt) : new Date();
                        const updated = new Date(date);
                        updated.setHours(existing.getHours());
                        updated.setMinutes(existing.getMinutes());
                        setNewScheduledAt(updated.toISOString());
                        setShowCalendar(false);
                      }}
                    />
                    <input
                      type="time"
                      className="mt-2 px-3 py-1 border rounded"
                      value={
                        newScheduledAt
                          ? new Date(newScheduledAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''
                      }
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(':');
                        const updated = newScheduledAt ? new Date(newScheduledAt) : new Date();
                        updated.setHours(+h);
                        updated.setMinutes(+m);
                        setNewScheduledAt(updated.toISOString());
                      }}
                    />
                  </div>
                )}
              </div>

              <textarea
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 mb-2 rounded-lg focus:outline-none bg-gray-200"
              ></textarea>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:underline"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
