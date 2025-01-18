"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance.js";

function Navigation({ onNavigate, onCreateGroup }) {
  return (
    <nav className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex justify-center space-x-12">
            <button
              onClick={onNavigate.topBets}
              className="text-gray-300 hover:text-teal-400 transition-colors text-lg"
            >
              Top Bets
            </button>
            <button
              onClick={onNavigate.publicGroups}
              className="text-gray-300 hover:text-teal-400 transition-colors text-lg"
            >
              Public Groups
            </button>
            <button
              onClick={onNavigate.myGroups}
              className="text-gray-300 hover:text-teal-400 transition-colors text-lg"
            >
              My Groups
            </button>
            <button
              onClick={onCreateGroup}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors text-lg"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function CreateGroupModal({ isOpen, onClose, onSubmit }) {
  const [groupName, setGroupName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true); // Set default to true as per your model
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    try {
      const response = await axiosInstance.post("/api/groups/", {
        name: groupName,
        is_private: isPrivate,
      });

      console.log("Success response:", response.data); // Log successful response
      onSubmit(response.data);
      onClose();
      setGroupName("");
      setIsPrivate(true);
    } catch (error) {
      console.error("Full error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        setError(error.response.data.detail || "Failed to create group");
      } else {
        setError("Network error occurred");
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
  <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-colors">
    <h4 className="text-xl font-semibold text-teal-400 mb-3">{bet.title}</h4>
    <p className="text-gray-300 mb-4">{bet.description}</p>
    <div className="flex justify-between items-center">
      <span className="text-gray-400">${bet.amount}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          bet.status === "active"
            ? "bg-teal-500/20 text-teal-300"
            : "bg-gray-700/50 text-gray-300"
        }`}
      >
        {bet.status}
      </span>
    </div>
  </div>
);

const GroupCard = ({ group, isMember, onLeaveGroup }) => (
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
        <Link
          href={`/groups/${group.id}/join`}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          Join Group
        </Link>
      )}
    </div>
  </div>
);

export default function HomePage() {
  const [topBets, setTopBets] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Refs for scroll navigation
  const topBetsRef = useRef(null);
  const publicGroupsRef = useRef(null);
  const myGroupsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting data fetch...");

        // Test a single endpoint first
        try {
          const publicGroupsResponse = await axiosInstance.get(
            "/api/groups/public",
            {
              params: {
                limit: 10,
                offset: 0,
              },
            }
          );
          console.log("Public groups response:", publicGroupsResponse);
          setPublicGroups(publicGroupsResponse.data || []);
        } catch (error) {
          console.error("Public groups specific error:", error);
        }

        // Then try the other endpoints
        try {
          const topBetsResponse = await axiosInstance.get(
            "/api/groups/public/top-bets",
            {
              params: {
                limit: 10,
                offset: 0,
              },
            }
          );
          console.log("Top bets response:", topBetsResponse);
          setTopBets(topBetsResponse.data || []);
        } catch (error) {
          console.error("Top bets specific error:", error);
        }

        try {
          const myGroupsResponse = await axiosInstance.get(
            "/api/groups/my-groups"
          );
          console.log("My groups response:", myGroupsResponse);
          setMyGroups(myGroupsResponse.data || []);
        } catch (error) {
          console.error("My groups specific error:", error);
        }
      } catch (error) {
        console.error("Main error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLeaveGroup = async (groupId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/groups/${groupId}/leave`
      );
      if (response.status === 200) {
        setMyGroups(myGroups.filter((group) => group.id !== groupId));
      }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navigation
        onNavigate={{
          topBets: () => scrollToSection(topBetsRef),
          publicGroups: () => scrollToSection(publicGroupsRef),
          myGroups: () => scrollToSection(myGroupsRef),
        }}
        onCreateGroup={() => setIsCreateModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-24">
        {/* Top Bets Section */}
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

        {/* Public Groups Section */}
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

        {/* My Groups Section */}
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
      </main>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
}
