
import { useEffect, useState } from "react";
import {
  Award,
  Search,
  Mail,
  ChevronDown,
  ShieldCheck,
  Download,
  Eye,
} from "lucide-react";

import "./Home.css";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [hackathons, setHackathons] = useState([]);
  const [hackathon, setHackathon] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const response = await API.get("/hackathons");

      setHackathons(response.data.hackathons || []);
    } catch (error) {
      console.error("Fetch Hackathons Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post(
        "/certificates/find",
        {
          hackathonId: hackathon,
          email: email.trim().toLowerCase(),
        }
      );

      const certificate = response.data.certificate;

      navigate("/certificate", {
        state: {
          certificate,
        },
      });
    } catch (error) {
      console.error(
        "Find Certificate Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Certificate not found"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Award size={16} />
            DIGITAL CERTIFICATE PORTAL
          </div>

          <h1>
            Your achievement.
            <br />
            <span>Your certificate.</span>
          </h1>

          <p>
            Find, view and download your official certificate
            from any hackathon or event in seconds.
          </p>
        </div>

        <div className="search-card">
          <div className="search-card-header">
            <div className="search-icon">
              <Search size={21} />
            </div>

            <div>
              <h2>Find your certificate</h2>
              <p>
                Enter the details you used during registration.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hackathon / Event</label>

              <div className="input-wrapper">
                <Award size={18} />

                <select
                  value={hackathon}
                  onChange={(e) =>
                    setHackathon(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select your hackathon
                  </option>

                  {hackathons.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className="dropdown-icon"
                  size={18}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Registered Email</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <button
              className="search-button"
              type="submit"
              disabled={loading}
            >
              <Search size={18} />

              {loading
                ? "Searching..."
                : "Find Certificate"}
            </button>
          </form>

          <div className="secure-message">
            <ShieldCheck size={15} />
            Your information is securely processed.
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">
            <Search size={20} />
          </div>

          <div>
            <h3>Easy to Find</h3>
            <p>
              Search your certificate using your registered email.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Eye size={20} />
          </div>

          <div>
            <h3>Instant Access</h3>
            <p>
              View your certificate instantly online.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Download size={20} />
          </div>

          <div>
            <h3>Download Anytime</h3>
            <p>
              Download and keep your certificate digitally.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;