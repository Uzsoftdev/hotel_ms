import { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getUsers, deleteUser, banUser, toggleVip, updateLoyalty, getUserDetail } from "../../../services/admin";

const TIER_STYLE = {
  platinum: "bg-violet-100 text-violet-700 border border-violet-200",
  gold: "bg-amber-100 text-amber-700 border border-amber-200",
  silver: "bg-slate-100 text-slate-600 border border-slate-200",
  bronze: "bg-orange-50 text-orange-600 border border-orange-200",
};
const TIER_ICON = { platinum: "workspace_premium", gold: "emoji_events", silver: "military_tech", bronze: "stars" };

function Avatar({ name, photo }) {
  if (photo) return <img src={photo} className="w-8 h-8 rounded-full object-cover" alt="" />;
  const init = (name || "?").charAt(0).toUpperCase();
  const colors = ["bg-primary/20 text-primary", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700"];
  const c = colors[(init.charCodeAt(0) || 0) % colors.length];
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${c}`}>{init}</div>;
}

function BanModal({ guest, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const isBanning = !guest.is_banned;
  async function submit() {
    setSaving(true);
    await onConfirm(guest.id, isBanning, reason);
    setSaving(false);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-lg">{isBanning ? "Ban Guest" : "Unban Guest"}</h3>
        <p className="text-sm text-on-surface-variant">
          {isBanning
            ? `This will prevent ${guest.full_name || guest.email} from logging in or making bookings.`
            : `This will restore ${guest.full_name || guest.email}'s access.`}
        </p>
        {isBanning && (
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Reason (optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
              className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="Violation reason, policy breach…" />
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
          <button onClick={submit} disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50 ${isBanning ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
            {saving ? "Saving…" : isBanning ? "Ban" : "Unban"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoyaltyModal({ guest, onClose, onConfirm }) {
  const [delta, setDelta] = useState(100);
  const [tier, setTier] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit() {
    setSaving(true);
    await onConfirm(guest.id, Number(delta), tier || undefined);
    setSaving(false);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold text-lg">Adjust Loyalty Points</h3>
        <p className="text-sm text-on-surface-variant">Current: <span className="font-bold">{guest.loyalty_points ?? 0} pts</span> ({guest.loyalty_tier || "bronze"})</p>
        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-1">Points change (+ add / - deduct)</label>
          <input type="number" value={delta} onChange={(e) => setDelta(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface-variant mb-1">Override tier (optional)</label>
          <select value={tier} onChange={(e) => setTier(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
            <option value="">Auto (based on points)</option>
            {["bronze", "silver", "gold", "platinum"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ guestId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guestId) return;
    setLoading(true);
    getUserDetail(guestId).then((r) => setDetail(r.data)).catch(() => setDetail(null)).finally(() => setLoading(false));
  }, [guestId]);

  const STATUS_STYLE = { confirmed: "text-emerald-600", pending: "text-amber-600", cancelled: "text-red-500", completed: "text-blue-600" };

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h3 className="font-bold text-lg">Guest Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">Failed to load</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar name={detail.user.full_name} photo={detail.user.photo_url} />
              <div>
                <p className="font-bold text-lg">{detail.user.full_name || "Guest"}</p>
                <p className="text-on-surface-variant text-sm">{detail.user.email}</p>
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {detail.user.vip_status && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>VIP
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${TIER_STYLE[detail.user.loyalty_tier] || TIER_STYLE.bronze}`}>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{TIER_ICON[detail.user.loyalty_tier] || "stars"}</span>
                {(detail.user.loyalty_tier || "bronze").charAt(0).toUpperCase() + (detail.user.loyalty_tier || "bronze").slice(1)} · {detail.user.loyalty_points ?? 0} pts
              </span>
              {detail.user.is_banned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                  <span className="material-symbols-outlined text-[14px]">block</span>Banned
                </span>
              )}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Total Bookings", detail.stats.total_bookings, "book_online"],
                ["Total Spent", `$${detail.stats.total_spent.toFixed(2)}`, "payments"],
              ].map(([label, val, icon]) => (
                <div key={label} className="bg-surface-container-low rounded-xl p-4">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
                  <p className="text-xl font-extrabold mt-1">{val}</p>
                  <p className="text-xs text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
            {/* Info */}
            <div className="space-y-2 text-sm">
              {detail.user.phone && <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Phone</span><span className="font-semibold">{detail.user.phone}</span></div>}
              {detail.user.notes && <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Notes</span><span className="font-semibold">{detail.user.notes}</span></div>}
              {detail.user.ban_reason && <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Ban reason</span><span className="font-semibold text-red-600">{detail.user.ban_reason}</span></div>}
              <div className="flex gap-2"><span className="text-on-surface-variant w-20 shrink-0">Joined</span><span className="font-semibold">{detail.user.created_at ? new Date(detail.user.created_at).toLocaleDateString() : "—"}</span></div>
            </div>
            {/* Recent bookings */}
            {detail.stats.recent_bookings.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Recent Bookings</p>
                <div className="space-y-2">
                  {detail.stats.recent_bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold">#{b.id} · Room {b.room_id}</p>
                        <p className="text-xs text-on-surface-variant">{b.check_in} → {b.check_out}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold capitalize ${STATUS_STYLE[b.status] || "text-on-surface-variant"}`}>{b.status}</p>
                        <p className="text-xs text-on-surface-variant">${b.total_price.toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AllGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | vip | banned
  const [sortBy, setSortBy] = useState("joined"); // joined | name | points
  const [acting, setActing] = useState(null);
  const [banTarget, setBanTarget] = useState(null);
  const [loyaltyTarget, setLoyaltyTarget] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function reload() {
    setLoading(true);
    getUsers("guest").then((r) => setGuests(r.data)).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  async function handleBan(id, ban, reason) {
    setActing(id);
    try {
      const r = await banUser(id, ban, reason);
      setGuests((prev) => prev.map((g) => g.id === id ? { ...g, ...r.data } : g));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleVip(id) {
    setActing(id);
    try {
      const r = await toggleVip(id);
      setGuests((prev) => prev.map((g) => g.id === id ? { ...g, ...r.data } : g));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleLoyalty(id, delta, tier) {
    setActing(id);
    try {
      const r = await updateLoyalty(id, delta, tier);
      setGuests((prev) => prev.map((g) => g.id === id ? { ...g, ...r.data } : g));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setActing(null); }
  }

  async function handleDelete(id) {
    if (!confirm("Permanently delete this guest account?")) return;
    setDeleting(id);
    try {
      await deleteUser(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
    finally { setDeleting(null); }
  }

  const vipCount = guests.filter((g) => g.vip_status).length;
  const bannedCount = guests.filter((g) => g.is_banned).length;
  const platinumCount = guests.filter((g) => g.loyalty_tier === "platinum").length;

  const filtered = guests
    .filter((g) => {
      const q = search.toLowerCase();
      const matchSearch = !q || (g.full_name || "").toLowerCase().includes(q) || (g.email || "").toLowerCase().includes(q);
      const matchFilter = filter === "all" || (filter === "vip" && g.vip_status) || (filter === "banned" && g.is_banned);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "");
      if (sortBy === "points") return (b.loyalty_points || 0) - (a.loyalty_points || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">All Guests</h1>
            <p className="text-on-surface-variant mt-1">{guests.length} registered guest{guests.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Total Guests", guests.length, "group", "text-primary"],
            ["VIP Members", vipCount, "star", "text-amber-500"],
            ["Platinum Tier", platinumCount, "workspace_premium", "text-violet-600"],
            ["Banned", bannedCount, "block", "text-red-500"],
          ].map(([label, val, icon, color]) => (
            <div key={label} className="bg-white rounded-xl border border-outline-variant/30 p-4 flex items-center gap-3">
              <span className={`material-symbols-outlined text-[28px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <div>
                <p className="text-2xl font-extrabold">{val}</p>
                <p className="text-xs text-on-surface-variant">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            {[["all", "All"], ["vip", "VIP"], ["banned", "Banned"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === val ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary bg-white">
              <option value="joined">Sort: Newest</option>
              <option value="name">Sort: Name</option>
              <option value="points">Sort: Loyalty Points</option>
            </select>
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-2 text-[18px]">search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guests…"
                className="border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-52" />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant/30 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Guest", "Email", "Loyalty", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((g) => {
                  const tier = g.loyalty_tier || "bronze";
                  return (
                    <tr key={g.id} className={`hover:bg-surface-container-low/50 transition-colors ${g.is_banned ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetailId(g.id)} className="flex items-center gap-2.5 hover:text-primary transition-colors text-left">
                          <Avatar name={g.full_name} photo={g.photo_url} />
                          <div>
                            <p className="font-semibold">{g.full_name || "—"}</p>
                            {g.vip_status && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>VIP
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{g.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TIER_STYLE[tier]}`}>
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{TIER_ICON[tier]}</span>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)} · {g.loyalty_points ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {g.is_banned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                            <span className="material-symbols-outlined text-[11px]">block</span>Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                            <span className="material-symbols-outlined text-[11px]">check_circle</span>Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
                        {g.created_at ? new Date(g.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetailId(g.id)} title="View profile"
                            className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                          </button>
                          <button onClick={() => handleVip(g.id)} disabled={acting === g.id} title={g.vip_status ? "Remove VIP" : "Grant VIP"}
                            className={`p-1.5 rounded-lg hover:bg-amber-50 transition-colors ${g.vip_status ? "text-amber-500" : "text-on-surface-variant hover:text-amber-500"}`}>
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${g.vip_status ? 1 : 0}` }}>star</span>
                          </button>
                          <button onClick={() => setLoyaltyTarget(g)} title="Adjust loyalty"
                            className="p-1.5 rounded-lg hover:bg-violet-50 text-on-surface-variant hover:text-violet-600 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                          </button>
                          <button onClick={() => setBanTarget(g)} disabled={acting === g.id} title={g.is_banned ? "Unban" : "Ban"}
                            className={`p-1.5 rounded-lg hover:bg-red-50 transition-colors ${g.is_banned ? "text-red-500" : "text-on-surface-variant hover:text-red-500"}`}>
                            <span className="material-symbols-outlined text-[16px]">{g.is_banned ? "lock_open" : "block"}</span>
                          </button>
                          <button onClick={() => handleDelete(g.id)} disabled={deleting === g.id} title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-14 text-center text-on-surface-variant">
                    {search || filter !== "all" ? "No guests match your filters" : "No guests yet"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {banTarget && (
        <BanModal guest={banTarget} onClose={() => setBanTarget(null)}
          onConfirm={async (id, ban, reason) => { await handleBan(id, ban, reason); }} />
      )}
      {loyaltyTarget && (
        <LoyaltyModal guest={loyaltyTarget} onClose={() => setLoyaltyTarget(null)} onConfirm={handleLoyalty} />
      )}
      {detailId && <DetailPanel guestId={detailId} onClose={() => setDetailId(null)} />}
    </AdminLayout>
  );
}
