"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance.js";
import { useSearchParams } from "next/navigation";

const GroupSearchPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    const searchGroups = async () => {
      if (!query) return;

      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/groups/search", {
          params: { q: query },
        });
        setGroups(response.data || []);
      } catch (error) {
        console.error("Error searching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    searchGroups();
  }, [query]);

  const renderGroupCard = (group) => (
    <div
      key={group.id}
      className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 hover:border-teal-500/50 transition-colors"
    >
      <h3 className="text-2xl font-bold text-teal-400 mb-4">{group.name}</h3>
      <p className="text-gray-300 mb-4">
        {group.description || "No description available"}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">
          {group.member_count} members •{" "}
          {group.is_private ? "Private" : "Public"}
        </span>
        <Link
          href={`/groups/${group.id}`}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          View Group
        </Link>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Search Results for: <span className="text-teal-400">{query}</span>
        </h1>

        <div className="space-y-6">
          {groups.length > 0 ? (
            groups.map(renderGroupCard)
          ) : (
            <p className="text-gray-400 text-center">
              {query
                ? "No groups found matching your search."
                : "Enter a search term to find groups."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSearchPage;
