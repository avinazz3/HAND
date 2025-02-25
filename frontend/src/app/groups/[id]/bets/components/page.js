import React from 'react';
import Link from 'next/link';

const BetCard = ({ bet, groupId }) => (
  <Link href={`/groups/${groupId}/bets/${bet.id}`} className="block">
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
);

export default BetCard;