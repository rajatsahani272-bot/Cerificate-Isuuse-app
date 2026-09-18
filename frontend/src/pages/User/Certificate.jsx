
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Award,
  Download,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import "./Certificate.css";

function Certificate() {
  const location = useLocation();
  const navigate = useNavigate();

  const certificate =
    location.state?.certificate;

  if (!certificate) {
    return (
      <main className="certificate-page">
        <div className="certificate-container">
          <Award size={40} />

          <h1>Certificate Not Found</h1>

          <p>
            Please search for your certificate
            from the home page.
          </p>

          <button
            type="button"
            className="certificate-back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const participant =
    certificate.participantId;

  const team = certificate.teamId;

  const participantName =
    typeof participant === "object"
      ? participant?.name ||
        participant?.fullName ||
        "Participant"
      : "Participant";

  const participantEmail =
    typeof participant === "object"
      ? participant?.email || "—"
      : "—";

  const teamName =
    typeof team === "object"
      ? team?.teamName || "—"
      : "—";

  const certificateType =
    certificate?.type
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ) || "Certificate";

  const certificateUrl =
    certificate?.pdfUrl;

  if (!certificateUrl) {
    return (
      <main className="certificate-page">
        <div className="certificate-container">
          <Award size={40} />

          <h1>Certificate Unavailable</h1>

          <p>
            The certificate PDF URL is missing.
            Please contact the administrator.
          </p>

          <button
            type="button"
            className="certificate-back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="certificate-page">
      <div className="certificate-container">
        <div className="certificate-header">
          <div>
            <span>Certificate</span>

            <h1>{participantName}</h1>

            <p>{certificateType}</p>
          </div>

          <div className="certificate-id">
            <span>Certificate ID</span>

            <strong>
              {certificate.certificateId || "—"}
            </strong>
          </div>
        </div>

        <div className="certificate-preview">
          <iframe
            src={certificateUrl}
            title="Certificate Preview"
            width="100%"
            height="600"
            loading="lazy"
          />
        </div>

        <div className="certificate-details">
          <div>
            <span>Participant</span>

            <strong>{participantName}</strong>
          </div>

          <div>
            <span>Email</span>

            <strong>{participantEmail}</strong>
          </div>

          <div>
            <span>Team</span>

            <strong>{teamName}</strong>
          </div>

          <div>
            <span>Certificate Type</span>

            <strong>{certificateType}</strong>
          </div>

          <div>
            <span>Status</span>

            <strong>
              {certificate.status || "—"}
            </strong>
          </div>
        </div>

        <div className="certificate-actions">
          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="download-certificate"
          >
            <Download size={17} />
            Download Certificate
          </a>

          <a
            href={certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-certificate"
          >
            <ExternalLink size={16} />
            Open Full Certificate
          </a>
        </div>
      </div>
    </main>
  );
}

export default Certificate;