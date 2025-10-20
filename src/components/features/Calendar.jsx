// Calendar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hash, Users, Plus, Calendar as CalendarIcon } from 'lucide-react';
import ScheduleForm from './ScheduleForm'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Hardcoded colors for a standalone file
const COLORS = {
  purple: '#6b21a8', 
};

// Data setup
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// Calendar is visually anchored from 6 PM onwards
const HOURS = Array.from({ length: 7 }, (_, i) => `${(i + 6) % 12 === 0 ? 12 : (i + 6) % 12}:00 PM`); 

export default function Calendar() {
  const [view, setView] = useState('calendar'); 
  const [scheduleDate, setScheduleDate] = useState(new Date(2025, 9, 21, 18, 0).toISOString().substring(0, 16)); 
  
  // ⭐️ STATE: Contains all saved meeting data ⭐️
  const [meetings, setMeetings] = useState([
    // Hardcoded initial meeting (Mon, Oct 20, 6:00 PM - 8:00 PM)
    {
        id: 1,
        title: "Team Sync Up",
        startDate: new Date(2025, 9, 20, 18, 0).toISOString(), 
        endDate: new Date(2025, 9, 20, 20, 0).toISOString(),   
    }
  ]);
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 20)); 

  // Function passed to ScheduleForm to save the meeting
  const handleSaveMeeting = (meetingData) => {
      // Basic validation
      if (new Date(meetingData.startDate) >= new Date(meetingData.endDate)) {
    toast.error("Error: Start time must be before end time.");
    return;
}

      const newMeeting = { ...meetingData, id: Date.now() };
      setMeetings(m => [...m, newMeeting]);
      setView('calendar');
  };
  
  const getWeekDates = (start) => {
    return WEEK_DAYS.map((_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDates = getWeekDates(currentDate);

  const handleDayClick = (date, hourIndex) => {
    const scheduledDate = new Date(date);
    const hour = (6 + hourIndex); 
    scheduledDate.setHours(hour, 0, 0, 0); 
    
    setScheduleDate(scheduledDate.toISOString().substring(0, 16));
    setView('scheduleForm'); 
  };

  const handleNewMeeting = () => {
      const now = new Date();
      now.setMinutes(0); 
      setScheduleDate(now.toISOString().substring(0, 16)); 
      setView('scheduleForm');
  }

  const CalendarGrid = () => {
    
    const startHour = 18; // 6 PM (Calendar visual start time)
    const PIXELS_PER_MINUTE = 64 / 60; // 64px slot height divided by 60 minutes

    return (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col h-[90vh] max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Calendar Header (Top Bar) */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center text-xl font-semibold text-gray-800">
              <button className="text-sm border py-1 px-3 rounded-md hover:bg-gray-100 mr-4">Today</button>
              <button 
                className="p-1 hover:bg-gray-100 rounded" 
                onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
              >
                <ChevronLeft size={20}/>
              </button>
              <button 
                className="p-1 hover:bg-gray-100 rounded mr-4" 
                onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
              >
                <ChevronRight size={20}/>
              </button>
              <span className="text-base font-semibold mr-4">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"><Hash size={18} className="mr-1"/> Join with an ID</button>
                <button className="flex items-center px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"><Users size={18} className="mr-1"/> Meet now</button>
                <button 
                    className="flex items-center px-4 py-2 text-sm text-white rounded-lg transition font-medium"
                    style={{ backgroundColor: COLORS.purple }} 
                    onClick={handleNewMeeting} 
                >
                    <Plus size={18} className="mr-1"/> New meeting
                </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="flex-1 grid" style={{ gridTemplateColumns: '50px repeat(5, 1fr)' }}>
            {/* Time Column Header */}
            <div className="sticky top-0 bg-white border-r border-b"></div> 
            
            {/* Day Headers */}
            {weekDates.map((date, colIndex) => (
              <div 
                key={colIndex} 
                className="h-16 text-center py-2 border-r border-b font-medium text-gray-700"
              >
                <div className="text-sm">{WEEK_DAYS[colIndex]}</div>
                <div className={`text-2xl ${date.toDateString() === new Date(2025, 9, 21).toDateString() ? 'text-purple-600 font-bold' : ''}`}>
                    {date.getDate()}
                </div>
              </div>
            ))}
            
            {/* Time and Slots Grid */}
            <div className="col-span-full grid relative" style={{ gridTemplateColumns: '50px repeat(5, 1fr)', height: '100%', maxHeight: 'calc(90vh - 70px)', overflowY: 'auto' }}>
                
                {/* ⭐️ RENDER MEETINGS HERE ⭐️ */}
                {meetings.map(meeting => {
                    const start = new Date(meeting.startDate);
                    const end = new Date(meeting.endDate);
                    
                    const dayIndex = weekDates.findIndex(date => date.toDateString() === start.toDateString());
                    
                    if (dayIndex === -1) return null; 

                    const startMinutes = start.getHours() * 60 + start.getMinutes();
                    const endMinutes = end.getHours() * 60 + end.getMinutes();

                    // Calculate position relative to 6 PM (1080 minutes from midnight)
                    const minutesFromVisibleStart = startMinutes - (startHour * 60);

                    if (minutesFromVisibleStart < 0) return null; 

                    // Convert minutes to pixels (64px per hour slot)
                    const topPos = minutesFromVisibleStart * PIXELS_PER_MINUTE; 
                    const height = (endMinutes - startMinutes) * PIXELS_PER_MINUTE;

                    // Grid column starts at 2 (1 for time column + dayIndex)
                    const gridColumnStart = dayIndex + 2; 

                    return (
                        <div 
                            key={meeting.id}
                            className="absolute bg-purple-600/90 border-l-4 border-purple-900 text-white p-1 text-xs overflow-hidden cursor-pointer rounded-sm hover:z-10 hover:shadow-lg transition-shadow"
                            style={{
                                gridColumn: `${gridColumnStart} / ${gridColumnStart + 1}`,
                                top: `${topPos}px`,
                                height: `${height}px`,
                                left: 0, // 👈 FIX: Force it to the start of the grid track
                                right: 0, // 👈 FIX: Force it to the end of the grid track, making it span 
                                zIndex: 10, 
                            }}
                        >
                            <div className="font-semibold truncate">{meeting.title}</div>
                            <div className="text-xs opacity-80">{`${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</div>
                        </div>
                    );
                })}


                {HOURS.map((hour, hourIndex) => (
                    <React.Fragment key={hourIndex}>
                        {/* Time Label */}
                        <div className="text-xs text-gray-500 text-right pr-1 pt-1 border-b" style={{ minHeight: '64px', gridColumn: '1 / 2' }}>
                            {hour.replace(':00 PM', ' PM')}
                        </div>
                        
                        {/* Day Slots */}
                        {weekDates.map((date, colIndex) => (
                            <div 
                                key={`${colIndex}-${hourIndex}`} 
                                className="border-b border-r border-gray-100 hover:bg-purple-50/50 transition duration-100 cursor-pointer relative"
                                style={{ minHeight: '64px' }}
                                onClick={() => handleDayClick(date, hourIndex)}
                            >
                                {/* Simulated Red Time Bar (Current Time Indicator) */}
                                {colIndex === 0 && hourIndex === 1 && (
                                    <div className="absolute top-1/2 left-0 w-full h-px bg-red-500 translate-y-[-50%] z-10"></div>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
          </div>
        </motion.div>
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
    <ToastContainer />
        <AnimatePresence mode="wait">
            {view === 'calendar' ? (
                <CalendarGrid key="calendar-view" />
            ) : (
                <motion.div 
                    key="schedule-form-view" 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <ScheduleForm 
                        initialDate={scheduleDate}
                        onClose={() => setView('calendar')}
                        onSave={handleSaveMeeting}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}