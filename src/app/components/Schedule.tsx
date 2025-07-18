'use client';

import { useEffect, useMemo, useState, useCallback } from "react";
import TaskDetailModal from "./TaskDetailModal";
import Image from "next/image";
import toast from "react-hot-toast";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from 'app/lib/firebase';
import { useRouter } from 'next/navigation';

export type Task = {
    _id: string;
    title: string;
    description: string;
    scheduledAt: string;
};

type StoredUser = {
  uid: string;
  email?: string;
};

const SchedulePage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [user, setUser] = useState<User | StoredUser | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const router = useRouter();

    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const getToken = async () => {
        if (!user) return null;

        if ('getIdToken' in user && typeof (user as User).getIdToken === 'function') {
            try {
                const idToken = await (user as User).getIdToken(true);
                return idToken;
            } catch (error) {
                console.error("Error refreshing ID token in SchedulePage:", error);
                return null;
            }
        }
        return null;
    };

    const safeParseJSON = async (res: Response) => {
        const text = await res.text();
        try {
            return text ? JSON.parse(text) : null;
        } catch (e) {
            console.error('Failed to parse JSON response in SchedulePage:', e, 'Response text:', text);
            return null;
        }
    };

    const fetchTasks = useCallback(async () => {
        try {
            const idToken = await getToken();

            if (!idToken) {
                setTasks([]);
                toast.error('Authentication required to view schedule.');
                return;
            }

            const res = await fetch("/api/task", {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
                cache: 'no-store',
            });

            if (!res.ok) {
                const errorBody = await safeParseJSON(res);
                if (res.status === 401) {
                    toast.error('Session expired. Please log in again.');
                    router.push('/login');
                    setTasks([]);
                    return;
                }
                throw new Error(errorBody?.error || `Failed to fetch tasks with status: ${res.status}`);
            }

            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error("API did not return an array of tasks:", data);
                setTasks([]);
                toast.error("Failed to load tasks due to unexpected data format.");
                return;
            }

            const filtered = data.filter((task: Task) => {
                const taskDate = new Date(task.scheduledAt);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate >= today;
            });
            setTasks(filtered);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setTasks([]);
            toast.error("An error occurred while fetching tasks.");
        }
    }, [setTasks, today, user, router]);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
            } else {
                setUser(null);
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isAuthReady) {
            if (user) {
                fetchTasks();
            } else {
                setTasks([]);
            }
        }
    }, [user, isAuthReady, fetchTasks, setTasks]);


    useEffect(() => {
        const handleUpdate = () => {
            if (user && isAuthReady) {
                fetchTasks();
            }
        };
        window.addEventListener("tasks-updated", handleUpdate);
        return () => window.removeEventListener("tasks-updated", handleUpdate);
    }, [fetchTasks, user, isAuthReady]);

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

    if (!isAuthReady) {
        return (
            <div className="p-4 w-full bg-white flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Loading schedule...</p>
            </div>
        );
    }

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


