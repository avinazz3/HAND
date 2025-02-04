"use client";

import React, { useState } from 'react';
import axiosInstance from '@/app/utils/axiosInstance';

const PremiumDialog = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRenew, setAutoRenew] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/api/subscriptions/premium', {
        auto_renew: autoRenew
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">
          Upgrade to Premium
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Premium Benefits:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Create unlimited groups</li>
              <li>Access to premium features (coming soon)</li>
              <li>Priority support</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="text-lg font-semibold text-white mb-2">
              Subscription Details:
            </div>
            <ul className="text-gray-300 space-y-2">
              <li>• One month of premium access</li>
              <li>• Cancel anytime</li>
              <li>• $9.99/month</li>
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
            />
            <label htmlFor="autoRenew" className="text-gray-300">
              Auto-renew subscription monthly
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDialog;
