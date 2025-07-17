"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Delete from "./DeleteTask";

const TaskCard = () => {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [tasks, setTasks] = useState<
    { _id: string; title: string; description: string; scheduledAt: string }[]
  >([]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledTime = new Date(newScheduledAt);
    const now = new Date();

    if (scheduledTime < now) {
      toast.error("Event cannot be created in the past.");
      return;
    }

    const taskData = {
      title: newTitle,
      description: newDescription,
      scheduledAt: newScheduledAt,
    };

    const res = await fetch("/api/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (res.ok) {
      const savedTask = await res.json();
      setTasks(prev => [...prev, savedTask]);
      toast.success("Task Created!");
      setShowModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewScheduledAt("");
    } else {
      toast.error("Failed to add task.");
    }
  };


  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch("/api/task");
      const data = await res.json();
      setTasks(data);
    };

    fetchTasks();
  }, []);

 



  return (
    <>
      {tasks.length > 0 && tasks.map((task) => (
        <div
          key={task._id}
          className="flex justify-between items-start gap-4 p-4 rounded-lg shadow-md bg-white border border-gray-200 mb-4"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              src="https://source.unsplash.com/80x80/?task,productivity"
              alt="Task"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {task.title}
            </h3>
            <p className="text-md text-black mb-1">
              {new Date(task.scheduledAt)
                .toLocaleString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              }
            </p>
            <p className="text-sm text-gray-700 mb-2">{task.description}</p>

            <span className="inline-block text-xs px-2 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700 mb-3">
              Scheduled
            </span>

            <div className="flex gap-3 mt-2">
              <button className="text-blue-600 hover:underline text-sm">
                Edit
              </button>
              <Delete taskId={task._id} setTasks={setTasks}/>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Task Trigger */}
      <div
        onClick={() => setShowModal(true)}
        className="p-4 bg-white rounded-2xl flex justify-between items-center mt-5 shadow-lg cursor-pointer"
      >
        <p className="px-4 text-white text-xl font-medium bg-orange-400 rounded-lg">+</p>
        <p>Add New Task</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-4xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Task</h2>

            {/* Form */}
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 mb-2 border-0 rounded-lg focus:outline-none bg-gray-200"
              />
              <input
                type="datetime-local"
                value={newScheduledAt}
                onChange={(e) => setNewScheduledAt(e.target.value)}
                className="w-full p-2 mb-2 rounded-lg focus:outline-none bg-gray-200"
              />
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
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
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
