// ScheduleForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, MapPin, Repeat, Calendar as CalendarIcon, X, Plus } from 'lucide-react';

// Hardcoded colors for a standalone file
const COLORS = {
  purple: '#6b21a8', 
};

// This component now takes onSave as a prop.
export default function ScheduleForm({ initialDate, onClose, onSave }) {
    const initialDateTime = initialDate || new Date().toISOString().substring(0, 16);

    const [title, setTitle] = useState('');
    const [attendees, setAttendees] = useState('');
    const [startDate, setStartDate] = useState(initialDateTime);
    const [endDate, setEndDate] = useState(initialDateTime);
    const [details, setDetails] = useState('');
    const [location, setLocation] = useState('');

    const handleSave = () => {
        const meetingData = {
            title: title || 'New Meeting',
            attendees: attendees.split(',').map(e => e.trim()).filter(e => e),
            startDate,
            endDate,
            details,
            location
        };
        
        // ⭐️ Call the parent's save function ⭐️
        onSave(meetingData); 
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col h-[90vh] max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center text-xl font-semibold text-gray-800">
                    <CalendarIcon size={24} className="mr-2 text-purple-600" /> New meeting Details
                </div>
                <div className="flex gap-2">
                    <button 
                        className="px-4 py-2 text-sm text-white rounded-lg transition font-medium"
                        style={{ backgroundColor: COLORS.purple }} 
                        onClick={handleSave}
                    >
                        Save
                    </button>
                    <button 
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        onClick={onClose}
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Form Details */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    <div className="text-sm text-gray-500">
                        Time zone: (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi
                    </div>
                    
                    
                    {/* Title */}
                    <div className="pb-3">
                        <input 
                            type="text"
                            placeholder="Add title"
                            className="w-full p-2 border-b-2 focus:border-purple-600 outline-none text-xl font-medium"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Attendees */}
                    <div className="flex items-center border-b border-gray-200 py-1">
                        <Users size={20} className="text-gray-400 mr-3" />
                        <input 
                            type="text"
                            placeholder="Enter name or e-mail"
                            className="flex-1 outline-none p-2"
                            value={attendees}
                            onChange={(e) => setAttendees(e.target.value)}
                        />
                    </div>

                    {/* Date and Time Pickers */}
                    <div className="flex items-center space-x-4 pt-1">
                        <Clock size={20} className="text-gray-400" />
                        
                        {/* Start Date & Time */}
                        <input 
                            type="date" 
                            className="p-2 border rounded-lg text-sm"
                            value={startDate.substring(0, 10)}
                            onChange={(e) => setStartDate(e.target.value + startDate.substring(10))}
                        />
                        <input 
                            type="time" 
                            className="p-2 border rounded-lg text-sm"
                            value={startDate.substring(11, 16)}
                            onChange={(e) => setStartDate(startDate.substring(0, 11) + e.target.value)}
                        />
                        <span>-</span>
                        
                        {/* End Date & Time */}
                        <input 
                            type="date" 
                            className="p-2 border rounded-lg text-sm"
                            value={endDate.substring(0, 10)}
                            onChange={(e) => setEndDate(e.target.value + endDate.substring(10))}
                        />
                        <input 
                            type="time" 
                            className="p-2 border rounded-lg text-sm"
                            value={endDate.substring(11, 16)}
                            onChange={(e) => setEndDate(endDate.substring(0, 11) + e.target.value)}
                        />
                        
                        <div className="text-sm text-gray-500">30m</div>
                        <button className="flex items-center text-sm p-2 border rounded-lg hover:bg-gray-100">All day</button>
                    </div>

                    {/* Repeat */}
                    <div className="flex items-center space-x-4 py-1">
                        <Repeat size={20} className="text-gray-400" />
                        <button className="flex items-center text-sm p-2 border rounded-lg hover:bg-gray-100">Does not repeat</button>
                    </div>

                    {/* Location */}
                    

                    {/* Details/Body (Rich Text Editor Mockup) */}
                    <div className="border border-gray-200 rounded-lg p-3">
                        {/* Toolbar Placeholder */}
                        <div className="flex border-b pb-2 mb-2 text-gray-600 text-sm space-x-4">
                           <span className="font-bold border rounded p-1 hover:bg-gray-100">B</span>
                           <span className="italic border rounded p-1 hover:bg-gray-100">I</span>
                           <span className="underline border rounded p-1 hover:bg-gray-100">U</span>
                           <select className="border rounded px-1 text-sm">
                               <option>Paragraph</option>
                           </select>
                           <button className='hover:bg-gray-100 rounded p-1'><Plus size={16}/></button>
                        </div>
                        <textarea 
                            placeholder="Type details for this new meeting"
                            className="w-full h-40 outline-none resize-none p-2"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>

                </div>

                {/* Right Side: Options Panel */}
                <div className="w-72 border-l p-6 bg-gray-50 space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Who can bypass the lobby?</label>
                        <select className="w-full p-2 border rounded-lg text-sm">
                            <option>People who were invited</option>
                            <option>Everyone</option>
                            <option>Only me</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Who can present</label>
                        <select className="w-full p-2 border rounded-lg text-sm">
                            <option>Everyone</option>
                            <option>Specific people</option>
                            <option>Only organizers</option>
                        </select>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}