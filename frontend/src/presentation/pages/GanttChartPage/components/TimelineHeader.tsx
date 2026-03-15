import React from "react";

interface TimelineHeaderProps {
  dates: string[];
  dayWidth: number;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  dates,
  dayWidth,
}) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const isWeekend = (dateStr: string): boolean => {
    const dayOfWeek = new Date(dateStr).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div
      className="flex border-b border-gray-300 bg-gray-50"
      style={{ minWidth: dates.length * dayWidth }}
    >
      {dates.map((date) => (
        <div
          key={date}
          className={`text-center text-xs border-r border-gray-200 flex-shrink-0 py-1 ${
            isWeekend(date) ? "bg-gray-100 text-gray-400" : "text-gray-600"
          }`}
          style={{ width: dayWidth }}
          title={date}
        >
          {formatDate(date)}
        </div>
      ))}
    </div>
  );
};
