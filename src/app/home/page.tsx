'use client'
import UserProfile from "../components/UserProfile"
import TaskCard from "../components/TaskCard"
import Calendar from "../components/Calendar"
import SchedulePage from "../components/Schedule"
import MusicCard from "../components/Music"
import { FaLongArrowAltRight } from "react-icons/fa";
import Weather from "../components/Weather"
import { useState, useEffect } from "react"
import Image from "next/image"
import NotificationBanner from "app/components/NotificationBanner"
import { useUser } from "../context/UserProvider"
import { User as FirebaseUser } from "firebase/auth"
import toast from "react-hot-toast"

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
} 

const Home = () => {
  const [newScheduledAt, setNewScheduledAt] = useState<Date | null>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useUser();

  const getAuthToken = async (): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    
    const authType = localStorage.getItem('taskly_auth_type');
    let token = localStorage.getItem('taskly_token') || '';

    if (authType === 'firebase') {
      const isFirebaseUser = (user: any): user is FirebaseUser => {
        return typeof user === "object" && user !== null && "getIdToken" in user;
      };

      if (isFirebaseUser(user)) {
        token = await user.getIdToken();
        localStorage.setItem('taskly_token', token);
      }
    }

    if (!token) throw new Error("No token found");
    return token;
  };

  const fetchTasks = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/task', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch tasks');
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  const handleAddTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to add task');
      }

      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  return (
    <>
      <div className="flex lg:flex-nowrap flex-wrap">
        <div className="lg:hidden w-full shadow shadow-lg bg-gray-300">
          <UserProfile />
        </div>
        <div className="flex flex-col p-6 bg-[#F6F7FB] lg:w-1/2 w-full">
          <div className="flex space-x-3">
            <Image src="/Img/Logo.jpg" alt="" className="bg-transparent"
              width={40}
              height={40}
            />
            <p className="font-semibold text-xl text-black">taskly</p>
          </div>
          <div className="flex justify-between">
            <h2 className="py-8 text-xl text-black">Weekly Pinned</h2>
            <button className="text-orange-400 font-semibold">View all</button>
          </div>
          
          <TaskCard 
            tasks={tasks}
            handleAddTask={handleAddTask}
            setTasks={setTasks}
          />
          
          <div className="w-full lg:hidden mt-5">
            <SchedulePage tasks={tasks} />
          </div>
          <Calendar value={newScheduledAt} onChange={setNewScheduledAt} />
        </div>
        <div className="w-full hidden lg:block">
          <SchedulePage tasks={tasks} />
        </div>
        <NotificationBanner tasks={tasks} />
        <div className="lg:w-1/2 w-full space-y-10 p-3 bg-white">
          <div className="hidden lg:block">
            <UserProfile />
          </div>
          <Weather />
          <MusicCard />
          <div className="rounded-lg p-6 shadow shadow-lg bg-gray-100 space-y-3">
            <p className="text-3xl">
              unleash the freelance super power
            </p>
            <div className="text-gray-700 font-medium text-md">
              <p>Unlimited task, premium features and much more.</p>
              <div className="flex justify-between items-center">
                <Image src="/img/bust.jpg" alt="" className="object-cover mix-blend-multiply"
                  width={100}
                  height={100}
                />
                <p className="text-2xl font-semibold bg-[#F8D57E] p-3 rounded-md">
                  <FaLongArrowAltRight className="text-black" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home