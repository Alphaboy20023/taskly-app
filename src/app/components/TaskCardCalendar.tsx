// TaskCardCalendar.tsx
import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import { useState } from "react";

const TaskCardCalendar = ({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="grid grid-cols-7 gap-1 p-2">
      {days.map((day) => (
        <button
          key={day.toISOString()}
          onClick={() => onChange(day)}
          className={`text-sm rounded-full p-1 ${
            value && isSameDay(value, day)
              ? "bg-orange-500 text-white"
              : "hover:bg-gray-300"
          }`}
        >
          {format(day, "d")}
        </button>
      ))}
    </div>
  );
};

export default TaskCardCalendar;
