// src/components/VideoCall/MeetingOptions.jsx
import React from 'react';
import { Calendar, Link, Hash } from "lucide-react";

const MeetingOptions = ({ onCreate, onJoin, workspaceName }) => (
  <div className="w-full h-full flex flex-col p-6 bg-white rounded-xl">
    <h1 className="text-2xl font-bold mb-6 text-gray-800">Meet</h1>
    
    <div className="flex gap-4">
      {/* Create a meeting link (Matches the purple button style) */}
      <button
        onClick={onCreate}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition font-semibold"
      >
        <Link size={20} />
        Create a meeting link
      </button>

      {/* Schedule a meeting (Matches the white button style) */}
      <button
        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl bg-white hover:bg-gray-50 transition"
      >
        <Calendar size={20} />
        Schedule a meeting
      </button>

      {/* Join with a meeting ID (Matches the white button style) */}
      <button
        onClick={onJoin}
        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl bg-white hover:bg-gray-50 transition"
      >
        <Hash size={20} />
        Join with a meeting ID
      </button>
    </div>

    {/* Meeting links box (Matches the lower section of the image) */}
    <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-lg">
      <div className="flex items-center gap-2 mb-2">
        <span role="img" aria-label="chain-links">🔗</span> {/* Simple icon replacement */}
        <p className="font-semibold text-gray-700">Meeting links</p>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Quickly create, save, and share links with anyone.
      </p>
      <a href="#" className="text-indigo-600 text-sm mt-2 block hover:underline">
        Learn more about meeting links
      </a>
    </div>
  </div>
);

export default MeetingOptions;