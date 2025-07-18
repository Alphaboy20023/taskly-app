'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type Props = {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const EditTask = ({ task, setTasks }: Props) => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [scheduledAt, setScheduledAt] = useState(task.scheduledAt);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/task?id=${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, scheduledAt, description }),
      });

      if (!res.ok) throw new Error('Failed to update');

      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      toast.success('Task updated!');
      setShow(false);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-blue-600 hover:underline text-md"
      >
        Edit
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

            <input
              className="w-full mb-2 p-2 bg-gray-100 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />

            <textarea
              className="w-full mb-2 p-2 bg-gray-100 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />

            <input
              type="datetime-local"
              value={new Date(scheduledAt).toISOString().slice(0, 16)}
              onChange={(e) =>
                setScheduledAt(new Date(e.target.value).toISOString())
              }
              className="w-full mb-4 p-2 bg-gray-100 rounded"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShow(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTask;
