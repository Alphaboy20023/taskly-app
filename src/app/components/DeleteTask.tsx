'use client';
import { useState, useEffect } from "react";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import toast from "react-hot-toast";

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type DeleteProps = {
  taskId: string;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const Delete = ({ taskId, setTasks }: DeleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);


  const handleDeleteTask = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error("User not authenticated");
        return;
      }

      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/task?id=${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete task.");
        return;
      }

      toast.success("Task deleted");
      setTasks(prev => prev.filter(task => task._id !== taskId));
      setIsOpen(false);
      window.dispatchEvent(new Event("tasks-updated"));
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong.");
      }
    }
  };


  return (
    <>
      <button
        className="text-red-600 hover:underline text-md"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Delete;
