"use client"
import axiosInstance from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ContributionPopup from './ContributionPopup';
import BettingPopup from './ContributionPopup';  // Adjust the path according to your project structure

const BetDetailsPage = () => {
  const params = useParams();
  const betId = params?.betid;
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBetDetails = async () => {
      if (!betId) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/bets/${betId}`);
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

  const handleTrade = async (type, amount) => {
    try {
      await axiosInstance.post('/contribute', {
        bet_id: betId,
        bet_side: type,
        quantity: amount,
        user_id: "user_id", // Replace with actual user ID retrieval logic
      });
      alert(`Successfully placed a ${type} trade for bet ${betId} with amount ${amount}`);
    } catch (err) {
      console.error(err);
      alert('Failed to place trade. Please try again.');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!bet) return <NotFoundState />;

  return (
    <div className="bg-[#121212] min-h-screen text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/bets" className="flex items-center text-gray-400 hover:text-white transition">
            <ChevronLeft className="mr-2" /> Back to Markets
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-green-500 font-semibold">Live Market</span>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr,1fr] gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{bet.name}</h1>
            <p className="text-gray-400 mb-6">{bet.description}</p>

            <div className="bg-[#1E1E1E] rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <StatCard 
                  label="Current Price" 
                  value={`$${(bet.currentQuantity && bet.target_quantity)
                    ? (bet.currentQuantity / bet.target_quantity).toFixed(2)
                    : 'N/A'}`} 
                />
                <StatCard 
                  label="Total Volume" 
                  value={`$${bet.currentQuantity?.toLocaleString() || '0'}`} 
                />
                <StatCard 
                  label="Liquidity" 
                  value={`$${(bet.target_quantity && bet.currentQuantity)
                    ? (bet.target_quantity - bet.currentQuantity).toLocaleString()
                    : 'N/A'}`} 
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Trade Market</h2>
            <div className="space-y-4">
  {bet.bet_type === 'one_to_many' ? (
    <ContributionPopup
      onSubmit={(amount) => handleTrade('CONTRIBUTE', amount)}
      label="Contribute"
    />
  ) : (
    <>
      <BettingPopup
        onSubmit={(amount) => handleTrade('BUY', amount)}
        betType="many_to_many"
        rewardType="units" // Ensure this matches your requirements
      />
      <BettingPopup
        onSubmit={(amount) => handleTrade('SELL', amount)}
        betType="many_to_many"
        rewardType="units" // Ensure this matches your requirements
      />
    </>
  )}
</div>
            <div className="mt-6 text-sm text-gray-500">
              <p>Participants: {Array.isArray(bet.participants) && bet.participants.length > 0 
                ? bet.participants.join(', ') 
                : 'No participants yet'}</p>
              <p>Verification Deadline: {bet.verification_deadline 
                ? new Date(bet.verification_deadline).toLocaleDateString() 
                : 'N/A'}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatCard = ({ label, value }) => (
  <div className="bg-[#2A2A2A] p-4 rounded-lg">
    <p className="text-gray-400 text-sm mb-2">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const LoadingState = () => (
  <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
    <div className="animate-pulse">Loading Market...</div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
    <div className="text-center">
      <h2 className="text-3xl mb-4">Oops! Something went wrong</h2>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
    <div className="text-center">
      <h2 className="text-3xl mb-4">Market Not Found</h2>
      <p className="text-gray-400">The market you're looking for doesn't exist.</p>
    </div>
  </div>
);

export default BetDetailsPage;
