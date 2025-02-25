"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/app/utils/axiosInstance';
import { ChevronLeft } from 'lucide-react';

export default function CreateBetPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id;
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    reward_type: 'money',
    target_quantity: 100,
    bet_type: 'one_to_many',
    required_witnesses: 2,
    verification_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });
  
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axiosInstance.get(`/api/groups/${groupId}`);
        setGroup(response.data);
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Failed to load group information.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroup();
  }, [groupId]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        group_id: groupId
      };
      
      const response = await axiosInstance.post('/api/bets/', payload);
      router.push(`/groups/${groupId}/bets/${response.data.id}`);
    } catch (err) {
      console.error('Error creating bet:', err);
      setError('Failed to create bet. Please try again.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-[70px]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/groups/${groupId}/bets`} className="flex items-center text-teal-400 hover:text-teal-300">
            <ChevronLeft className="mr-2" /> Back to Bets
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-8">
          <span className="text-teal-400">Create</span> New Bet
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}
        
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="description">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Alex can run 5km under 25 minutes"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Be specific about what needs to be accomplished
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="reward_type">
                  Reward Type
                </label>
                <select
                  id="reward_type"
                  name="reward_type"
                  value={formData.reward_type}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="money">Money</option>
                  <option value="coffee">Coffee</option>
                  <option value="lunch">Lunch</option>
                  <option value="pushups">Pushups</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="target_quantity">
                  Target Quantity
                </label>
                <input
                  type="number"
                  id="target_quantity"
                  name="target_quantity"
                  value={formData.target_quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Units of {formData.reward_type} at stake
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Bet Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg cursor-pointer border ${
                    formData.bet_type === 'one_to_many'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, bet_type: 'one_to_many' }))}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="one_to_many"
                      name="bet_type"
                      value="one_to_many"
                      checked={formData.bet_type === 'one_to_many'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="one_to_many" className="font-medium">One vs Many</label>
                  </div>
                  <p className="text-sm text-gray-400">
                    One person will complete a challenge while others contribute to the reward pool
                  </p>
                </div>
                
                <div
                  className={`p-4 rounded-lg cursor-pointer border ${
                    formData.bet_type === 'many_to_many'
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, bet_type: 'many_to_many' }))}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      id="many_to_many"
                      name="bet_type"
                      value="many_to_many"
                      checked={formData.bet_type === 'many_to_many'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="many_to_many" className="font-medium">Team vs Team</label>
                  </div>
                  <p className="text-sm text-gray-400">
                    People bet on different sides of a proposition
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="required_witnesses">
                  Required Witnesses
                </label>
                <input
                  type="number"
                  id="required_witnesses"
                  name="required_witnesses"
                  value={formData.required_witnesses}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of people needed to verify completion
                </p>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="verification_deadline">
                  Verification Deadline
                </label>
                <input
                  type="date"
                  id="verification_deadline"
                  name="verification_deadline"
                  value={formData.verification_deadline}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  When the bet must be completed by
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Link
                href={`/groups/${groupId}/bets`}
                className="px-6 py-2 mr-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Creating...' : 'Create Bet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}