import { useEffect, useState } from "react";

import {
  Award,
  BarChart3,
  FileBadge,
  FileText,
  LogOut,
  Trophy,
  Users,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import "./AdminNavbar.css";

import API from "../../services/api";

function AdminNavbar() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response =
          await API.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        setAdmin(response.data.admin);
      } catch (error) {
        console.error(
          "Fetch Admin Error:",
          error
        );

        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    };

    fetchAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      label: "Hackathons",
      path: "/admin/hackathons",
      icon: Trophy,
    },
    {
      label: "Teams",
      path: "/admin/teams",
      icon: Users,
    },
    {
      label: "Participants",
      path: "/admin/participants",
      icon: UserRound,
    },
    {
      label: "Winners",
      path: "/admin/winners",
      icon: Award,
    },
    {
      label: "Templates",
      path: "/admin/templates",
      icon: FileText,
    },
    {
      label: "Certificates",
      path: "/admin/certificates",
      icon: FileBadge,
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <div className="admin-brand">
          <div className="admin-brand-logo">
            <Award size={22} />
          </div>

          <div>
            <h2>Certify</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <div className="admin-profile">
          <div className="admin-avatar">
            {admin?.name
              ?.charAt(0)
              .toUpperCase() || "A"}
          </div>

          <div className="admin-profile-info">
            <strong>
              {admin?.name || "Admin"}
            </strong>

            <span>
              {admin?.email || "Admin"}
            </span>
          </div>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminNavbar;