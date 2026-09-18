import { useEffect, useState } from "react";

import {
  Trophy,
  Medal,
  Users,
  X,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./Winners.css";

import API from "../../services/api";

function Winners() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const urlHackathon =
    searchParams.get("hackathon");

  const [hackathons, setHackathons] =
    useState([]);

  const [selectedHackathon, setSelectedHackathon] =
    useState(urlHackathon || "");

  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);

  const [savingTeam, setSavingTeam] =
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
          (item) => item._id === urlHackathon
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

const fetchTeams = async () => {
  if (!selectedHackathon) {
    setTeams([]);
    return;
  }

  try {
    setLoading(true);

    const response = await API.get(
      `/winners/hackathon/${selectedHackathon}`,
      authConfig()
    );

    setTeams(response.data.teams || []);
  } catch (error) {
    console.error(
      "Fetch Winner Teams Error:",
      error.response?.data || error.message
    );

    if (error.response?.status == 401) {
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
      fetchTeams();
    }
  }, [selectedHackathon]);

  const handleHackathonChange = (e) => {
    const value = e.target.value;

    setSelectedHackathon(value);

    if (value) {
      navigate(
        `/admin/winners?hackathon=${value}`,
        {
          replace: true,
        }
      );
    } else {
      navigate("/admin/winners", {
        replace: true,
      });
    }
  };

  const assignWinner = async (
    teamId,
    position
  ) => {
    try {
      setSavingTeam(teamId);

      await API.patch(
        `/winners/${teamId}`,
        {
          winnerPosition: position,
        },
        authConfig()
      );

      await fetchTeams();
    } catch (error) {
      console.error(
        "Assign Winner Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to assign winner"
      );
    } finally {
      setSavingTeam(null);
    }
  };

  const removeWinner = async (teamId) => {
    try {
      setSavingTeam(teamId);

      await API.patch(
        `/winners/${teamId}`,
        {
          winnerPosition: null,
        },
        authConfig()
      );

      await fetchTeams();
    } catch (error) {
      console.error(
        "Remove Winner Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to remove winner"
      );
    } finally {
      setSavingTeam(null);
    }
  };

  const getPositionLabel = (position) => {
    if (position === 1) {
      return "1st Winner";
    }

    if (position === 2) {
      return "2nd Winner";
    }

    if (position === 3) {
      return "3rd Winner";
    }

    return "";
  };

  const winnerTeams = teams
    .filter(
      (team) => team.winnerPosition
    )
    .sort(
      (a, b) =>
        a.winnerPosition -
        b.winnerPosition
    );

  return (
    <main className="winners">
      <div className="winners-container">
        <div className="winners-header">
          <div>
            <h1>Winners</h1>

            <p>
              Assign 1st, 2nd and 3rd place
              to teams.
            </p>
          </div>
        </div>

        <div className="winner-filter">
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
          <div className="empty-winners">
            <Trophy size={36} />

            <h2>
              Select a hackathon
            </h2>

            <p>
              Choose a hackathon to assign
              winners.
            </p>
          </div>
        ) : loading ? (
          <div className="winners-loading">
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-winners">
            <Users size={36} />

            <h2>
              No teams found
            </h2>

            <p>
              Create teams before assigning
              winners.
            </p>
          </div>
        ) : (
          <>
            <section className="winner-summary">
              <div className="summary-header">
                <div>
                  <h2>
                    Winner Positions
                  </h2>

                  <p>
                    Each position can be
                    assigned to only one team.
                  </p>
                </div>
              </div>

              <div className="winner-summary-grid">
                {[1, 2, 3].map(
                  (position) => {
                    const winner =
                      winnerTeams.find(
                        (team) =>
                          team.winnerPosition ===
                          position
                      );

                    return (
                      <div
                        className="winner-position-card"
                        key={position}
                      >
                        <div className="position-icon">
                          <Medal
                            size={20}
                          />
                        </div>

                        <div>
                          <span>
                            {getPositionLabel(
                              position
                            )}
                          </span>

                          <strong>
                            {winner
                              ? winner.teamName
                              : "Not assigned"}
                          </strong>
                        </div>

                        {winner && (
                          <button
                            onClick={() =>
                              removeWinner(
                                winner._id
                              )
                            }
                            disabled={
                              savingTeam ===
                              winner._id
                            }
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section className="teams-winner-section">
              <div className="section-heading">
                <div>
                  <h2>
                    Teams
                  </h2>

                  <p>
                    Select a position for
                    each winning team.
                  </p>
                </div>
              </div>

              <div className="winner-teams-grid">
                {teams.map((team) => (
                  <div
                    className="winner-team-card"
                    key={team._id}
                  >
                    <div className="winner-team-top">
                      <div className="winner-team-icon">
                        <Users size={19} />
                      </div>

                      {team.winnerPosition && (
                        <span className="assigned-badge">
                          {getPositionLabel(
                            team.winnerPosition
                          )}
                        </span>
                      )}
                    </div>

                    <h3>
                      {team.teamName}
                    </h3>

                    <p>
                      Registration ID:{" "}
                      <strong>
                        {
                          team.registrationId
                        }
                      </strong>
                    </p>

                    <div className="position-buttons">
                      {[1, 2, 3].map(
                        (position) => (
                          <button
                            key={position}
                            className={
                              team.winnerPosition ===
                              position
                                ? "selected-position"
                                : ""
                            }
                            disabled={
                              savingTeam ===
                              team._id
                            }
                            onClick={() =>
                              assignWinner(
                                team._id,
                                position
                              )
                            }
                          >
                            {position === 1
                              ? "1st"
                              : position === 2
                              ? "2nd"
                              : "3rd"}
                          </button>
                        )
                      )}

                      {team.winnerPosition && (
                        <button
                          className="remove-position"
                          disabled={
                            savingTeam ===
                            team._id
                          }
                          onClick={() =>
                            removeWinner(
                              team._id
                            )
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Winners;