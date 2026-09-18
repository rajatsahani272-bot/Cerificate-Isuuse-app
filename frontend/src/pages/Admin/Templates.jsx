import { useEffect, useState } from "react";

import {
  FileText,
  Upload,
  Trash2,
  Eye,
  X,
  Trophy,
  Award,
  Medal,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./Templates.css";

import API from "../../services/api";

function Templates() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const urlHackathon =
    searchParams.get("hackathon");

  const [hackathons, setHackathons] =
    useState([]);

  const [selectedHackathon, setSelectedHackathon] =
    useState(urlHackathon || "");

  const [templates, setTemplates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [templateType, setTemplateType] =
    useState("PARTICIPATION");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const fetchHackathons = async () => {
    try {
      const response = await API.get(
        "/hackathons/admin",
        authConfig()
      );

      const data =
        response.data.hackathons || [];

      setHackathons(data);

      if (
        urlHackathon &&
        data.some(
          (item) =>
            item._id === urlHackathon
        )
      ) {
        setSelectedHackathon(
          urlHackathon
        );
      } else if (
        !selectedHackathon &&
        data.length > 0
      ) {
        setSelectedHackathon(
          data[0]._id
        );
      }
    } catch (error) {
      console.error(
        "Fetch Hackathons Error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    }
  };

  const fetchTemplates = async () => {
    if (!selectedHackathon) {
      setTemplates([]);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get(
        `/templates/${selectedHackathon}`,
        authConfig()
      );

      setTemplates(
        response.data.templates || []
      );
    } catch (error) {
      console.error(
        "Fetch Templates Error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      fetchTemplates();
    }
  }, [selectedHackathon]);

  const handleHackathonChange = (e) => {
    const value = e.target.value;

    setSelectedHackathon(value);

    if (value) {
      navigate(
        `/admin/templates?hackathon=${value}`,
        {
          replace: true,
        }
      );
    } else {
      navigate(
        "/admin/templates",
        {
          replace: true,
        }
      );
    }
  };

  const openUploadModal = () => {
    setTemplateType(
      "PARTICIPATION"
    );

    setSelectedFile(null);

    setShowModal(true);
  };

  const closeUploadModal = () => {
    if (uploading) {
      return;
    }

    setShowModal(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Only PNG, JPG, JPEG and PDF files are allowed"
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "File size must be less than 5 MB"
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedHackathon) {
      alert(
        "Please select a hackathon"
      );

      return;
    }

    if (!selectedFile) {
      alert(
        "Please select a template file"
      );

      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "hackathonId",
        selectedHackathon
      );

      formData.append(
        "type",
        templateType
      );

      formData.append(
        "template",
        selectedFile
      );

      await API.post(
        "/templates",
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      closeUploadModal();

      await fetchTemplates();
    } catch (error) {
      console.error(
        "Upload Template Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to upload template"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (
    template
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${getTypeLabel(
          template.type
        )} template?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/templates/${template._id}`,
        authConfig()
      );

      setTemplates((previous) =>
        previous.filter(
          (item) =>
            item._id !== template._id
        )
      );
    } catch (error) {
      console.error(
        "Delete Template Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to delete template"
      );
    }
  };

  const getTypeLabel = (type) => {
    if (type === "PARTICIPATION") {
      return "Participation";
    }

    if (type === "FIRST_WINNER") {
      return "1st Winner";
    }

    if (type === "SECOND_WINNER") {
      return "2nd Winner";
    }

    if (type === "THIRD_WINNER") {
      return "3rd Winner";
    }

    return type;
  };

  const getTypeIcon = (type) => {
    if (type === "PARTICIPATION") {
      return <FileText size={20} />;
    }

    if (type === "FIRST_WINNER") {
      return <Trophy size={20} />;
    }

    if (type === "SECOND_WINNER") {
      return <Medal size={20} />;
    }

    return <Award size={20} />;
  };

  const getTypeClass = (type) => {
    if (type === "PARTICIPATION") {
      return "participation";
    }

    if (type === "FIRST_WINNER") {
      return "first";
    }

    if (type === "SECOND_WINNER") {
      return "second";
    }

    return "third";
  };

  const getTemplateByType = (
    type
  ) => {
    return templates.find(
      (template) =>
        template.type === type &&
        template.isActive
    );
  };

  const templateTypes = [
    "PARTICIPATION",
    "FIRST_WINNER",
    "SECOND_WINNER",
    "THIRD_WINNER",
  ];

  return (
    <main className="templates">
      <div className="templates-container">
        <div className="templates-header">
          <div>
            <h1>
              Certificate Templates
            </h1>

            <p>
              Upload and manage certificate
              designs for each hackathon.
            </p>
          </div>

          <button
            className="upload-template-button"
            onClick={openUploadModal}
            disabled={
              !selectedHackathon
            }
          >
            <Upload size={17} />
            Upload Template
          </button>
        </div>

        <div className="template-filter">
          <label>
            Select Hackathon
          </label>

          <select
            value={selectedHackathon}
            onChange={
              handleHackathonChange
            }
          >
            <option value="">
              Select a hackathon
            </option>

            {hackathons.map(
              (hackathon) => (
                <option
                  key={hackathon._id}
                  value={hackathon._id}
                >
                  {hackathon.name}
                </option>
              )
            )}
          </select>
        </div>

        {!selectedHackathon ? (
          <div className="empty-templates">
            <FileText size={36} />

            <h2>
              Select a hackathon
            </h2>

            <p>
              Choose a hackathon to manage
              its certificate templates.
            </p>
          </div>
        ) : loading ? (
          <div className="templates-loading">
            Loading templates...
          </div>
        ) : (
          <section className="template-section">
            <div className="template-grid">
              {templateTypes.map(
                (type) => {
                  const template =
                    getTemplateByType(
                      type
                    );

                  return (
                    <div
                      className="template-card"
                      key={type}
                    >
                      <div className="template-card-top">
                        <div
                          className={`template-icon ${getTypeClass(
                            type
                          )}`}
                        >
                          {getTypeIcon(
                            type
                          )}
                        </div>

                        <span
                          className={
                            template
                              ? "template-status active"
                              : "template-status missing"
                          }
                        >
                          {template
                            ? "Uploaded"
                            : "Not Uploaded"}
                        </span>
                      </div>

                      <div className="template-card-content">
                        <h2>
                          {getTypeLabel(
                            type
                          )}
                        </h2>

                        <p>
                          {type ===
                          "PARTICIPATION"
                            ? "Certificate for all participants."
                            : "Certificate for the corresponding winning team."}
                        </p>

                        {template ? (
                          <div className="template-file">
                            <FileText
                              size={16}
                            />

                            <div>
                              <strong>
                                {
                                  template.fileName
                                }
                              </strong>

                              <span>
                                Uploaded{" "}
                                {new Date(
                                  template.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="template-missing">
                            <span>
                              No template uploaded
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="template-card-actions">
                        {template && (
                          <>
                            <a
                              href={
                                template.fileUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="view-template-button"
                            >
                              <Eye
                                size={15}
                              />
                              View
                            </a>

                            <button
                              className="delete-template-button"
                              onClick={() =>
                                handleDelete(
                                  template
                                )
                              }
                            >
                              <Trash2
                                size={15}
                              />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !uploading
            ) {
              closeUploadModal();
            }
          }}
        >
          <div className="template-modal">
            <div className="modal-header">
              <div>
                <h2>
                  Upload Template
                </h2>

                <p>
                  Select the certificate
                  type and template file.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={
                  closeUploadModal
                }
                disabled={uploading}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="template-form"
              onSubmit={handleUpload}
            >
              <div className="form-group">
                <label>
                  Certificate Type
                </label>

                <select
                  value={templateType}
                  onChange={(e) =>
                    setTemplateType(
                      e.target.value
                    )
                  }
                >
                  <option value="PARTICIPATION">
                    Participation
                  </option>

                  <option value="FIRST_WINNER">
                    1st Winner
                  </option>

                  <option value="SECOND_WINNER">
                    2nd Winner
                  </option>

                  <option value="THIRD_WINNER">
                    3rd Winner
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Template File
                </label>

                <label className="file-upload">
                  <Upload size={20} />

                  <span>
                    {selectedFile
                      ? selectedFile.name
                      : "Choose template file"}
                  </span>

                  <small>
                    PNG, JPG, JPEG or PDF ·
                    Max 5 MB
                  </small>

                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={
                      handleFileChange
                    }
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    closeUploadModal
                  }
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Templates;