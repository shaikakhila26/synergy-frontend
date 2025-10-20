// src/components/VideoCall/JoinMeetingForm.jsx
import React, { useState } from 'react';

const JoinMeetingForm = ({ onJoin, onCancel }) => {
  const [inputID, setInputID] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputID.trim()) {
      onJoin(inputID.trim());
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-xl p-8">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Join Meeting</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputID}
            onChange={(e) => setInputID(e.target.value)}
            placeholder="Enter Meeting ID"
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={!inputID.trim()}
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinMeetingForm;