
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const PublicBettingGroupsPage = () => {
  const [groupName, setGroupName] = useState("Super Sports Betting");
  const [bets, setBets] = useState([
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
      participants: ['John', 'Alice'],

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
  ]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{groupName}</h1>
      <div style={styles.betList}>
        {bets.map((bet) => (
          <div
            key={bet.id}
            style={styles.betCard}
          >
            <h3 style={styles.betTitle}>{bet.betName}</h3>
            <p style={styles.betDescription}>{bet.description}</p>
            <div style={styles.betDetails}>
              <p><strong>Status:</strong> {bet.status}</p>
              <p><strong>Participants:</strong> {bet.participants.join(', ')}</p>
              <p><strong>Conditions:</strong> {bet.conditions}</p>
              {/* <p><strong>Current Wager:</strong> ${bet.currentWager.toLocaleString()}</p> */}
              <p><strong>Entry Fee:</strong> ${bet.entryFee}</p>
            </div>
            <Link href={`/bets/${bet.id}`}>
              <button style={styles.joinButton}>View Bet</button>
            </Link>
          </div>
        ))}
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
  betList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '30px',
    padding: '0 20px',
  },
  betCard: {
    backgroundColor: '#222',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    cursor: 'pointer',
    border: '1px solid #444',
    width: 'calc(50% - 15px)',
    minWidth: '320px',
    maxWidth: '600px',
    transition: 'transform 0.3s ease', // Add transition for smooth scaling
  },
  betCardHover: {
    transform: 'scale(1.05)',
  },
  betTitle: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1abc9c',
    textShadow: '2px 2px 6px rgba(0, 0, 0, 0.4)',
  },
  betDescription: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#ccc',
  },
  betDetails: {
    marginBottom: '20px',
    fontSize: '16px',
    color: '#bbb',
  },
  joinButton: {
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
    marginTop: 'auto',
  },
};

export default PublicBettingGroupsPage;
