import { useEffect, useState } from "react";
import {
  Award,
  Download,
  Eye,
  FileText,
  RefreshCw,
  ShieldCheck,
  Trophy,
  XCircle,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Certificates.css";
import API from "../../services/api";

function Certificates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlHackathon = searchParams.get("hackathon");

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(
    urlHackathon || ""
  );
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const handleUnauthorized = (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/admin/login");
      return true;
    }

    return false;
  };

  const fetchHackathons = async () => {
    try {
      const response = await API.get(
        "/hackathons/admin",
        authConfig()
      );

      const data = response.data.hackathons || [];

      setHackathons(data);

      if (
        urlHackathon &&
        data.some((item) => item._id === urlHackathon)
      ) {
        setSelectedHackathon(urlHackathon);
      } else if (!selectedHackathon && data.length > 0) {
        setSelectedHackathon(data[0]._id);
      }
    } catch (error) {
      console.error("Fetch Hackathons Error:", error);

      if (handleUnauthorized(error)) return;

      setError("Unable to load hackathons.");
    }
  };

  const fetchCertificates = async () => {
    if (!selectedHackathon) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/certificates/${selectedHackathon}`,
        authConfig()
      );

      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error("Fetch Certificates Error:", error);

      if (handleUnauthorized(error)) return;

      setError(
        error.response?.data?.message ||
          "Unable to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [selectedHackathon]);

  const handleHackathonChange = (event) => {
    const value = event.target.value;

    setSelectedHackathon(value);

    navigate(
      value
        ? `/admin/certificates?hackathon=${value}`
        : "/admin/certificates",
      { replace: true }
    );
  };

  const handleGenerate = async () => {
    if (!selectedHackathon) {
      alert("Please select a hackathon.");
      return;
    }

    const confirmed = window.confirm(
      "Generate certificates for all participants of this hackathon?"
    );

    if (!confirmed) return;

    try {
      setGenerating(true);
      setError("");

      const response = await API.post(
        "/certificates/generate",
        {
          hackathonId: selectedHackathon,
        },
        authConfig()
      );

      const generatedCount = response.data.count || 0;
      const errorCount = response.data.errorCount || 0;

      if (errorCount > 0) {
        alert(
          `${generatedCount} certificates processed. ${errorCount} participants could not be processed.`
        );
      } else {
        alert(
          `${generatedCount} certificates processed successfully.`
        );
      }

      await fetchCertificates();
    } catch (error) {
      console.error("Generate Certificates Error:", error);

      if (handleUnauthorized(error)) return;

      alert(
        error.response?.data?.message ||
          "Unable to generate certificates."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (certificate) => {
    const confirmed = window.confirm(
      `Revoke certificate ${certificate.certificateId}?`
    );

    if (!confirmed || revokingId || deletingId) return;

    try {
      setRevokingId(certificate._id);

      await API.patch(
        `/certificates/${certificate._id}/revoke`,
        {},
        authConfig()
      );

      await fetchCertificates();
    } catch (error) {
      console.error("Revoke Certificate Error:", error);

      if (handleUnauthorized(error)) return;

      alert(
        error.response?.data?.message ||
          "Unable to revoke certificate."
      );
    } finally {
      setRevokingId(null);
    }
  };

  const handleDelete = async (certificate) => {
    const confirmed = window.confirm(
      `Delete certificate ${certificate.certificateId}? This action cannot be undone.`
    );

    if (!confirmed || deletingId || revokingId) return;

    try {
      setDeletingId(certificate._id);
      setError("");

      await API.delete(
        `/certificates/${certificate._id}`,
        authConfig()
      );

      await fetchCertificates();
    } catch (error) {
      console.error("Delete Certificate Error:", error);

      if (handleUnauthorized(error)) return;

      setError(
        error.response?.data?.message ||
          "Unable to delete certificate."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type) => {
    if (type === "FIRST_WINNER") return "1st Winner";
    if (type === "SECOND_WINNER") return "2nd Winner";
    if (type === "THIRD_WINNER") return "3rd Winner";

    return "Participation";
  };

  const getTypeClass = (type) => {
    if (type === "FIRST_WINNER") {
      return "certificate-type first";
    }

    if (type === "SECOND_WINNER") {
      return "certificate-type second";
    }

    if (type === "THIRD_WINNER") {
      return "certificate-type third";
    }

    return "certificate-type participation";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const issuedCount = certificates.filter(
    (certificate) => certificate.status === "issued"
  ).length;

  const revokedCount = certificates.filter(
    (certificate) => certificate.status === "revoked"
  ).length;

  return (
    <main className="certificates">
      <div className="certificates-container">
        <div className="certificates-header">
          <div>
            <h1>Certificates</h1>
            <p>
              Generate and manage participant certificates.
            </p>
          </div>

          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={!selectedHackathon || generating}
          >
            <RefreshCw
              size={17}
              className={generating ? "spin" : ""}
            />

            {generating
              ? "Generating..."
              : "Generate Certificates"}
          </button>
        </div>

        <div className="certificate-filter">
          <div className="certificate-filter-inner">
            <label>Select Hackathon</label>

            <select
              value={selectedHackathon}
              onChange={handleHackathonChange}
            >
              <option value="">Select a hackathon</option>

              {hackathons.map((hackathon) => (
                <option
                  key={hackathon._id}
                  value={hackathon._id}
                >
                  {hackathon.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedHackathon && (
          <div className="certificate-stats">
            <div className="certificate-stat-card">
              <div className="stat-icon">
                <FileText size={18} />
              </div>

              <div>
                <span>Total</span>
                <strong>{certificates.length}</strong>
              </div>
            </div>

            <div className="certificate-stat-card">
              <div className="stat-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <span>Issued</span>
                <strong>{issuedCount}</strong>
              </div>
            </div>

            <div className="certificate-stat-card">
              <div className="stat-icon">
                <XCircle size={18} />
              </div>

              <div>
                <span>Revoked</span>
                <strong>{revokedCount}</strong>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="certificate-error">
            {error}
          </div>
        )}

        {!selectedHackathon ? (
          <div className="empty-certificates">
            <Award size={38} />
            <h2>Select a hackathon</h2>
            <p>
              Choose a hackathon to manage its certificates.
            </p>
          </div>
        ) : loading ? (
          <div className="certificates-loading">
            Loading certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div className="empty-certificates">
            <Award size={38} />
            <h2>No certificates yet</h2>
            <p>
              Add participants and upload the required
              templates before generating certificates.
            </p>

            <button
              className="generate-button empty-generate"
              onClick={handleGenerate}
              disabled={generating}
            >
              <RefreshCw
                size={17}
                className={generating ? "spin" : ""}
              />

              {generating
                ? "Generating..."
                : "Generate Certificates"}
            </button>
          </div>
        ) : (
          <div className="certificate-table-wrapper">
            <table className="certificate-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Team</th>
                  <th>Certificate</th>
                  <th>Type</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {certificates.map((certificate) => {
                  const participant =
                    certificate.participantId;

                  const team = certificate.teamId;

                  return (
                    <tr key={certificate._id}>
                      <td>
                        <div className="participant-cell">
                          <div className="participant-avatar">
                            {participant?.name
                              ?.charAt(0)
                              .toUpperCase() || "P"}
                          </div>

                          <div>
                            <strong>
                              {participant?.name || "Unknown"}
                            </strong>

                            <span>
                              {participant?.email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="team-cell">
                          <strong>
                            {team?.teamName || "—"}
                          </strong>

                          <span>
                            {team?.registrationId || "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="certificate-id-text">
                          {certificate.certificateId}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getTypeClass(
                            certificate.type
                          )}
                        >
                          {certificate.type ===
                            "FIRST_WINNER" && (
                            <Trophy size={13} />
                          )}

                          {getTypeLabel(certificate.type)}
                        </span>
                      </td>

                      <td>
                        <span className="issued-date">
                          {formatDate(
                            certificate.issuedAt ||
                              certificate.createdAt
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${certificate.status}`}
                        >
                          {certificate.status === "issued"
                            ? "Issued"
                            : "Revoked"}
                        </span>
                      </td>

                      <td>
                        <div className="certificate-actions">
                          <a
                            href={certificate.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="action-button view"
                            title="View certificate"
                          >
                            <Eye size={15} />
                          </a>

                          <a
                            href={certificate.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="action-button download"
                            title="Download certificate"
                          >
                            <Download size={15} />
                          </a>

                          {certificate.status === "issued" && (
                            <button
                              className="action-button revoke"
                              onClick={() =>
                                handleRevoke(certificate)
                              }
                              disabled={
                                revokingId === certificate._id ||
                                Boolean(deletingId)
                              }
                              title="Revoke certificate"
                            >
                              <XCircle size={15} />
                            </button>
                          )}

                          <button
                            className="action-button delete"
                            onClick={() =>
                              handleDelete(certificate)
                            }
                            disabled={
                              deletingId === certificate._id ||
                              Boolean(deletingId) ||
                              Boolean(revokingId)
                            }
                            title="Delete certificate"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Certificates;