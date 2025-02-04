// page.js
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GroupPageClient from "./GroupPageClient";
import axiosInstance from "@/app/utils/axiosInstance.js";

export default function GroupPage() {
  const params = useParams();
  const [group, setGroup] = useState(null);
  const [isUserMember, setIsUserMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchGroupData = async () => {
    if (!params?.id) return;
    
    try {
      const [groupRes, membersRes, betsRes] = await Promise.all([
        axiosInstance.get(`/api/groups/${params.id}`),
        axiosInstance.get(`/api/groups/${params.id}/members`),
        axiosInstance.get(`/api/bets/group/${params.id}`),
      ]);

      const groupData = {
        ...groupRes.data,
        members: membersRes.data,
        bets: betsRes.data || [],
      };

      const userMember = membersRes.data.some(
        (member) =>
          member.user_id ===
          membersRes.data.find(
            (m) => m.users.email === groupRes.data.current_user_email
          )?.user_id
      );

      setGroup(groupData);
      setIsUserMember(userMember);
      setError(null);
    } catch (err) {
      console.error("Error fetching group data:", err);
      setError("Failed to load group data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [params?.id]);

  const handleJoinGroup = async () => {
    if (!group?.join_code) {
      setError("Unable to join group: Join code not found");
      return;
    }

    try {
      await axiosInstance.post(`/api/groups/${group.join_code}/join`);
      // Refresh the group data after joining
      await fetchGroupData();
    } catch (error) {
      console.error("Error joining group:", error);
      throw error; // Let the dialog handle the error
    }
  };

  const handleLeaveGroup = async () => {
    if (!params?.id) {
      setError("Unable to leave group: Group ID not found");
      return;
    }

    try {
      await axiosInstance.delete(`/api/groups/${params.id}/leave`);
      await fetchGroupData();
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("Failed to leave group");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <GroupPageClient
      group={group}
      groupId={params?.id}
      isUserMember={isUserMember}
      error={error}
      handleJoinGroup={handleJoinGroup}
      handleLeaveGroup={handleLeaveGroup}
    />
  );
}
