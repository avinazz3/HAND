"use client";

import React, { useState } from 'react';

const JoinGroupDialog = ({ isOpen, onClose, onJoin, group }) => {
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onJoin();
      onClose();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to join group');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">
          Join {group?.name}
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-gray-300">
            Are you sure you want to join this group? You will be able to:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>View and participate in all group bets</li>
            <li>Create new bets within the group</li>
            <li>Interact with other group members</li>
          </ul>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Join Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupDialog;
