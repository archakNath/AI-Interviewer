import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Interview from "../components/dashboard/Interview";
import Resumes from "../components/dashboard/Resumes";
import Assessments from "../components/dashboard/Assessments";
import Profile from "../components/dashboard/Profile";
import { LogOut, User, FileText, Video, ClipboardList } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("interview");
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${token}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser({ name: data.username, email: data.email });
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const renderContent = () => {
    if (loading) return <div className="text-white">Loading...</div>;

    switch (activeTab) {
      case "interview":
        return <Interview />;
      case "resumes":
        return <Resumes />;
      case "assessments":
        return <Assessments />;
      case "profile":
        return <Profile user={user} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: "interview", label: "Interview", icon: Video },
    { id: "resumes", label: "Resumes", icon: FileText },
    { id: "assessments", label: "Assessments", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Sidebar */}
      <aside className="w-72 p-6 bg-white/10 backdrop-blur-md border-r border-white/10 shadow-lg flex flex-col">
        <h2 className="text-3xl font-bold mb-10 text-white tracking-tight">
          InterviewAI
        </h2>
        <nav className="space-y-4 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === id
                  ? "bg-white/20 text-white font-semibold shadow-inner"
                  : "hover:bg-white/10 text-gray-300"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded-xl flex items-center justify-center transition"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default Dashboard;
