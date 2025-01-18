'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const my_groups = [
  {
    id: 1,
    groupName: 'NFL Fans',
    join_code: 12312,
    is_private: true,
    isMember: true,
    created_at: "2022-01-13T00:00:00Z",
    bets: [
      { id: 1, betName: 'Super Bowl Winner', description: 'Bet on who will win the Super Bowl', status: 'Active' },
    ],
  },
];

const groups_member_is_not_in = [
  {
    id: 2,
    groupName: 'Stock Market Enthusiasts',
    join_code: 32131,
    is_private: false,
    isMember: false,
    created_at: "2022-01-13T00:00:00Z",
    bets: [],
  },
  {
    id: 3,
    groupName: 'Space Exploration Bettors',
    join_code: 23132,
    is_private: true,
    isMember: false,
    created_at: "2022-01-13T00:00:00Z",
    bets: [],
  },
];

const BettingGroupsPage = () => {
  const [my_group_data] = useState(my_groups);
  const [non_member_data] = useState(groups_member_is_not_in);

  const memberGroups = my_group_data; // Already contains only groups the user is a member of.
  const publicGroups = non_member_data.filter(group => !group.is_private); // Filters public groups the user can join.

  const handleLeaveGroup = (groupId) => {
    alert(`Leave group with ID: ${groupId}`); // Replace with your logic for leaving a group.
  };

  const renderBetCard = (bet) => (
    <div key={bet.id} style={styles.betCard}>
      <h4 style={styles.betTitle}>{bet.betName}</h4>
      <p style={styles.betDescription}>{bet.description}</p>
      <p><strong>Status:</strong> {bet.status}</p>
    </div>
  );

  const renderGroupCard = (group) => (
    <div key={group.id} style={styles.groupCard}>
      <h3 style={styles.groupTitle}>{group.groupName}</h3>
      {group.bets && group.bets.length > 0 ? (
        <div style={styles.betList}>
          <h4 style={styles.betsHeader}>Active Bets:</h4>
          {group.bets.map(renderBetCard)}
        </div>
      ) : (
        <p>No active bets in this group.</p>
      )}
      {group.isMember ? (
        <div style={styles.buttonContainer}>
          <Link href={`/groups/${group.id}/bets`}>
            <button style={styles.viewButton}>View Group</button>
          </Link>
          <button
            style={styles.leaveButton}
            onClick={() => handleLeaveGroup(group.id)}
          >
            Leave Group
          </button>
        </div>
      ) : (
        <Link href={`/groups/${group.id}/join`}>
          <button style={styles.joinButton}>Join Group</button>
        </Link>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Betting Groups</h1>

      <h2 style={styles.sectionHeader}>My Groups</h2>
      <div style={styles.groupList}>
        {memberGroups.map(renderGroupCard)}
      </div>

      <h2 style={styles.sectionHeader}>Available Public Groups</h2>
      <div style={styles.groupList}>
        {publicGroups.map(renderGroupCard)}
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
  sectionHeader: {
    fontSize: '32px',
    fontWeight: '600',
    marginTop: '40px',
    marginBottom: '20px',
    color: '#1abc9c',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  groupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  groupCard: {
    backgroundColor: '#222',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #444',
  },
  groupTitle: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1abc9c',
    textShadow: '2px 2px 6px rgba(0, 0, 0, 0.4)',
  },
  betList: {
    marginTop: '20px',
  },
  betsHeader: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#fff',
  },
  betCard: {
    backgroundColor: '#333',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
  },
  betTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#1abc9c',
  },
  betDescription: {
    fontSize: '14px',
    marginBottom: '10px',
    color: '#ccc',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
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
  },
  viewButton: {
    padding: '12px 30px',
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  leaveButton: {
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
};

export default BettingGroupsPage;
