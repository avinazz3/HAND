export default function CreateGroupModal({ isOpen, onClose, onSubmit }) {
  const [groupName, setGroupName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axiosInstance.post("/api/groups/", {
        name: groupName,
        is_private: isPrivate,
      });
      onSubmit(response.data);
      onClose();
      setGroupName("");
      setIsPrivate(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create group");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">
          Create New Group
        </h2>
        {error && <div className="text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>{/* Form logic */}</form>
      </div>
    </div>
  );
}
