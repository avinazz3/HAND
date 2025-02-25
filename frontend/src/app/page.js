"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance.js";
import NavigationBar from "@/components/navbar.js";
import { useRouter } from "next/navigation";

function CreateGroupModal({ isOpen, onClose, onSubmit }) {
  const [groupName, setGroupName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("Group name cannot be empty");
      return;
    }

    try {
      console.log("Creating group:", { name: groupName, is_private: isPrivate });
      const response = await axiosInstance.post("/api/groups/", {
        name: groupName,
        is_private: isPrivate,
      });
      console.log("Group created:", response.data);
      onSubmit(response.data);
      onClose();
      setGroupName("");
      setIsPrivate(true);
    } catch (error) {
      console.error("Error creating group:", error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        setError(error.response.data.detail || "Failed to create group");
      } else if (error.request) {
        console.error("Request error:", error.request);
        setError("Network error - no response received");
      } else {
        console.error("Error message:", error.message);
        setError(error.message || "An unexpected error occurred");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">
          Create New Group
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="groupName">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            <label className="text-gray-300" htmlFor="isPrivate">
              Private Group
            </label>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BetCard = ({ bet }) => (
  <Link href={`/groups/${bet.group_id}/bets/${bet.id}`} className="block">
  <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-colors">
    <h4 className="text-xl font-semibold text-teal-400 mb-3">
      {bet.description}
    </h4>
    <div className="text-gray-300 mb-4">
      <p>
        Type: {bet.bet_type === "one_to_many" ? "One vs Many" : "Team vs Team"}
      </p>
      <p>Target: ${bet.target_quantity}</p>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-400">Reward: {bet.reward_type}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          bet.status === "active"
            ? "bg-teal-500/20 text-teal-300"
            : bet.status === "completed"
            ? "bg-green-500/20 text-green-300"
            : "bg-gray-700/50 text-gray-300"
        }`}
      >
        {bet.status}
      </span>
    </div>
  </div>
  </Link>
);

const GroupCard = ({ group, isMember, onLeaveGroup }) => {
  return (
    <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
      <h3 className="text-2xl font-bold text-teal-400 mb-4">{group.name}</h3>
      {group.bets?.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-medium text-gray-300">Active Bets:</h4>
          <div className="space-y-3">
            {group.bets.map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 mb-6">No active bets in this group.</p>
      )}
      <div className="flex justify-end space-x-4">
        {isMember ? (
          <>
            <Link
              href={`/groups/${group.id}`}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              View Group
            </Link>
            <button
              onClick={() => onLeaveGroup(group.id)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Leave Group
            </button>
          </>
        ) : (
          !group.isMember && (
            <Link
              href={`/groups/${group.id}`}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              View Group
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default function HomePage() {
  const [topBets, setTopBets] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const topBetsRef = useRef(null);
  const publicGroupsRef = useRef(null);
  const myGroupsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publicGroupsRes, topBetsRes, myGroupsRes] = await Promise.all([
          axiosInstance.get("/api/groups/public"),
          axiosInstance.get("/api/bets/public/top-bets"),
          axiosInstance.get("/api/users/my-groups"),
        ]);

        setPublicGroups(publicGroupsRes.data);
        setTopBets(topBetsRes.data);
        setMyGroups(myGroupsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLeaveGroup = async (groupId) => {
    try {
      await axiosInstance.delete(`/api/groups/${groupId}/leave`);
      setMyGroups(myGroups.filter((group) => group.id !== groupId));
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const handleCreateGroup = (newGroup) => {
    setMyGroups([...myGroups, newGroup]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <NavigationBar
        onNavigate={{
          topBets: () => scrollToSection(topBetsRef),
          publicGroups: () => scrollToSection(publicGroupsRef),
          myGroups: () => scrollToSection(myGroupsRef),
        }}
        onCreateGroup={() => setIsCreateModalOpen(true)}
      />
      <main className="flex-1 overflow-y-auto pt-[70px]">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-24">
          <section ref={topBetsRef} className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-white mb-8">
              <span className="text-teal-400">Top</span> Bets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topBets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          </section>
          <section ref={publicGroupsRef} className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-white mb-8">
              <span className="text-teal-400">Public</span> Groups
            </h2>
            <div className="space-y-6">
              {publicGroups.map((group) => (
                <GroupCard key={group.id} group={group} isMember={false} />
              ))}
            </div>
          </section>
          <section ref={myGroupsRef} className="scroll-mt-20">
            <h2 className="text-3xl font-bold text-white mb-8">
              <span className="text-teal-400">My</span> Groups
            </h2>
            <div className="space-y-6">
              {myGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={true}
                  onLeaveGroup={handleLeaveGroup}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
}
