"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/app/utils/axiosInstance';
import { ChevronLeft, Plus, Filter } from 'lucide-react';

export default function BetsListPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id;
  
  const [bets, setBets] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed', 'pending'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch group details
        const groupResponse = await axiosInstance.get(`/api/groups/${groupId}`);
        setGroup(groupResponse.data);
        
        // Fetch bets for this group
        const betsResponse = await axiosInstance.get(`/api/groups/${groupId}/bets`);
        setBets(betsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load bets. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [groupId]);

  const filteredBets = bets.filter(bet => {
    if (filterStatus === 'all') return true;
    return bet.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
          <p className="mb-4">{error}</p>
          <Link href={`/groups/${groupId}`} className="text-teal-400 hover:text-teal-300">
            Return to Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-[70px]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href={`/groups/${groupId}`} className="flex items-center text-teal-400 hover:text-teal-300">
            <ChevronLeft className="mr-2" /> Back to {group?.name || 'Group'}
          </Link>
          
          <button 
            onClick={() => router.push(`/groups/${groupId}/bets/create`)}
            className="flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-2" /> New Bet
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-6">
          <span className="text-teal-400">Bets</span> in {group?.name}
        </h1>
        
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-gray-300">Filter by status:</span>
          </div>
          <div className="flex space-x-2">
            {['all', 'active', 'completed', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filterStatus === status 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {filteredBets.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center backdrop-blur-sm border border-gray-700/50">
            <p className="text-gray-400 mb-4">No bets found with the selected filter.</p>
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="text-teal-400 hover:text-teal-300"
              >
                View all bets
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBets.map((bet) => (
              <Link key={bet.id} href={`/groups/${groupId}/bets/${bet.id}`}>
                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-teal-400">{bet.description}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bet.status === "active" ? "bg-teal-500/20 text-teal-300" :
                      bet.status === "completed" ? "bg-green-500/20 text-green-300" :
                      "bg-gray-700/50 text-gray-300"
                    }`}>
                      {bet.status}
                    </span>
                  </div>
                  
                  <div className="text-gray-300 mb-4">
                    <p>Type: {bet.bet_type === "one_to_many" ? "One vs Many" : "Team vs Team"}</p>
                    <p>Reward: {bet.reward_type}</p>
                    <p>Target: {bet.target_quantity}</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Progress</p>
                    <div className="h-2 w-full bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-teal-500 rounded-full" 
                        style={{ width: `${Math.min(100, ((bet.current_total || 0) / bet.target_quantity) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {bet.current_total || 0} / {bet.target_quantity}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}