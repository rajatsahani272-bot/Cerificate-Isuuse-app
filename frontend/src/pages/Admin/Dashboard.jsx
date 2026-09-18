import { useEffect, useState } from "react";
import {
  Award,
  Users,
  Trophy,
  FileText,
  UserRound,
} from "lucide-react";

import "./Dashboard.css";

import API from "../../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    hackathons: 0,
    teams: 0,
    participants: 0,
    winners: 0,
    certificates: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get("/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data.stats);
      } catch (error) {
        console.error("Dashboard Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Manage your hackathons and certificates.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Award size={20} />
            </div>

            <p>Hackathons</p>
            <h2>{loading ? "..." : stats.hackathons}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={20} />
            </div>

            <p>Teams</p>
            <h2>{loading ? "..." : stats.teams}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <UserRound size={20} />
            </div>

            <p>Participants</p>
            <h2>{loading ? "..." : stats.participants}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Trophy size={20} />
            </div>

            <p>Winners</p>
            <h2>{loading ? "..." : stats.winners}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={20} />
            </div>

            <p>Certificates</p>
            <h2>{loading ? "..." : stats.certificates}</h2>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;