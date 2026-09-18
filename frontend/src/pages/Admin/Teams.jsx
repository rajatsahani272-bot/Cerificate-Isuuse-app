import { useEffect, useState } from "react";

import { Plus, Users, UserPlus, Pencil, Trash2, X, Trophy } from "lucide-react";

import { useSearchParams, useNavigate } from "react-router-dom";

import "./Teams.css";

import API from "../../services/api";

function Teams() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlHackathon = searchParams.get("hackathon");

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState("");

  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [loadingHackathons, setLoadingHackathons] = useState(true);

  const [loading, setLoading] = useState(false);

  const [showTeamModal, setShowTeamModal] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);

  const [editingTeam, setEditingTeam] = useState(null);

  const [selectedTeam, setSelectedTeam] = useState(null);

  const [saving, setSaving] = useState(false);

  const [teamForm, setTeamForm] = useState({
    teamName: "",
    registrationId: "",
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    college: "",
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const authConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchHackathons = async () => {
    try {
      setLoadingHackathons(true);

      const token = getToken();

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await API.get("/hackathons/admin", authConfig());

      const data = response.data?.hackathons || [];

      setHackathons(data);

      if (data.length === 0) {
        setSelectedHackathon("");
        return;
      }

      const urlHackathonExists =
        urlHackathon &&
        data.some((hackathon) => hackathon._id === urlHackathon);

      if (urlHackathonExists) {
        setSelectedHackathon(urlHackathon);
      } else {
        const firstHackathon = data[0];

        setSelectedHackathon(firstHackathon._id);

        navigate(`/admin/teams?hackathon=${firstHackathon._id}`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Fetch Hackathons Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
        return;
      }

      alert(error.response?.data?.message || "Unable to load hackathons");
    } finally {
      setLoadingHackathons(false);
    }
  };

  const fetchTeams = async () => {
    if (!selectedHackathon) {
      setTeams([]);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get(
        `/teams/${selectedHackathon}`,
        authConfig(),
      );

      setTeams(response.data?.teams || []);
    } catch (error) {
      console.error("Fetch Teams Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!selectedHackathon) {
      setParticipants([]);
      return;
    }

    try {
      const response = await API.get(
        `/participants/${selectedHackathon}`,
        authConfig(),
      );

      setParticipants(response.data?.participants || []);
    } catch (error) {
      console.error("Fetch Participants Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    if (!selectedHackathon) {
      setTeams([]);
      setParticipants([]);
      return;
    }

    fetchTeams();
    fetchParticipants();
  }, [selectedHackathon]);

  const handleHackathonChange = (e) => {
    const value = e.target.value;

    setSelectedHackathon(value);

    if (value) {
      navigate(`/admin/teams?hackathon=${value}`, {
        replace: true,
      });
    } else {
      navigate("/admin/teams", {
        replace: true,
      });
    }
  };

  const openCreateTeam = () => {
    if (!selectedHackathon) {
      alert("Please select a hackathon first");
      return;
    }

    setEditingTeam(null);

    setTeamForm({
      teamName: "",
      registrationId: "",
    });

    setShowTeamModal(true);
  };

  const openEditTeam = (team) => {
    setEditingTeam(team);

    setTeamForm({
      teamName: team.teamName || "",
      registrationId: team.registrationId || "",
    });

    setShowTeamModal(true);
  };

  const closeTeamModal = () => {
    if (saving) {
      return;
    }

    setShowTeamModal(false);
    setEditingTeam(null);
  };

  const openMemberModal = (team) => {
    setSelectedTeam(team);

    setMemberForm({
      name: "",
      email: "",
      college: "",
    });

    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    if (saving) {
      return;
    }

    setShowMemberModal(false);
    setSelectedTeam(null);
  };

  const handleTeamChange = (e) => {
    const { name, value } = e.target;

    setTeamForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;

    setMemberForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHackathon) {
      alert("Please select a hackathon");
      return;
    }

    try {
      setSaving(true);

      if (editingTeam) {
        await API.put(`/teams/${editingTeam._id}`, teamForm, authConfig());

        closeTeamModal();

        await fetchTeams();

        return;
      }

      const response = await API.post(
        "/teams",
        {
          hackathonId: selectedHackathon,
          teamName: teamForm.teamName,
          registrationId: teamForm.registrationId,
        },
        authConfig(),
      );

      const createdTeam = response.data?.team;

      closeTeamModal();

      await fetchTeams();

      if (createdTeam) {
        openMemberModal(createdTeam);
      }
    } catch (error) {
      console.error("Save Team Error:", error);

      alert(error.response?.data?.message || "Unable to save team");
    } finally {
      setSaving(false);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeam) {
      return;
    }

    try {
      setSaving(true);

      await API.post(
        "/participants",
        {
          hackathonId: selectedHackathon,
          teamId: selectedTeam._id,
          name: memberForm.name,
          email: memberForm.email,
          college: memberForm.college,
        },
        authConfig(),
      );

      setMemberForm({
        name: "",
        email: "",
        college: "",
      });

      await fetchParticipants();
    } catch (error) {
      console.error("Add Member Error:", error);

      alert(error.response?.data?.message || "Unable to add team member");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (team) => {
    const confirmed = window.confirm(`Delete team "${team.teamName}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/teams/${team._id}`, authConfig());

      await fetchTeams();
      await fetchParticipants();
    } catch (error) {
      console.error("Delete Team Error:", error);

      alert(error.response?.data?.message || "Unable to delete team");
    }
  };

  const getTeamMembers = (teamId) => {
    return participants.filter((participant) => {
      const participantTeamId = participant.teamId?._id || participant.teamId;

      return participantTeamId?.toString() === teamId?.toString();
    });
  };

  return (
    <main className="teams">
      <div className="teams-container">
        <div className="teams-header">
          <div>
            <h1>Teams</h1>

            <p>Manage teams and their members.</p>
          </div>

          <button
            className="create-team-button"
            onClick={openCreateTeam}
            disabled={loadingHackathons || !selectedHackathon}
          >
            <Plus size={17} />
            Create Team
          </button>
        </div>

        <div className="team-filter">
          <label>Select Hackathon</label>

          <select
            value={selectedHackathon}
            onChange={handleHackathonChange}
            disabled={loadingHackathons}
          >
            {loadingHackathons ? (
              <option value="">Loading hackathons...</option>
            ) : (
              <>
                <option value="">Select a hackathon</option>

                {hackathons.map((hackathon) => (
                  <option key={hackathon._id} value={hackathon._id}>
                    {hackathon.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {!loadingHackathons && hackathons.length === 0 ? (
          <div className="empty-teams">
            <Trophy size={35} />

            <h2>No hackathons found</h2>

            <p>Create a hackathon first before creating teams.</p>

            <button
              className="create-team-button"
              onClick={() => navigate("/admin/hackathons")}
            >
              <Plus size={17} />
              Create Hackathon
            </button>
          </div>
        ) : !selectedHackathon ? (
          <div className="empty-teams">
            <Trophy size={35} />

            <h2>Select a hackathon</h2>

            <p>Choose a hackathon to manage its teams.</p>
          </div>
        ) : loading ? (
          <div className="teams-loading">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="empty-teams">
            <Users size={35} />

            <h2>No teams yet</h2>

            <p>Create the first team for this hackathon.</p>

            <button className="create-team-button" onClick={openCreateTeam}>
              <Plus size={17} />
              Create Team
            </button>
          </div>
        ) : (
          <div className="teams-grid">
            {teams.map((team) => {
              const members = getTeamMembers(team._id);

              return (
                <div className="team-card" key={team._id}>
                  <div className="team-card-header">
                    <div className="team-icon">
                      <Users size={20} />
                    </div>

                    {team.winnerPosition && (
                      <span className="winner-badge">
                        <Trophy size={13} />

                        {team.winnerPosition === 1
                          ? "1st Winner"
                          : team.winnerPosition === 2
                            ? "2nd Winner"
                            : "3rd Winner"}
                      </span>
                    )}
                  </div>

                  <div className="team-card-content">
                    <h2>{team.teamName}</h2>

                    <p>
                      Registration ID: <strong>{team.registrationId}</strong>
                    </p>

                    <div className="member-count">
                      <UserPlus size={15} />

                      <span>
                        {members.length}{" "}
                        {members.length === 1 ? "Member" : "Members"}
                      </span>
                    </div>

                    {members.length > 0 && (
                      <div className="member-list">
                        {members.slice(0, 4).map((member) => (
                          <div className="member-item" key={member._id}>
                            <div className="member-avatar">
                              {member.name?.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <strong>{member.name}</strong>

                              <span>{member.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="team-card-actions">
                    <button onClick={() => openMemberModal(team)}>
                      <UserPlus size={15} />
                      Add Member
                    </button>

                    <button onClick={() => openEditTeam(team)}>
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      className="team-delete-button"
                      onClick={() => handleDeleteTeam(team)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTeamModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeTeamModal();
            }
          }}
        >
          <div className="team-modal">
            <div className="modal-header">
              <div>
                <h2>{editingTeam ? "Edit Team" : "Create Team"}</h2>

                <p>Enter the team details below.</p>
              </div>

              <button
                className="modal-close"
                onClick={closeTeamModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form className="team-form" onSubmit={handleTeamSubmit}>
              <div className="form-group">
                <label>Team Name</label>

                <input
                  type="text"
                  name="teamName"
                  value={teamForm.teamName}
                  onChange={handleTeamChange}
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Registration ID</label>

                <input
                  type="text"
                  name="registrationId"
                  value={teamForm.registrationId}
                  onChange={handleTeamChange}
                  placeholder="Enter registration ID"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeTeamModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingTeam
                      ? "Update Team"
                      : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeMemberModal();
            }
          }}
        >
          <div className="team-modal">
            <div className="modal-header">
              <div>
                <h2>Add Team Member</h2>

                <p>{selectedTeam?.teamName}</p>
              </div>

              <button
                className="modal-close"
                onClick={closeMemberModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form className="team-form" onSubmit={handleMemberSubmit}>
              <div className="form-group">
                <label>Participant Name</label>

                <input
                  type="text"
                  name="name"
                  value={memberForm.name}
                  onChange={handleMemberChange}
                  placeholder="Enter participant name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  value={memberForm.email}
                  onChange={handleMemberChange}
                  placeholder="participant@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>College</label>

                <input
                  type="text"
                  name="college"
                  value={memberForm.college}
                  onChange={handleMemberChange}
                  placeholder="Enter college name"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeMemberModal}
                  disabled={saving}
                >
                  Done
                </button>

                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Teams;
