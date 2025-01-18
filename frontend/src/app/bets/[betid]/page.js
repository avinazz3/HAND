'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const bets = [
  {
      id: 1,
      name: 'Super Bowl Bet',
      group_id: 1,
      creator_id: 22,
      description: 'Place your bets for the upcoming Super Bowl!',
      reward_type: 'coffee',
      target_quantity: 100,
      bet_type: "one_to_many",
      is_active: true,
      status: 'Active',
      required_witnesses: 2,
      verification_deadline: '2022-02-13T00:00:00Z',
      created_at: '2022-01-13T00:00:00Z',
      currentQuantity: 50,
      participants: ['Bob', 'Charlie'],
  },
  {
    id: 2,
    name: "Stock Market Challenge",
    group_id: null, // Or assign a group ID if applicable
    creator_id: 22, // Assuming the same creator
    description: "Bet on the performance of various stocks over the next year.",
    reward_type: "cash", // Or specify the desired reward
    target_quantity: null, // Not applicable for this bet type
    bet_type: "one_to_many", // Or "many_to_many" if multiple participants bet against each other
    is_active: true,
    status: "Active",
    required_witnesses: 1, // Adjust as needed
    verification_deadline: "2023-01-13T00:00:00Z", // Adjust for the next year
    created_at: "2022-01-13T00:00:00Z", 
    currentQuantity: 100, // Number of participants or current value
    participants: ['Bob', 'Charlie'],
  },
];

const BetDetailsPage = () => {
  const params = useParams();
  const betId = params?.betid;
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBetDetails = async () => {
      try {
        if (betId === undefined) {
          return;
        }
        const dummyBet = bets.find((b) => b.id === parseInt(betId));
        if (dummyBet) {
          setBet(dummyBet);
        } else {
          setError('Bet not found');
        }
      } catch (err) {
        setError('Failed to fetch bet details');
      } finally {
        setLoading(false);
      }
    };

    fetchBetDetails();
  }, [betId]);

  const handleJoinBet = () => {
    // Implement the logic to join the bet here
    console.log(`Joined bet with ID: ${betId}`);
    // You might want to update the UI or make an API call here
  };

  if (loading) return <div style={styles.loadingError}>Loading...</div>;
  if (error) return <div style={styles.loadingError}>{error}</div>;
  if (!bet) return <div style={styles.loadingError}>Bet not found</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{bet.name}</h1>
      <p style={styles.description}>{bet.description}</p>
      <div style={styles.details}>
        <p><strong>Status:</strong> {bet.status}</p>
        <p><strong>Participants:</strong> {bet.participants.join(', ')}</p>
        {/* <p><strong>Conditions:</strong> {bet.conditions}</p> */}
        <p><strong>Current Wager:</strong> {bet.currentQuantity + ' ' + bet.reward_type}</p>
        {/* <p><strong>Entry Fee:</strong> {bet.entryFee}</p> */}
      </div>
      <div style={styles.buttonContainer}>
        <button onClick={handleJoinBet} style={styles.joinButton}>Join Bet</button>
        <Link href="/bets">
          <button style={styles.backButton}>Back to other bets</button>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#111',
    color: '#fff',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    fontSize: '48px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '40px',
    color: '#fff',
    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
  },
  description: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#ccc',
  },
  details: {
    fontSize: '16px',
    marginBottom: '20px',
    color: '#bbb',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
  },
  joinButton: {
    padding: '12px 30px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    padding: '12px 30px',
    backgroundColor: '#1abc9c',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  loadingError: {
    fontSize: '24px',
    color: '#fff',
    textAlign: 'center',
    marginTop: '50px',
  },
};

export default BetDetailsPage;
