'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Delete from './DeleteTask';
import TaskCardCalendar from './TaskCardCalendar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from 'app/lib/firebase';
import EditTask from './EditTask';

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type Props = Record<string, never>;

type StoredUser = {
  uid: string;
  email?: string;
};

const TaskCard = ({}: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [user, setUser] = useState<User | StoredUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  const getToken = useCallback(async () => {
    console.log("getToken: Checking user status...", user ? "User exists" : "No user");
    if (!user) {
      console.log("getToken: No user found, returning null token.");
      return null;
    }
    if ('getIdToken' in user && typeof (user as User).getIdToken === 'function') {
      try {
        const idToken = await (user as User).getIdToken(true); // true forces a refresh
        console.log("getToken: Successfully obtained ID token. Token starts with:", idToken ? idToken.substring(0, 10) + "..." : "null");
        return idToken;
      } catch (error) {
        console.error("getToken: Error refreshing ID token:", error);
        // Removed direct router.push('/login') here. Let the caller handle it.
        return null;
      }
    }
    console.log("getToken: User object does not have getIdToken function, returning null.");
    return null;
  }, [user]); // Dependency on user

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
    console.log("fetchTasks: Starting fetch. isAuthReady:", isAuthReady, "User:", user ? "exists" : "null");
    try {
      const idToken = await getToken(); // Use the memoized getToken

      if (!idToken) {
        console.log("fetchTasks: No ID token available, setting tasks to empty. NOT redirecting here.");
        setTasks([]);
        return; // Stop execution, but don't redirect automatically
      }
      console.log("fetchTasks: Token obtained, fetching tasks from /api/task.");

      const res = await fetch('/api/task', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorBody = await safeParseJSON(res);
        console.error("fetchTasks: API response not OK. Status:", res.status, "Error Body:", errorBody);
        if (res.status === 401) {
          console.log("fetchTasks: Received 401, but NOT redirecting here. User will be prompted on next action.");
          toast.error('Session expired. Please log in again.'); // Keep toast for user feedback
          setTasks([]); // Clear tasks if unauthorized
          return; // Stop execution, but don't redirect automatically
        }
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
  }, [setTasks, user, isAuthReady, getToken]); // Removed router from dependencies as it's not used for redirection here

  useEffect(() => {
    console.log("useEffect [onAuthStateChanged]: Setting up listener.");
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged: User changed to:", firebaseUser ? firebaseUser.uid : "null");
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        // Removed automatic redirection here.
        // The user will remain on the page, but will be redirected on an explicit authenticated action.
      }
      setIsAuthReady(true); // Mark auth as ready after initial check
      console.log("onAuthStateChanged: isAuthReady set to true.");
    });
    return () => {
        console.log("useEffect [onAuthStateChanged]: Cleaning up listener.");
        unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("useEffect [user, isAuthReady]: User or AuthReady changed. User:", user ? "exists" : "null", "isAuthReady:", isAuthReady);
    if (user && isAuthReady) {
      console.log("useEffect [user, isAuthReady]: User exists and auth is ready, calling fetchTasks.");
      fetchTasks();
    } else if (isAuthReady) {
      console.log("useEffect [user, isAuthReady]: No user but auth is ready, setting tasks to empty.");
      setTasks([]);
    }
  }, [user, isAuthReady, fetchTasks, setTasks]);

  useEffect(() => {
    console.log("useEffect [tasks-updated]: Setting up custom event listener.");
    const handleUpdate = () => {
      console.log("tasks-updated event received. Re-fetching tasks.");
      if (user && isAuthReady) {
        fetchTasks();
      }
    };
    window.addEventListener("tasks-updated", handleUpdate);
    return () => {
        console.log("useEffect [tasks-updated]: Cleaning up custom event listener.");
        window.removeEventListener("tasks-updated", handleUpdate);
    };
  }, [fetchTasks, user, isAuthReady]);


  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAddTask: Attempting to add task.");

    if (!user) {
      console.log("handleAddTask: No user found, redirecting to login.");
      toast.error('Login required. Redirecting...');
      router.push('/login'); // Keep redirection here for explicit action
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
      const idToken = await getToken(); 

      if (!idToken) {
        console.log("handleAddTask: No ID token available after getToken call, redirecting.");
        toast.error('Authentication token missing. Please log in again.');
        router.push('/login'); 
        return;
      }
      console.log('handleAddTask: Sending task:', taskData);

      const res = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(taskData),
      });

      const resBody = await safeParseJSON(res);

      if (!res.ok) {
        console.error("handleAddTask: API response not OK. Status:", res.status, "Error Body:", resBody);
        if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login') 
          return;
        }
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
    console.log("handleOpenModal: Called.");
    if (!user) {
      console.log("handleOpenModal: No user, redirecting to login.");
      toast.error('Login required.');
      router.push('/login'); // 
      return;
    }
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

      {showModal && user && (
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
