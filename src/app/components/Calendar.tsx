"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { FaChevronCircleRight } from "react-icons/fa";
import { FaChevronCircleLeft } from "react-icons/fa";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // const today = new Date();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="flex justify-between items-center px-2 py-4 bg-transparent">
      <div>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
      </div>
      <div className="flex gap-5">
        <button onClick={prevMonth} className="text-2xl font-bold"><FaChevronCircleLeft /></button>
        <button onClick={nextMonth} className="text-2xl font-bold"><FaChevronCircleRight /></button>
      </div>
      <div className="text-orange-600 text-sm font-semibold">
        <p>No events</p>
      </div>
    </div>
  );

  const renderDays = () => {
    const startDate = startOfWeek(currentMonth);
    return (
      <div className="grid grid-cols-7 py-2 text-sm text-orange-500 font-medium text-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i}>{format(addDays(startDate, i), "EEE")}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const weeks = [];
    let day = startDate;

    while (day <= endDate) {
      const daysInWeek = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = day; // snapshot BEFORE incrementing
        const isDisabled = !isSameMonth(currentDay, monthStart);
        const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
        const formattedDate = format(currentDay, "d");

        daysInWeek.push(
          <div
            key={currentDay.toISOString()}
            onClick={() => setSelectedDate(currentDay)}
            className={`text-sm text-center cursor-pointer p-1 ${isDisabled ? "text-gray-300" : "text-gray-700"
              }`}
          >
            <div
              className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-colors duration-200 ${isSelected ? "bg-orange-500 text-white" : ""
                }`}
            >
              {formattedDate}
            </div>
          </div>
        );

        day = addDays(day, 1);
      }


      weeks.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-y-1">
          {daysInWeek}
        </div>
      );
    }

    return <div className="space-y-1">{weeks}</div>;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {renderHeader()}

      <div className="bg-white p-4 shadow rounded-xl">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}

export default Calendar;
