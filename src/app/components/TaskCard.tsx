// components/TaskCard.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import EditTask from './EditTask';
import TaskCardCalendar from './TaskCardCalendar';
import Delete from './DeleteTask';

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type TaskCardProps = {
  tasks?: Task[];
  handleAddTask: (taskData: Omit<Task, '_id'>) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const TaskCard = ({ tasks = [], handleAddTask, setTasks }: TaskCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledTime = new Date(newScheduledAt);
    if (scheduledTime < new Date()) {
      toast.error('Cannot schedule task in the past.');
      return;
    }

    try {
      await handleAddTask({
        title: newTitle,
        description: newDescription,
        scheduledAt: newScheduledAt,
      });
      setShowModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewScheduledAt('');
    } catch (error) {
      // Error is already handled in handleAddTask
    }
  };

  const handleOpenModal = () => setShowModal(true);

  return (
    <>
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks found. Add your first task!
        </div>
      ) : (
        tasks.map((task) => (
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
        ))
      )}

      <div
        onClick={handleOpenModal}
        className="p-4 bg-white rounded-xl font-medium flex lg:w-[30vh] justify-between items-center mt-5 shadow-lg cursor-pointer"
      >
        <p className="text-black">Add New Task</p>
        <p className="px-4 text-white text-xl font-medium bg-orange-400 rounded-lg">+</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-4xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Task</h2>

            <form onSubmit={handleSubmit}>
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