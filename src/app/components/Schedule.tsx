'use client';

import { useEffect, useMemo, useState } from "react";
import TaskDetailModal from "./TaskDetailModal";
import Image from "next/image";
import { toast } from "react-toastify";

export type Task = {
    _id: string;
    title: string;
    description: string;
    scheduledAt: string;
};

const SchedulePage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch("/api/task");
                const data = await res.json();
                const filtered = data.filter((task: Task) => {
                    const taskDate = new Date(task.scheduledAt);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate >= today;
                });
                setTasks(filtered);
                setErrorMessage(null);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                // setErrorMessage('An unexpected error occured');
            }
        };

        fetchTasks();

        const handleUpdate = () => fetchTasks();
        window.addEventListener("tasks-updated", handleUpdate);
        return () => window.removeEventListener("tasks-updated", handleUpdate);
    }, [today]);

    const openModal = (task: Task) => setSelectedTask(task);
    const closeModal = () => setSelectedTask(null);

    const todayTasks = tasks.filter((task) => {
        const date = new Date(task.scheduledAt);
        return date.toDateString() === today.toDateString();
    });

    const upcomingTasks = tasks.filter((task) => {
        const date = new Date(task.scheduledAt);
        return date > today;
    });

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    

    return (
        <div className="p-4 w-full bg-white">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-medium p-2">Schedule</h1>
                    <p className="text-md text-gray-600 p-2">
                        {today.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <Image src="/Img/Logo.jpg" alt="logo" className="w-10 h-10"
                    width={400}
                    height={200}
                />
            </div>

            {/* Today's Schedule */}
            {todayTasks.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold mb-2 px-2">Today&apos;s Schedule</h2>
                    <div className="flex flex-col gap-4 mb-6">
                        {todayTasks.map((task) => (
                            <div
                                key={task._id}
                                onClick={() => openModal(task)}
                                className="cursor-pointer flex text-xl rounded-2xl shadow-lg font-medium justify-between items-center bg-[#F8D57E] px-6 p-4 gap-4"
                            >
                                <div className="flex gap-4 items-center">
                                    <Image src="/Img/Logo.jpg" alt="" className="w-10 h-10"
                                        width={400}
                                        height={200}
                                    />
                                    <div>
                                        <p>{task.title}</p>
                                        <p className="text-gray-600 text-sm">{task.description}</p>
                                    </div>
                                </div>
                                <p className="text-right text-sm text-gray-800">
                                    {new Date(task.scheduledAt).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Upcoming Events */}
            {upcomingTasks.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold mb-2 px-2">Upcoming Events</h2>
                    <div className="flex flex-col gap-4">
                        {upcomingTasks.map((task) => (
                            <div
                                key={task._id}
                                onClick={() => openModal(task)}
                                className="cursor-pointer flex text-xl rounded-2xl shadow-lg font-medium justify-between items-center bg-[#F6F7FB] px-6 p-4 gap-4"
                            >
                                <div className="flex gap-4 items-center">
                                    <Image src="/Img/Logo.jpg" alt="" className="w-10 h-10"
                                        width={400}
                                        height={200}
                                    />
                                    <div>
                                        <p>{task.title}</p>
                                        <p className="text-gray-600 text-sm">{task.description}</p>
                                    </div>
                                </div>
                                <p className="text-right text-sm text-gray-800">
                                    {new Date(task.scheduledAt).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}{" "}
                                    •{" "}
                                    {new Date(task.scheduledAt).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {todayTasks.length === 0 && upcomingTasks.length === 0 && (
                <div className="text-center text-gray-600 mt-10 text-lg">
                    <p>You haven&apos;t scheduled a task Yet</p>
                </div>
            )}

            {selectedTask && <TaskDetailModal task={selectedTask} onClose={closeModal} />}
        </div>
    );
};

export default SchedulePage;
