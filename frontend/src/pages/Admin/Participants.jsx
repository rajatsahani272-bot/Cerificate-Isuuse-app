
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Mail,
  GraduationCap,
  UserPlus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import "./Participants.css";
import API from "../../services/api";

const INITIAL_FORM = {
  teamId: "",
  name: "",
  email: "",
  college: "",
};

function Participants() {
  const [hackathons, setHackathons] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);

  const [selectedHackathon, setSelectedHackathon] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  const config = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const getErrorMessage = (error, fallbackMessage) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      fallbackMessage
    );
  };

  const fetchHackathons = useCallback(async () => {
    try {
      setPageLoading(true);
      setErrorMessage("");

      const response = await API.get("/hackathons", config);

      const hackathonList = response.data?.hackathons || [];

      setHackathons(hackathonList);

      if (hackathonList.length > 0) {
        setSelectedHackathon((currentValue) => {
          const exists = hackathonList.some(
            (hackathon) => hackathon._id === currentValue
          );

          return exists ? currentValue : hackathonList[0]._id;
        });
      } else {
        setSelectedHackathon("");
        setParticipants([]);
        setTeams([]);
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to load hackathons")
      );
    } finally {
      setPageLoading(false);
    }
  }, [config]);

  const fetchParticipants = useCallback(async () => {
    if (!selectedHackathon) {
      setParticipants([]);
      return;
    }

    try {
      setPageLoading(true);
      setErrorMessage("");

      const response = await API.get(
        `/participants/${selectedHackathon}`,
        config
      );

      setParticipants(response.data?.participants || []);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to load participants")
      );
      setParticipants([]);
    } finally {
      setPageLoading(false);
    }
  }, [selectedHackathon, config]);

  const fetchTeams = useCallback(async () => {
    if (!selectedHackathon) {
      setTeams([]);
      return;
    }

    try {
      setTeamsLoading(true);

      const response = await API.get(
        `/teams/${selectedHackathon}`,
        config
      );

      setTeams(response.data?.teams || []);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to load teams")
      );
      setTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  }, [selectedHackathon, config]);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  useEffect(() => {
    if (!selectedHackathon) {
      setParticipants([]);
      setTeams([]);
      return;
    }

    fetchParticipants();
    fetchTeams();
  }, [selectedHackathon, fetchParticipants, fetchTeams]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setEditingParticipant(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (participant) => {
    setEditingParticipant(participant);

    setForm({
      teamId:
        typeof participant.teamId === "object"
          ? participant.teamId?._id || ""
          : participant.teamId || "",
      name: participant.name || "",
      email: participant.email || "",
      college: participant.college || "",
    });

    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedCollege = form.college.trim();

    if (!form.teamId) {
      newErrors.teamId = "Please select a team";
    }

    if (!trimmedName) {
      newErrors.name = "Participant name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must contain at least 2 characters";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address";
    }

    if (trimmedCollege.length > 150) {
      newErrors.college =
        "College name cannot exceed 150 characters";
    }

    const duplicateEmail = participants.some((participant) => {
      const sameEmail =
        participant.email?.trim().toLowerCase() === trimmedEmail;

      const isDifferentParticipant =
        participant._id !== editingParticipant?._id;

      return sameEmail && isDifferentParticipant;
    });

    if (duplicateEmail) {
      newErrors.email =
        "This email is already registered in this hackathon";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !selectedHackathon) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      college: form.college.trim(),
      teamId: form.teamId,
    };

    try {
      setLoading(true);
      setErrorMessage("");

      if (editingParticipant) {
        await API.put(
          `/participants/${editingParticipant._id}`,
          payload,
          config
        );
      } else {
        await API.post(
          "/participants",
          {
            hackathonId: selectedHackathon,
            ...payload,
          },
          config
        );
      }

      closeModal();
      await fetchParticipants();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to save participant")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (participantId) => {
    if (!participantId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this participant?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await API.delete(
        `/participants/${participantId}`,
        config
      );

      await fetchParticipants();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to delete participant")
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedTeamExists = teams.length > 0;

  return (
    <main className="participants-page">
      <div className="participants-container">
        <div className="participants-header">
          <div className="page-title">
            <div className="page-title-icon">
              <Users size={22} />
            </div>

            <div>
              <h1>Participants</h1>
              <p>
                Manage participants registered for your hackathons.
              </p>
            </div>
          </div>

          <div className="table-actions">
            <button
              className="secondary-button"
              onClick={() => {
                fetchParticipants();
                fetchTeams();
              }}
              disabled={!selectedHackathon || pageLoading}
              title="Refresh"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={openAddModal}
              disabled={!selectedHackathon || !selectedTeamExists}
            >
              <Plus size={17} />
              Add Participant
            </button>
          </div>
        </div>

        <div className="participant-toolbar">
          <div className="hackathon-selector">
            <label htmlFor="hackathon-select">
              Hackathon
            </label>

            <select
              id="hackathon-select"
              value={selectedHackathon}
              onChange={(event) =>
                setSelectedHackathon(event.target.value)
              }
              disabled={pageLoading}
            >
              <option value="">Select hackathon</option>

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

          <div className="participant-count">
            <Users size={17} />
            {participants.length} Participants
          </div>
        </div>

        {errorMessage && (
          <div className="error-message" role="alert">
            <AlertCircle size={17} />
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {pageLoading ? (
          <div className="empty-state">
            <RefreshCw size={28} className="loading-icon" />
            <h3>Loading participants...</h3>
          </div>
        ) : !selectedHackathon ? (
          <div className="empty-state">
            <Users size={35} />
            <h3>Select a hackathon</h3>
            <p>
              Select a hackathon to manage its participants.
            </p>
          </div>
        ) : participants.length === 0 ? (
          <div className="empty-state">
            <Users size={35} />
            <h3>No participants found</h3>
            <p>
              Add participants to this hackathon to see them here.
            </p>

            {selectedTeamExists ? (
              <button
                className="primary-button"
                onClick={openAddModal}
              >
                <UserPlus size={17} />
                Add Participant
              </button>
            ) : (
              <p>
                No teams found. Create a team before adding a
                participant.
              </p>
            )}
          </div>
        ) : (
          <div className="participants-table-wrapper">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Team</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {participants.map((participant) => (
                  <tr key={participant._id}>
                    <td>
                      <div className="participant-name">
                        <div className="participant-avatar">
                          {participant.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <span>{participant.name}</span>
                      </div>
                    </td>

                    <td>
                      <div className="email-cell">
                        <Mail size={15} />
                        {participant.email}
                      </div>
                    </td>

                    <td>
                      <div className="college-cell">
                        <GraduationCap size={15} />
                        {participant.college || "—"}
                      </div>
                    </td>

                    <td>
                      <span className="team-badge">
                        {participant.teamId?.teamName ||
                          "No Team"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="edit-button"
                          onClick={() =>
                            openEditModal(participant)
                          }
                          disabled={loading}
                          aria-label="Edit participant"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(participant._id)
                          }
                          disabled={loading}
                          aria-label="Delete participant"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="participant-modal-title"
            >
              <div className="modal-header">
                <div>
                  <h2 id="participant-modal-title">
                    {editingParticipant
                      ? "Edit Participant"
                      : "Add Participant"}
                  </h2>

                  <p>
                    {editingParticipant
                      ? "Update participant details."
                      : "Add a participant to a team."}
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={closeModal}
                  disabled={loading}
                  aria-label="Close modal"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="teamId">Team</label>

                  <select
                    id="teamId"
                    name="teamId"
                    value={form.teamId}
                    onChange={handleChange}
                    disabled={loading || teamsLoading}
                    aria-invalid={Boolean(errors.teamId)}
                  >
                    <option value="">
                      {teamsLoading
                        ? "Loading teams..."
                        : "Select team"}
                    </option>

                    {teams.map((team) => (
                      <option
                        key={team._id}
                        value={team._id}
                      >
                        {team.teamName}
                      </option>
                    ))}
                  </select>

                  {errors.teamId && (
                    <small className="field-error">
                      {errors.teamId}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="participant-name">
                    Participant Name
                  </label>

                  <div className="input-wrapper">
                    <Users size={17} />

                    <input
                      id="participant-name"
                      type="text"
                      name="name"
                      placeholder="Enter participant name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={100}
                      aria-invalid={Boolean(errors.name)}
                    />
                  </div>

                  {errors.name && (
                    <small className="field-error">
                      {errors.name}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="participant-email">
                    Email Address
                  </label>

                  <div className="input-wrapper">
                    <Mail size={17} />

                    <input
                      id="participant-email"
                      type="email"
                      name="email"
                      placeholder="participant@example.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={150}
                      aria-invalid={Boolean(errors.email)}
                    />
                  </div>

                  {errors.email && (
                    <small className="field-error">
                      {errors.email}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="participant-college">
                    College
                  </label>

                  <div className="input-wrapper">
                    <GraduationCap size={17} />

                    <input
                      id="participant-college"
                      type="text"
                      name="college"
                      placeholder="Enter college name"
                      value={form.college}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={150}
                      aria-invalid={Boolean(errors.college)}
                    />
                  </div>

                  {errors.college && (
                    <small className="field-error">
                      {errors.college}
                    </small>
                  )}
                </div>

                <button
                  className="submit-button"
                  type="submit"
                  disabled={loading || teamsLoading}
                >
                  {loading
                    ? "Saving..."
                    : editingParticipant
                    ? "Update Participant"
                    : "Add Participant"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Participants;