import { useEffect, useState } from "react";
import UserLayout from "./Layout/UserLayout";
import { getMyReviews, deleteReview } from "../../services/user";

function StarPicker({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={() => !readonly && onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: 24, color: i <= (hovered || value) ? "#F59E0B" : "var(--border-strong)",
            cursor: readonly ? "default" : "pointer", transition: "color .1s",
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [draft, setDraft]       = useState({ rating: 0, comment: "" });

  useEffect(() => {
    getMyReviews()
      .then((r) => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to delete review.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <UserLayout>
      <div>
        <h1 className="ah-h1" style={{ fontSize: 32, marginBottom: 24 }}>Reviews</h1>

        {/* Leave a review prompt */}
        <div className="ah-card" style={{ padding: 24, marginBottom: 24 }}>
          <div className="ah-eyebrow" style={{ marginBottom: 8 }}>Share your experience</div>
          <h3 className="ah-h3" style={{ marginBottom: 4 }}>Leave a review</h3>
          <p className="ah-muted" style={{ fontSize: 13, marginBottom: 16 }}>Rate your most recent stay and help future guests.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Your rating</span>
            <StarPicker value={draft.rating} onChange={(v) => setDraft((d) => ({ ...d, rating: v }))} />
          </div>
          <textarea
            className="ah-textarea"
            rows={3}
            placeholder="What did you love? What could be better?"
            value={draft.comment}
            onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              className="ah-btn ah-btn-primary ah-btn-sm"
              disabled={!draft.rating || !draft.comment.trim()}
              onClick={() => alert("Review submission requires a completed booking. Check My Bookings.")}
            >
              Submit review
            </button>
          </div>
        </div>

        {/* Past reviews */}
        <h2 className="ah-h2" style={{ marginBottom: 16 }}>
          Your past reviews ({loading ? "…" : reviews.length})
        </h2>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="ah-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="ah-skeleton" style={{ height: 16, width: 160 }} />
                  <div className="ah-skeleton" style={{ height: 13, width: 80 }} />
                  <div className="ah-skeleton" style={{ height: 60 }} />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="ah-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#FEF9C3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <span className="material-symbols-outlined" style={{ color: "#D97706", fontSize: 28 }}>star</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>No reviews yet</p>
            <p className="ah-muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 16 }}>Complete a stay to leave your first review.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reviews.map((r) => (
              <div key={r.id} className="ah-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 className="ah-h3" style={{ fontSize: 15 }}>Hotel #{r.hotel_id}</h3>
                    <div className="ah-muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StarPicker value={r.rating} readonly />
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4, transition: "color .15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--error)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {deleting === r.id ? "progress_activity" : "delete"}
                      </span>
                    </button>
                  </div>
                </div>

                {r.comment && (
                  <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12, fontWeight: 500, color: "var(--text)" }}>{r.comment}</p>
                )}

                {/* Hotel response (placeholder — extend when backend supports it) */}
                {r.response && (
                  <div style={{ marginTop: 14, padding: 14, background: "var(--bg)", borderRadius: 10, borderLeft: "3px solid var(--primary)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>Response from allStay</div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.55, color: "var(--text)" }}>{r.response}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
