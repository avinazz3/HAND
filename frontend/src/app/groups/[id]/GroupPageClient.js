"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavigationBar from "@/components/navbar.js";
import JoinGroupDialog from "./JoinGroupDialog";
import PremiumDialog from "@/components/PremiumDialog";
import axiosInstance from "@/app/utils/axiosInstance.js";

const BetCard = ({ bet, groupId }) => (
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
        href={`/groups/${groupId}/bets/${bet.id}`}
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
        {member.users.email[0].toUpperCase()}
      </span>
    </div>
    <div>
      <h4 className="text-white font-medium">{member.users.email}</h4>
      <p className="text-gray-400 text-sm">
        Joined {new Date(member.joined_at).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const GroupPageClient = ({
  group,
  groupId,
  isUserMember,
  error: serverError,
  handleJoinGroup,
  handleLeaveGroup,
}) => {
  const [activeTab, setActiveTab] = useState("bets");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [error, setError] = useState(serverError);
  const router = useRouter();

  const activeBets = group?.bets?.filter((bet) => bet.status === "active") || [];
  const completedBets =
    group?.bets?.filter((bet) => bet.status !== "active") || [];

  const handleNavigation = (section) => {
    router.push(`/#${section}`);
  };

  const handleCreateGroup = async () => {
    try {
      const response = await axiosInstance.post("/api/groups", {
        name: "New Group",
        is_private: false,
      });
      router.push(`/groups/${response.data.id}`);
    } catch (error) {
      if (error.response?.status === 403) {
        // Show premium dialog for group limit error
        setIsPremiumDialogOpen(true);
      } else {
        setError(error.response?.data?.detail || "Failed to create group");
      }
    }
  };

  const handlePremiumSuccess = () => {
    // After successful premium upgrade, try creating the group again
    handleCreateGroup();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <NavigationBar 
        onNavigate={{
          topBets: () => handleNavigation('topBets'),
          publicGroups: () => handleNavigation('publicGroups'),
          myGroups: () => handleNavigation('myGroups'),
        }}
        onCreateGroup={handleCreateGroup}
      />
      <div className="flex-1 overflow-y-auto pt-[70px]"> 
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{group?.name}</h1>
              <p className="text-gray-400">
                {group?.members?.length || 0} members · {group?.bets?.length || 0}{" "}
                bets
                {group?.is_private && " · Private Group"}
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
                onClick={() => setIsJoinDialogOpen(true)}
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
                      href={`/groups/${groupId}/bets/create`}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                    >
                      Create Bet
                    </Link>
                  )}
                </div>
                <div className="space-y-4">
                  {activeBets.length > 0 ? (
                    activeBets.map((bet) => (
                      <BetCard key={bet.id} bet={bet} groupId={groupId} />
                    ))
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
                    completedBets.map((bet) => (
                      <BetCard key={bet.id} bet={bet} groupId={groupId} />
                    ))
                  ) : (
                    <p className="text-gray-400">No completed bets</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group?.members?.map((member) => (
                <MemberCard key={member.user_id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Group Dialog */}
      <JoinGroupDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onJoin={handleJoinGroup}
        group={group}
      />

      {/* Premium Dialog */}
      <PremiumDialog
        isOpen={isPremiumDialogOpen}
        onClose={() => setIsPremiumDialogOpen(false)}
        onSuccess={handlePremiumSuccess}
      />
    </div>
  );
};

export default GroupPageClient;
