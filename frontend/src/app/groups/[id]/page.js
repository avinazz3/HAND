"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance.js";

export default function GroupPage({ params }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("bets");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserMember, setIsUserMember] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [groupRes, membersRes, betsRes, userRes] = await Promise.all([
          axiosInstance.get(`/api/groups/${params.id}`),
          axiosInstance.get(`/api/groups/${params.id}/members`),
          axiosInstance.get(`/api/bets/group/${params.id}`),
          axiosInstance.get("/api/users/profile"),
        ]);

        setGroup({
          ...groupRes.data,
          members: membersRes.data,
          bets: betsRes.data || [],
        });

        setIsUserMember(
          membersRes.data.some((member) => member.id === userRes.data.id)
        );
      } catch (error) {
        console.error("Error fetching group data:", error);
        setError(error.response?.data?.detail || "Error loading group data");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [params.id]);

  const handleJoinGroup = async () => {
    try {
      await axiosInstance.post(`/api/groups/${group.join_code}/join`);
      window.location.reload();
    } catch (error) {
      console.error("Error joining group:", error);
      setError(error.response?.data?.detail || "Failed to join group");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axiosInstance.delete(`/api/groups/${params.id}/leave`);
      router.push("/");
    } catch (error) {
      console.error("Error leaving group:", error);
      setError(error.response?.data?.detail || "Failed to leave group");
    }
  };

  const BetCard = ({ bet }) => (
    <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-semibold text-teal-400">
            {bet.description}
          </h4>
          <div className="mt-2 space-y-2">
            <p className="text-gray-300">
              Type:{" "}
              {bet.bet_type === "one_to_many" ? "One vs Many" : "Team vs Team"}
            </p>
            <p className="text-gray-300">Amount: ${bet.target_quantity}</p>
            <p className="text-gray-300">Reward: {bet.reward_type}</p>
            {bet.verification_deadline && (
              <p className="text-gray-300">
                Deadline:{" "}
                {new Date(bet.verification_deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            bet.status === "active"
              ? "bg-teal-500/20 text-teal-300"
              : bet.status === "completed"
              ? "bg-green-500/20 text-green-300"
              : bet.status === "failed"
              ? "bg-red-500/20 text-red-300"
              : "bg-gray-700/50 text-gray-300"
          }`}
        >
          {bet.status}
        </span>
      </div>
      <div className="flex justify-end items-center mt-4">
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
          {member.email[0].toUpperCase()}
        </span>
      </div>
      <div>
        <h4 className="text-white font-medium">{member.email}</h4>
        <p className="text-gray-400 text-sm">
          Joined {new Date(member.created_at).toLocaleDateString()}
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
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
            <p className="text-gray-400">
              {group.members?.length || 0} members · {group.bets?.length || 0}{" "}
              bets
              {group.is_private && " · Private Group"}
            </p>
          </div>
          {isUserMember ? (
            <button
              onClick={handleLeaveGroup}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Leave Group
            </button>
          ) : (
            <button
              onClick={handleJoinGroup}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Join Group
            </button>
          )}
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-teal-400">Active</span> Bets
                </h2>
                {isUserMember && (
                  <Link
                    href={`/groups/${params.id}/bets/create`}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                  >
                    Create Bet
                  </Link>
                )}
              </div>
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
