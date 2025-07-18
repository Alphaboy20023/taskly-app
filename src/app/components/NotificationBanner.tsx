"use client";
import { useEffect, useState } from "react";
import { differenceInMinutes } from "date-fns";

type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
};

type Props = {
  tasks: Task[];
};

const NotificationBanner = ({ tasks }: Props) => {
  const [lastAlertedTaskId, setLastAlertedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const checkUpcomingTask = () => {
      const now = new Date();

      const filteredTasks = tasks
        .map((task) => {
          const taskTime = new Date(task.scheduledAt);
          const minutesAway = differenceInMinutes(taskTime, now);
          return { task, minutesAway };
        })
        .filter(({ minutesAway }) => minutesAway >= 0 && minutesAway <= 60);

      if (filteredTasks.length > 0) {
      
        filteredTasks.sort((a, b) => a.minutesAway - b.minutesAway);
        const { task, minutesAway } = filteredTasks[0];

        if (task._id !== lastAlertedTaskId) {
          alert(`⏰ Reminder: "${task.title}" is due in ${minutesAway} minute(s)!`);
          setLastAlertedTaskId(task._id);
        }
      }
    };

    checkUpcomingTask(); 
    const interval = setInterval(checkUpcomingTask, 5 * 60 * 1000); // every 5 mins
    return () => clearInterval(interval);
  }, [tasks, lastAlertedTaskId]);

  return null; 
};

export default NotificationBanner;
