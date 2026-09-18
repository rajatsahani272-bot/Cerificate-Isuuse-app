
import "./Hackathons.css";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Award,
  Plus,
  X,
  CalendarDays,
  Building2,
  FileText,
  Pencil,
  Trash2,
  Users,
  Trophy,
  LayoutTemplate,
  ChevronRight,
} from "lucide-react";

import API from "../../services/api";

const initialForm = {
  name: "",
  description: "",
  organization: "",
  startDate: "",
  endDate: "",
  issueDate: "",
  status: "upcoming",
};

function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState(initialForm);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getErrorMessage = (error, fallback) => {
    return (
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    const value = String(date);

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString().split("T")[0];
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "active") {
      return "status-active";
    }

    if (status === "completed") {
      return "status-completed";
    }

    return "status-upcoming";
  };

  const fetchHackathons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/hackathons",
        config
      );

      setHackathons(response.data.hackathons || []);
    } catch (error) {
      console.error(
        "Fetch hackathons error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Failed to load hackathons"
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const resetForm = () => {
    setForm({ ...initialForm });
    setFormError("");
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingHackathon(null);
    resetForm();
  };

  const openCreateModal = () => {
    setEditingHackathon(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (hackathon) => {
    setEditingHackathon(hackathon);

    setForm({
      name: hackathon.name || "",
      description: hackathon.description || "",
      organization: hackathon.organization || "",
      startDate: formatDateForInput(
        hackathon.startDate
      ),
      endDate: formatDateForInput(
        hackathon.endDate
      ),
      issueDate: formatDateForInput(
        hackathon.issueDate
      ),
      status: hackathon.status || "upcoming",
    });

    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
  };

  const validateForm = () => {
    const name = form.name.trim();
    const organization = form.organization.trim();

    if (!name) {
      return "Hackathon name is required";
    }

    if (!organization) {
      return "Organization is required";
    }

    if (!form.startDate || !form.endDate) {
      return "Start date and end date are required";
    }

    if (!form.issueDate) {
      return "Certificate issue date is required";
    }

    if (form.endDate < form.startDate) {
      return "End date cannot be before start date";
    }

    if (form.issueDate < form.endDate) {
      return "Certificate issue date cannot be before event end date";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        ...form,
        name: form.name.trim(),
        organization: form.organization.trim(),
        description: form.description.trim(),
      };

      if (editingHackathon) {
        await API.put(
          `/hackathons/${editingHackathon._id}`,
          payload,
          config
        );
      } else {
        await API.post(
          "/hackathons",
          payload,
          config
        );
      }

      closeModal();
      await fetchHackathons();
    } catch (error) {
      console.error(
        "Hackathon save error:",
        error
      );

      setFormError(
        getErrorMessage(
          error,
          "Failed to save hackathon"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hackathon?"
    );

    if (!confirmed || deletingId) return;

    try {
      setDeletingId(id);
      setError("");

      await API.delete(
        `/hackathons/${id}`,
        config
      );

      await fetchHackathons();
    } catch (error) {
      console.error(
        "Delete hackathon error:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Failed to delete hackathon"
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="hackathons-page">
      <div className="hackathons-container">
        <div className="hackathons-header">
          <div>
            <div className="page-icon">
              <Award size={22} />
            </div>

            <h1>Hackathons</h1>

            <p>
              Create and manage your hackathons and
              events.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Create Hackathon
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}

            <button
              type="button"
              onClick={fetchHackathons}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="page-loading">
            <p>Loading hackathons...</p>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="empty-state">
            <Award size={38} />

            <h3>No hackathons yet</h3>

            <p>
              Create your first hackathon to get
              started.
            </p>

            <button
              className="primary-button"
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Create Hackathon
            </button>
          </div>
        ) : (
          <div className="hackathons-grid">
            {hackathons.map((hackathon) => (
              <div
                className="hackathon-card"
                key={hackathon._id}
              >
                <div className="hackathon-card-header">
                  <div className="hackathon-logo">
                    <Award size={23} />
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      hackathon.status
                    )}`}
                  >
                    {hackathon.status}
                  </span>
                </div>

                <h2>{hackathon.name}</h2>

                <div className="organization">
                  <Building2 size={15} />
                  {hackathon.organization}
                </div>

                {hackathon.description && (
                  <p className="hackathon-description">
                    {hackathon.description}
                  </p>
                )}

                <div className="date-info">
                  <div>
                    <CalendarDays size={16} />

                    <div>
                      <span>Event Dates</span>

                      <strong>
                        {formatDate(
                          hackathon.startDate
                        )}{" "}
                        —{" "}
                        {formatDate(
                          hackathon.endDate
                        )}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <Award size={16} />

                    <div>
                      <span>Certificate Issue</span>

                      <strong>
                        {formatDate(
                          hackathon.issueDate
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="hackathon-actions">
                  <Link
                    to={`/admin/teams?hackathon=${hackathon._id}`}
                    className="card-action"
                  >
                    <Users size={16} />
                    Teams
                    <ChevronRight size={14} />
                  </Link>

                  <Link
                    to={`/admin/participants?hackathon=${hackathon._id}`}
                    className="card-action"
                  >
                    <Users size={16} />
                    Participants
                    <ChevronRight size={14} />
                  </Link>

                  <Link
                    to={`/admin/templates?hackathon=${hackathon._id}`}
                    className="card-action"
                  >
                    <LayoutTemplate size={16} />
                    Templates
                    <ChevronRight size={14} />
                  </Link>

                  <Link
                    to={`/admin/winners?hackathon=${hackathon._id}`}
                    className="card-action"
                  >
                    <Trophy size={16} />
                    Winners
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="card-footer">
                  <button
                    className="edit-button"
                    onClick={() =>
                      openEditModal(hackathon)
                    }
                    disabled={Boolean(deletingId)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(hackathon._id)
                    }
                    disabled={
                      deletingId === hackathon._id ||
                      Boolean(deletingId)
                    }
                  >
                    <Trash2 size={15} />

                    {deletingId === hackathon._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="modal hackathon-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingHackathon
                    ? "Edit Hackathon"
                    : "Create Hackathon"}
                </h2>

                <p>
                  {editingHackathon
                    ? "Update hackathon details."
                    : "Create a new hackathon or event."}
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                className="form-error"
                role="alert"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="hackathon-name">
                  Hackathon Name
                </label>

                <div className="input-wrapper">
                  <Award size={17} />

                  <input
                    id="hackathon-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Hackathon 2026"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hackathon-organization">
                  Organization
                </label>

                <div className="input-wrapper">
                  <Building2 size={17} />

                  <input
                    id="hackathon-organization"
                    type="text"
                    name="organization"
                    placeholder="Enter organization name"
                    value={form.organization}
                    onChange={handleChange}
                    required
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hackathon-description">
                  Description
                </label>

                <div className="textarea-wrapper">
                  <FileText size={17} />

                  <textarea
                    id="hackathon-description"
                    name="description"
                    placeholder="Describe your hackathon..."
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    maxLength={2000}
                  />
                </div>
              </div>

              <div className="date-grid">
                <div className="form-group">
                  <label htmlFor="start-date">
                    Start Date
                  </label>

                  <input
                    id="start-date"
                    className="date-input"
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end-date">
                    End Date
                  </label>

                  <input
                    id="end-date"
                    className="date-input"
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="issue-date">
                  Certificate Issue Date
                </label>

                <input
                  id="issue-date"
                  className="date-input"
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hackathon-status">
                  Status
                </label>

                <select
                  id="hackathon-status"
                  className="status-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="upcoming">
                    Upcoming
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingHackathon
                    ? "Update Hackathon"
                    : "Create Hackathon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Hackathons;