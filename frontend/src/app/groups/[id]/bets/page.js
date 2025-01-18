"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GroupPage({ params }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bets"); // 'bets' or 'members'
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group details, bets, and members
        const [groupRes, membersRes] = await Promise.all([
          fetch(`/api/groups/${params.id}`),
          fetch(`/api/groups/${params.id}/members`),
        ]);

        const [groupData, membersData] = await Promise.all([
          groupRes.json(),
          membersRes.json(),
        ]);

        setGroup({
          ...groupData,
          members: membersData,
        });
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [params.id]);

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${params.id}/leave`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/"); // Redirect to home page
      }
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const BetCard = ({ bet }) => (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-semibold text-teal-400">{bet.title}</h4>
          <p className="text-gray-300 mt-2">{bet.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            bet.status === "active"
              ? "bg-teal-500/20 text-teal-300"
              : bet.status === "won"
              ? "bg-green-500/20 text-green-300"
              : bet.status === "lost"
              ? "bg-red-500/20 text-red-300"
              : "bg-gray-700/50 text-gray-300"
          }`}
        >
          {bet.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">${bet.amount}</span>
        <Link
          href={`/groups/${params.id}/bets/${bet.id}`}
          className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  const MemberCard = ({ member }) => (
    <div className="flex items-center space-x-4 bg-gray-800/30 rounded-lg p-4">
      <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
        <span className="text-teal-300 font-medium">
          {member.username[0].toUpperCase()}
        </span>
      </div>
      <div>
        <h4 className="text-white font-medium">{member.username}</h4>
        <p className="text-gray-400 text-sm">
          Joined {new Date(member.joined_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!group) return null;

  const activeBets = group.bets?.filter((bet) => bet.status === "active") || [];
  const completedBets =
    group.bets?.filter((bet) => bet.status !== "active") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
            <p className="text-gray-400">
              {group.members?.length || 0} members · {group.bets?.length || 0}{" "}
              bets
            </p>
          </div>
          <button
            onClick={handleLeaveGroup}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Leave Group
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("bets")}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "bets"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Bets
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === "members"
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Members
          </button>
        </div>

        {/* Content */}
        {activeTab === "bets" ? (
          <div className="space-y-12">
            {/* Active Bets */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="text-teal-400">Active</span> Bets
              </h2>
              <div className="space-y-4">
                {activeBets.length > 0 ? (
                  activeBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
                ) : (
                  <p className="text-gray-400">No active bets</p>
                )}
              </div>
            </section>

            {/* Completed Bets */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="text-teal-400">Completed</span> Bets
              </h2>
              <div className="space-y-4">
                {completedBets.length > 0 ? (
                  completedBets.map((bet) => <BetCard key={bet.id} bet={bet} />)
                ) : (
                  <p className="text-gray-400">No completed bets</p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.members?.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
