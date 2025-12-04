import React, { useState, useMemo } from 'react';
import { Task, Status, Priority } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedTaskId, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar days
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  
  // Starting day of week (0 = Sunday, 1 = Monday, etc.)
  const startingDayOfWeek = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  
  // Create array of all days to display
  const calendarDays: (number | null)[] = [];
  
  // Add previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push(null); // Placeholder for previous month
  }
  
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  // Add next month's days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(null);
  }

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      if (task.due_date) {
        const date = new Date(task.due_date);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  // Check if a date is today
  const isToday = (day: number | null) => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Get date string for a calendar day
  const getDateString = (day: number | null) => {
    if (day === null) return null;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-red-100 text-red-700 border-red-200';
      case Priority.MEDIUM:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case Priority.LOW:
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Get status color
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.TODO:
        return 'text-slate-600';
      case Status.IN_PROGRESS:
        return 'text-blue-600';
      case Status.REVIEW:
        return 'text-amber-600';
      case Status.DONE:
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium text-slate-600"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-slate-600 py-2 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
        {calendarDays.map((day, idx) => {
          const dateStr = getDateString(day);
          const dayTasks = dateStr ? tasksByDate[dateStr] || [] : [];
          const isTodayDate = isToday(day);

          if (day === null) {
            return (
              <div key={`empty-${idx}`} className="h-24 bg-white rounded border border-slate-100" />
            );
          }

          return (
            <div
              key={`day-${day}`}
              className={`h-24 border rounded p-2 cursor-pointer transition-all hover:shadow-md ${
                isTodayDate
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                  : dayTasks.length > 0
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Day number */}
              <div className={`text-xs font-bold mb-1 ${isTodayDate ? 'text-blue-700' : 'text-slate-600'}`}>
                {day}
              </div>

              {/* Tasks for this day */}
              <div className="space-y-1 overflow-y-auto max-h-16 custom-scrollbar">
                {dayTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTask(task.id);
                    }}
                    className={`text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer transition-all ${
                      selectedTaskId === task.id
                        ? 'ring-2 ring-brand-500 ring-offset-1'
                        : 'hover:shadow-sm'
                    } ${getPriorityColor(task.priority)}`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[9px] text-slate-500 px-1.5 font-medium">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Legend / Info */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Priority Legend</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
            <span className="text-xs text-slate-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
            <span className="text-xs text-slate-600">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
            <span className="text-xs text-slate-600">Low Priority</span>
          </div>
        </div>
      </div>

      {/* No tasks message */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar size={32} className="text-slate-300 mb-2" />
          <p className="text-slate-400 text-sm">No tasks scheduled</p>
        </div>
      )}
    </div>
  );
};
