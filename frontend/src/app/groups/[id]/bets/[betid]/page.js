"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ContributionPopup from './ContributionPopup';
import axiosInstance from '@/app/utils/axiosInstance';

const BetDetailsPage = () => {
  const params = useParams();
  const groupId = params?.id;
  const betId = params?.betId;
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBetDetails = async () => {
      if (!betId) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/bets/${betId}`);
        setBet(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch bet details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBetDetails();
  }, [betId]);

  const handleContribution = async ({ amount, position }) => {
    try {
      await axiosInstance.post('/api/bets/contribute', {
        bet_id: betId,
        bet_side: position,
        quantity: amount
      });
      // Refresh bet data after contribution
      const response = await axiosInstance.get(`/api/bets/${betId}`);
      setBet(response.data);
      alert('Contribution successful!');
    } catch (err) {
      console.error(err);
      alert('Failed to contribute. Please try again.');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!bet) return <NotFoundState />;

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white p-6 md:p-12 pt-[70px]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href={`/groups/${groupId}`} className="flex items-center text-teal-400 hover:text-teal-300 transition">
            <ChevronLeft className="mr-2" /> Back to Group
          </Link>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              bet.status === "active" ? "bg-teal-500/20 text-teal-300" :
              bet.status === "completed" ? "bg-green-500/20 text-green-300" :
              "bg-gray-700/50 text-gray-300"
            }`}>{bet.status}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr,1fr] gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-teal-400">{bet.description}</h1>
            
            <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 backdrop-blur-sm border border-gray-700/50">
              <div className="grid grid-cols-3 gap-4">
                <StatCard 
                  label="Reward Type" 
                  value={bet.reward_type} 
                />
                <StatCard 
                  label="Target" 
                  value={`${bet.target_quantity}`} 
                />
                <StatCard 
                  label="Current Total" 
                  value={`${bet.current_total || 0}`} 
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Progress</h3>
                <div className="h-4 w-full bg-gray-700 rounded-full mb-2">
                  <div 
                    className="h-full bg-teal-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((bet.current_total || 0) / bet.target_quantity) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-gray-300">
                  {bet.current_total || 0} / {bet.target_quantity} ({Math.floor(((bet.current_total || 0) / bet.target_quantity) * 100)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 text-teal-400">Contribute</h2>
            <div className="space-y-4">
              <ContributionPopup
                onSubmit={handleContribution}
                onClose={() => {}}
                poolTotal={bet.current_total || 0}
                rewardType={bet.reward_type}
                betType={bet.bet_type}
              />
            </div>
            
            <div className="mt-6 text-sm text-gray-400">
              <p>Required Witnesses: {bet.required_witnesses}</p>
              <p>Verification Deadline: {bet.verification_deadline 
                ? new Date(bet.verification_deadline).toLocaleDateString() 
                : 'N/A'}</p>
              <p>Created: {new Date(bet.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatCard = ({ label, value }) => (
  <div className="bg-gray-700/50 p-4 rounded-lg">
    <p className="text-gray-300 text-sm mb-2">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400"></div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
    <div className="text-center">
      <h2 className="text-3xl mb-4">Oops! Something went wrong</h2>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
    <div className="text-center">
      <h2 className="text-3xl mb-4">Bet Not Found</h2>
      <p className="text-gray-400">The bet you're looking for doesn't exist.</p>
    </div>
  </div>
);

export default BetDetailsPage;