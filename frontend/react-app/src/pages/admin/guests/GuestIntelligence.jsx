import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../Layout/AdminLayout";
import {
  getGuestIntelligenceList,
  getGuestIntelligenceOverview,
  getGuestIntelligenceProfile,
  getGuestTimeline,
  getGuestNotes,
  addGuestNote,
  deleteGuestNote,
  updateGuestSegment,
  blacklistGuest,
  toggleVip,
} from "../../../services/admin";

// ─── Config constants ──────────────────────────────────────────────────────

const SEGMENT_CONFIG = {
  vip: { color: '#F59E0B', bg: '#FEF3C7', icon: 'workspace_premium', label: 'VIP' },
  frequent: { color: '#3B82F6', bg: '#DBEAFE', icon: 'repeat', label: 'Frequent' },
  business_traveler: { color: '#6366F1', bg: '#EDE9FE', icon: 'business_center', label: 'Business' },
  family: { color: '#22C55E', bg: '#DCFCE7', icon: 'family_restroom', label: 'Family' },
  regular: { color: '#6B7280', bg: '#F3F4F6', icon: 'person', label: 'Regular' },
  risky: { color: '#EF4444', bg: '#FEE2E2', icon: 'warning', label: 'Risky' },
  new: { color: '#14B8A6', bg: '#CCFBF1', icon: 'fiber_new', label: 'New Guest' },
  blacklisted: { color: '#991B1B', bg: '#FEE2E2', icon: 'block', label: 'Blacklisted' },
  casual: { color: '#8B5CF6', bg: '#EDE9FE', icon: 'person_outline', label: 'Casual' },
};

const TIER_CONFIG = {
  platinum: { color: '#64748B', icon: 'diamond', label: 'Platinum' },
  gold: { color: '#F59E0B', icon: 'emoji_events', label: 'Gold' },
  silver: { color: '#9CA3AF', icon: 'military_tech', label: 'Silver' },
  bronze: { color: '#B45309', icon: 'grade', label: 'Bronze' },
};

const SEGMENT_DESCRIPTIONS = {
  vip: 'High-value guests with premium spending patterns or explicit VIP status.',
  frequent: 'Guests with 8+ completed stays showing strong loyalty.',
  business_traveler: 'Corporate travelers with frequent short stays.',
  family: 'Family groups booking larger rooms with children.',
  regular: 'Reliable guests with 3+ completed stays.',
  risky: 'Guests with a high cancellation rate (>50%).',
  new: 'First-time or no-booking guests — potential to convert.',
  blacklisted: 'Banned guests blocked from making bookings.',
  casual: 'Occasional travelers with limited booking history.',
};

const STATUS_COLORS = {
  completed: { color: '#16A34A', bg: '#DCFCE7' },
  confirmed: { color: '#2563EB', bg: '#DBEAFE' },
  pending: { color: '#D97706', bg: '#FEF3C7' },
  cancelled: { color: '#DC2626', bg: '#FEE2E2' },
};

const NOTE_TYPES = ['general', 'complaint', 'preference', 'vip_request', 'warning', 'compliment'];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatCurrency(val) {
  if (!val && val !== 0) return '$0';
  return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function aiScoreColor(score) {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#2563EB';
  if (score >= 40) return '#D97706';
  return '#DC2626';
}

function riskColor(score) {
  if (score >= 70) return '#DC2626';
  if (score >= 40) return '#D97706';
  return '#16A34A';
}

function churnColor(p) {
  if (p >= 65) return '#DC2626';
  if (p >= 40) return '#D97706';
  return '#16A34A';
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Avatar({ name, photo, size = 36 }) {
  const initials = getInitials(name);
  const colors = [
    { bg: '#EDE9FE', text: '#6D28D9' },
    { bg: '#DCFCE7', text: '#15803D' },
    { bg: '#DBEAFE', text: '#1D4ED8' },
    { bg: '#FEF3C7', text: '#B45309' },
    { bg: '#FCE7F3', text: '#9D174D' },
  ];
  const c = colors[(initials.charCodeAt(0) || 0) % colors.length];

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function SegmentBadge({ segment, small = false }) {
  const cfg = SEGMENT_CONFIG[segment] || { color: '#6B7280', bg: '#F3F4F6', icon: 'person', label: segment };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: cfg.bg, color: cfg.color,
      borderRadius: 99, padding: small ? '2px 8px' : '3px 10px',
      fontSize: small ? 11 : 12, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: small ? 12 : 13, fontVariationSettings: "'FILL' 1" }}>
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function TierBadge({ tier }) {
  const cfg = TIER_CONFIG[tier?.toLowerCase()] || TIER_CONFIG.bronze;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      color: cfg.color, fontSize: 12, fontWeight: 700,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function AIScoreBar({ score }) {
  const color = aiScoreColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
      <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 24 }}>{score}</span>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color = '#6366F1', loading }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 160,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
          {loading ? <span style={{ opacity: 0.3 }}>…</span> : value}
        </div>
        {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function GuestIntelligence() {
  const [activeTab, setActiveTab] = useState('overview');
  const [guests, setGuests] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [panelTab, setPanelTab] = useState('profile');
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [loadingNoteAdd, setLoadingNoteAdd] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load overview + guests on mount
  useEffect(() => {
    loadOverview();
    loadGuests();
  }, []);

  // Reload guests when filters change
  useEffect(() => {
    loadGuests();
  }, [search, segmentFilter, tierFilter]);

  async function loadOverview() {
    setLoadingOverview(true);
    try {
      const res = await getGuestIntelligenceOverview();
      setOverview(res.data);
      setApiError(null);
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Unknown error';
      setApiError(`Failed to load overview: ${msg}`);
      console.error('Failed to load overview', e);
    } finally {
      setLoadingOverview(false);
    }
  }

  async function loadGuests() {
    setLoadingGuests(true);
    try {
      const params = { limit: 100, offset: 0 };
      if (search) params.search = search;
      if (segmentFilter) params.segment = segmentFilter;
      if (tierFilter) params.tier = tierFilter;
      const res = await getGuestIntelligenceList(params);
      setGuests(res.data.guests || []);
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Unknown error';
      setApiError(`Failed to load guests: ${msg}`);
      console.error('Failed to load guests', e);
    } finally {
      setLoadingGuests(false);
    }
  }

  const handleSelectGuest = useCallback(async (id) => {
    setLoadingPanel(true);
    setPanelOpen(true);
    setPanelTab('profile');
    try {
      const [profileRes, notesRes] = await Promise.all([
        getGuestIntelligenceProfile(id),
        getGuestNotes(id),
      ]);
      setSelectedGuest(profileRes.data);
      setNotes(notesRes.data || []);
    } catch (e) {
      console.error('Failed to load guest profile', e);
    } finally {
      setLoadingPanel(false);
    }
  }, []);

  async function handlePanelTabChange(tab) {
    setPanelTab(tab);
    if (!selectedGuest) return;
    if (tab === 'timeline') {
      try {
        const res = await getGuestTimeline(selectedGuest.id);
        setTimeline(res.data || []);
      } catch (e) {
        console.error('Failed to load timeline', e);
      }
    }
    if (tab === 'notes') {
      try {
        const res = await getGuestNotes(selectedGuest.id);
        setNotes(res.data || []);
      } catch (e) {
        console.error('Failed to load notes', e);
      }
    }
  }

  async function handleAddNote() {
    if (!noteInput.trim() || !selectedGuest) return;
    setLoadingNoteAdd(true);
    try {
      await addGuestNote(selectedGuest.id, noteInput.trim(), noteType);
      const res = await getGuestNotes(selectedGuest.id);
      setNotes(res.data || []);
      setNoteInput('');
    } catch (e) {
      console.error('Failed to add note', e);
    } finally {
      setLoadingNoteAdd(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!selectedGuest) return;
    try {
      await deleteGuestNote(selectedGuest.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  }

  async function handleToggleBlacklist() {
    if (!selectedGuest) return;
    const newBan = !selectedGuest.is_banned;
    const reason = newBan ? window.prompt('Enter ban reason (optional):') : undefined;
    try {
      await blacklistGuest(selectedGuest.id, newBan, reason || undefined);
      setSelectedGuest((prev) => ({ ...prev, is_banned: newBan, ban_reason: newBan ? reason : null }));
      loadGuests();
    } catch (e) {
      console.error('Failed to toggle blacklist', e);
    }
  }

  async function handleToggleVip() {
    if (!selectedGuest) return;
    try {
      await toggleVip(selectedGuest.id);
      setSelectedGuest((prev) => ({ ...prev, vip_status: !prev.vip_status }));
      loadGuests();
    } catch (e) {
      console.error('Failed to toggle VIP', e);
    }
  }

  async function handleUpdateSegment(seg) {
    if (!selectedGuest) return;
    try {
      await updateGuestSegment(selectedGuest.id, seg);
      setSelectedGuest((prev) => ({ ...prev, segment: seg }));
      loadGuests();
    } catch (e) {
      console.error('Failed to update segment', e);
    }
  }

  async function handleQuickBan(guest) {
    const newBan = !guest.is_banned;
    const reason = newBan ? window.prompt('Ban reason (optional):') : undefined;
    try {
      await blacklistGuest(guest.id, newBan, reason || undefined);
      loadGuests();
    } catch (e) {
      console.error('Failed to ban/unban guest', e);
    }
  }

  async function handleQuickVip(guest) {
    try {
      await toggleVip(guest.id);
      loadGuests();
    } catch (e) {
      console.error('Failed to toggle VIP', e);
    }
  }

  function closePanel() {
    setPanelOpen(false);
    setTimeout(() => setSelectedGuest(null), 300);
  }

  // ── Derived data for analytics tab ──────────────────────────────────────
  const segmentRevenue = {};
  const segmentCancelRates = {};
  const segmentCounts = {};
  guests.forEach((g) => {
    const s = g.segment || 'casual';
    segmentRevenue[s] = (segmentRevenue[s] || 0) + (g.total_spent || 0);
    segmentCounts[s] = (segmentCounts[s] || 0) + 1;
    const rate = g.total_bookings > 0 ? (g.cancelled_bookings / g.total_bookings) : 0;
    segmentCancelRates[s] = (segmentCancelRates[s] || []);
    segmentCancelRates[s].push(rate);
  });
  const maxRevenue = Math.max(...Object.values(segmentRevenue), 1);

  const atRiskGuests = guests.filter((g) => g.churn_probability >= 60);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 0 40px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Guest Intelligence
          </h1>
          <p style={{ color: '#64748B', marginTop: 4, fontSize: 14 }}>
            AI-powered guest insights, segmentation, and lifecycle management
          </p>
        </div>

        {/* API error banner */}
        {apiError && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#DC2626', flexShrink: 0 }}>error</span>
            <span style={{ fontSize: 13, color: '#DC2626', flex: 1 }}>{apiError}</span>
            <button
              onClick={() => { setApiError(null); loadOverview(); loadGuests(); }}
              style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', background: 'none', border: '1px solid #FECACA', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <KpiCard
            icon="group"
            label="Total Guests"
            value={loadingOverview ? '…' : overview?.total_guests?.toLocaleString() || '0'}
            sub={`${overview?.new_guests_30d || 0} new this month`}
            color="#6366F1"
            loading={loadingOverview}
          />
          <KpiCard
            icon="workspace_premium"
            label="VIP Guests"
            value={loadingOverview ? '…' : overview?.vip_count?.toLocaleString() || '0'}
            sub="Verified high-value"
            color="#F59E0B"
            loading={loadingOverview}
          />
          <KpiCard
            icon="warning"
            label="At Risk"
            value={loadingOverview ? '…' : overview?.at_risk_count?.toLocaleString() || '0'}
            sub="Churn probability >60%"
            color="#EF4444"
            loading={loadingOverview}
          />
          <KpiCard
            icon="trending_up"
            label="Avg Lifetime Value"
            value={loadingOverview ? '…' : formatCurrency(overview?.avg_ltv)}
            sub="Per guest"
            color="#22C55E"
            loading={loadingOverview}
          />
          <KpiCard
            icon="autorenew"
            label="Return Rate"
            value={loadingOverview ? '…' : `${overview?.returning_rate || 0}%`}
            sub="Guests with 2+ bookings"
            color="#3B82F6"
            loading={loadingOverview}
          />
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #F1F5F9', paddingBottom: 0 }}>
          {[
            { key: 'overview', icon: 'dashboard', label: 'Overview' },
            { key: 'guests', icon: 'group', label: 'All Guests' },
            { key: 'analytics', icon: 'analytics', label: 'Analytics' },
            { key: 'segments', icon: 'category', label: 'Segments' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: activeTab === t.key ? '#6366F1' : '#64748B',
                borderBottom: activeTab === t.key ? '2px solid #6366F1' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Segment Distribution */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
                Segment Distribution
              </h3>
              {overview && Object.entries(overview.segment_distribution || {}).map(([seg, count]) => {
                const cfg = SEGMENT_CONFIG[seg] || { color: '#6B7280', bg: '#F3F4F6', label: seg };
                const pct = overview.total_guests ? Math.round(count / overview.total_guests * 100) : 0;
                return (
                  <div key={seg} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <SegmentBadge segment={seg} small />
                      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 99, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
              {(!overview || !Object.keys(overview.segment_distribution || {}).length) && (
                <div style={{ color: '#94A3B8', fontSize: 13 }}>No data yet</div>
              )}
            </div>

            {/* Tier Distribution */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
                Loyalty Tier Distribution
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['platinum', 'gold', 'silver', 'bronze'].map((tier) => {
                  const cfg = TIER_CONFIG[tier];
                  const count = overview?.tier_distribution?.[tier] || 0;
                  return (
                    <div key={tier} style={{
                      background: cfg.color + '12', borderRadius: 12, padding: '14px 16px',
                      border: `1px solid ${cfg.color}28`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: cfg.color, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 Guests */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
                Top High-Value Guests
              </h3>
              {(overview?.top_guests || []).map((g, i) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #F8FAFC' : 'none' }}>
                  <div style={{ width: 24, fontSize: 13, fontWeight: 700, color: '#94A3B8', textAlign: 'center' }}>#{i + 1}</div>
                  <Avatar name={g.full_name} photo={g.photo_url} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.full_name || g.email}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{g.total_bookings} bookings</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#16A34A' }}>{formatCurrency(g.total_spent)}</div>
                    <SegmentBadge segment={g.segment} small />
                  </div>
                  <button onClick={() => handleSelectGuest(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366F1', padding: '4px 6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </button>
                </div>
              ))}
              {(!overview?.top_guests?.length) && (
                <div style={{ color: '#94A3B8', fontSize: 13 }}>No data yet</div>
              )}
            </div>

            {/* Churn Risk Alerts */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#EF4444', fontVariationSettings: "'FILL' 1" }}>notification_important</span>
                Churn Risk Alerts
              </h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 14px' }}>Guests likely to stop returning</p>
              {atRiskGuests.slice(0, 6).map((g) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <Avatar name={g.full_name} photo={g.photo_url} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.full_name || g.email}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Last visit: {formatDate(g.last_visit)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: churnColor(g.churn_probability) }}>{g.churn_probability}%</span>
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>churn risk</span>
                  </div>
                  <button onClick={() => handleSelectGuest(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366F1', padding: '2px 4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                  </button>
                </div>
              ))}
              {!atRiskGuests.length && <div style={{ color: '#94A3B8', fontSize: 13 }}>No at-risk guests detected</div>}
            </div>
          </div>
        )}

        {/* ── GUESTS TAB ── */}
        {activeTab === 'guests' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', flex: 1, minWidth: 200 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#94A3B8' }}>search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14, background: 'transparent' }}
                />
              </div>
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">All Segments</option>
                {Object.entries(SEGMENT_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">All Tiers</option>
                {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {loadingGuests ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading guests…</div>
              ) : guests.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No guests found</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {['Guest', 'Segment', 'AI Score', 'Tier / Points', 'LTV', 'Last Visit', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g) => (
                      <tr
                        key={g.id}
                        style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FAFBFF'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => handleSelectGuest(g.id)}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={g.full_name} photo={g.photo_url} size={36} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                                {g.full_name || '—'}
                                {g.is_banned && <span style={{ marginLeft: 6, fontSize: 10, background: '#FEE2E2', color: '#DC2626', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>BANNED</span>}
                              </div>
                              <div style={{ fontSize: 12, color: '#64748B' }}>{g.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                          <SegmentBadge segment={g.segment} />
                        </td>
                        <td style={{ padding: '12px 16px', minWidth: 110 }}>
                          <AIScoreBar score={g.ai_score} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <TierBadge tier={g.loyalty_tier} />
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{(g.loyalty_points || 0).toLocaleString()} pts</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{formatCurrency(g.lifetime_value)}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 13, color: '#374151' }}>{formatDate(g.last_visit)}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => handleSelectGuest(g.id)}
                              title="View profile"
                              style={{ background: '#EEF2FF', color: '#6366F1', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>visibility</span>
                            </button>
                            <button
                              onClick={() => handleQuickVip(g)}
                              title={g.vip_status ? 'Remove VIP' : 'Make VIP'}
                              style={{ background: g.vip_status ? '#FEF3C7' : '#F8FAFC', color: '#F59E0B', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: g.vip_status ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
                            </button>
                            <button
                              onClick={() => handleQuickBan(g)}
                              title={g.is_banned ? 'Unban' : 'Ban'}
                              style={{ background: g.is_banned ? '#FEE2E2' : '#F8FAFC', color: '#EF4444', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{g.is_banned ? 'lock_open' : 'block'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Revenue by Segment */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>Revenue by Segment</h3>
              {Object.entries(segmentRevenue).sort((a, b) => b[1] - a[1]).map(([seg, rev]) => {
                const cfg = SEGMENT_CONFIG[seg] || { color: '#6B7280', bg: '#F3F4F6', label: seg };
                const pct = Math.round(rev / maxRevenue * 100);
                return (
                  <div key={seg} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <SegmentBadge segment={seg} small />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{formatCurrency(rev)}</span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: cfg.color, borderRadius: 99, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
              {!Object.keys(segmentRevenue).length && <div style={{ color: '#94A3B8', fontSize: 13 }}>No data</div>}
            </div>

            {/* Cancellation rates */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>Avg Cancellation Rate by Segment</h3>
              {Object.entries(segmentCancelRates).map(([seg, rates]) => {
                const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
                const pct = Math.round(avg * 100);
                const color = pct > 40 ? '#EF4444' : pct > 20 ? '#D97706' : '#16A34A';
                return (
                  <div key={seg} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <SegmentBadge segment={seg} small />
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
              {!Object.keys(segmentCancelRates).length && <div style={{ color: '#94A3B8', fontSize: 13 }}>No data</div>}
            </div>

            {/* Retention metrics */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>Guest Retention Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Return Rate', value: `${overview?.returning_rate || 0}%`, icon: 'autorenew', color: '#3B82F6' },
                  { label: 'Total Revenue', value: formatCurrency(overview?.total_revenue_from_guests), icon: 'attach_money', color: '#16A34A' },
                  { label: 'Avg LTV', value: formatCurrency(overview?.avg_ltv), icon: 'trending_up', color: '#8B5CF6' },
                  { label: 'At-Risk Guests', value: overview?.at_risk_count || 0, icon: 'warning', color: '#EF4444' },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: 'center', padding: 16, background: m.color + '0D', borderRadius: 12, border: `1px solid ${m.color}20` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: m.color, fontVariationSettings: "'FILL' 1", marginBottom: 8, display: 'block' }}>{m.icon}</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{m.value}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SEGMENTS TAB ── */}
        {activeTab === 'segments' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Object.entries(SEGMENT_CONFIG).map(([key, cfg]) => {
              const count = overview?.segment_distribution?.[key] || 0;
              const segGuests = guests.filter((g) => g.segment === key);
              const avgLtv = segGuests.length
                ? segGuests.reduce((a, g) => a + (g.lifetime_value || 0), 0) / segGuests.length
                : 0;
              return (
                <div key={key} style={{
                  background: '#fff', borderRadius: 16, padding: 22, border: `1px solid ${cfg.color}28`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, background: cfg.color + '12', borderRadius: '50%' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, position: 'relative' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: cfg.color, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{cfg.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>guests</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 1.5 }}>
                    {SEGMENT_DESCRIPTIONS[key]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${cfg.color}18`, paddingTop: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>Avg LTV</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: cfg.color }}>{formatCurrency(avgLtv)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SIDE PANEL BACKDROP ── */}
      {panelOpen && (
        <div
          onClick={closePanel}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 49, transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* ── SIDE PANEL ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 480,
        background: '#fff', zIndex: 50, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Panel Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <button
              onClick={closePanel}
              style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>

          {loadingPanel ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8' }}>Loading…</div>
          ) : selectedGuest ? (
            <>
              {/* Guest identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={selectedGuest.full_name} photo={selectedGuest.photo_url} size={60} />
                  {selectedGuest.vip_status && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: '#F59E0B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 10, color: '#fff', fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>
                    {selectedGuest.full_name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{selectedGuest.email}</div>
                  <SegmentBadge segment={selectedGuest.segment} />
                </div>
                {/* AI Score ring */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: `conic-gradient(${aiScoreColor(selectedGuest.ai_score)} ${selectedGuest.ai_score * 3.6}deg, #F1F5F9 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <div style={{ position: 'absolute', inset: 4, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: aiScoreColor(selectedGuest.ai_score) }}>{selectedGuest.ai_score}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>AI Score</div>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Stays', value: selectedGuest.completed_stays || 0, color: '#6366F1' },
                  { label: 'Spent', value: formatCurrency(selectedGuest.total_spent), color: '#16A34A' },
                  { label: 'Points', value: (selectedGuest.loyalty_points || 0).toLocaleString(), color: '#F59E0B' },
                  { label: 'Risk', value: `${selectedGuest.risk_score || 0}`, color: riskColor(selectedGuest.risk_score || 0) },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Panel tab bar */}
              <div style={{ display: 'flex', gap: 2, marginBottom: -1 }}>
                {[
                  { key: 'profile', label: 'Profile' },
                  { key: 'timeline', label: 'Timeline' },
                  { key: 'notes', label: 'Notes' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => handlePanelTabChange(t.key)}
                    style={{
                      flex: 1, padding: '8px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600,
                      color: panelTab === t.key ? '#6366F1' : '#64748B',
                      borderBottom: panelTab === t.key ? '2px solid #6366F1' : '2px solid transparent',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Panel Body */}
        {selectedGuest && !loadingPanel && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* ── PROFILE TAB ── */}
            {panelTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Contact info */}
                <section>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Contact</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <InfoRow icon="email" label="Email" value={selectedGuest.email} />
                    <InfoRow icon="phone" label="Phone" value={selectedGuest.phone || '—'} />
                    <InfoRow icon="calendar_today" label="Member Since" value={formatDate(selectedGuest.created_at)} />
                  </div>
                </section>

                {/* Loyalty */}
                <section>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Loyalty</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <InfoRow icon="grade" label="Tier" value={<TierBadge tier={selectedGuest.loyalty_tier} />} />
                    <InfoRow icon="stars" label="Points" value={(selectedGuest.loyalty_points || 0).toLocaleString() + ' pts'} />
                    <InfoRow icon="trending_up" label="Lifetime Value" value={formatCurrency(selectedGuest.lifetime_value)} />
                    <InfoRow icon="hotel" label="Completed Stays" value={selectedGuest.completed_stays || 0} />
                  </div>
                </section>

                {/* Risk */}
                <section>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Risk Profile</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <InfoRow icon="security" label="Risk Score"
                      value={
                        <span style={{ fontWeight: 700, color: riskColor(selectedGuest.risk_score || 0) }}>
                          {selectedGuest.risk_score || 0} / 100
                        </span>
                      }
                    />
                    <InfoRow icon="autorenew" label="Churn Probability"
                      value={
                        <span style={{ fontWeight: 700, color: churnColor(selectedGuest.churn_probability || 0) }}>
                          {selectedGuest.churn_probability || 0}%
                        </span>
                      }
                    />
                    <InfoRow icon="cancel" label="Cancellations" value={`${selectedGuest.cancelled_bookings || 0} / ${selectedGuest.total_bookings || 0} bookings`} />
                  </div>
                </section>

                {/* Segment override */}
                <section>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Segment Override</h4>
                  <select
                    value={selectedGuest.segment || ''}
                    onChange={(e) => handleUpdateSegment(e.target.value)}
                    style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#374151', background: '#F8FAFC', cursor: 'pointer' }}
                  >
                    {Object.entries(SEGMENT_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </section>

                {/* Actions */}
                <section>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Actions</h4>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleToggleVip}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px', border: 'none', borderRadius: 10, cursor: 'pointer',
                        background: selectedGuest.vip_status ? '#FEF3C7' : '#F8FAFC',
                        color: '#F59E0B', fontWeight: 700, fontSize: 13,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: selectedGuest.vip_status ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
                      {selectedGuest.vip_status ? 'Remove VIP' : 'Make VIP'}
                    </button>
                    <button
                      onClick={handleToggleBlacklist}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px', border: 'none', borderRadius: 10, cursor: 'pointer',
                        background: selectedGuest.is_banned ? '#DCFCE7' : '#FEE2E2',
                        color: selectedGuest.is_banned ? '#16A34A' : '#DC2626', fontWeight: 700, fontSize: 13,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {selectedGuest.is_banned ? 'lock_open' : 'block'}
                      </span>
                      {selectedGuest.is_banned ? 'Unban Guest' : 'Ban Guest'}
                    </button>
                  </div>
                  {selectedGuest.is_banned && selectedGuest.ban_reason && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#FEE2E2', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
                      <strong>Ban reason:</strong> {selectedGuest.ban_reason}
                    </div>
                  )}
                </section>

                {/* Notes */}
                {selectedGuest.notes && (
                  <section>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Internal Notes</h4>
                    <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, fontSize: 13, color: '#92400E', border: '1px solid #FDE68A' }}>
                      {selectedGuest.notes}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ── TIMELINE TAB ── */}
            {panelTab === 'timeline' && (
              <div>
                {timeline.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>hotel</span>
                    No booking history
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {timeline.map((b) => {
                      const sc = STATUS_COLORS[b.status] || { color: '#64748B', bg: '#F1F5F9' };
                      return (
                        <div key={b.id} style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', border: '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{b.hotel_name || `Hotel #${b.hotel_id}`}</div>
                              <div style={{ fontSize: 12, color: '#64748B' }}>Room #{b.room_id}</div>
                            </div>
                            <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                              {b.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B' }}>
                            <span><strong style={{ color: '#374151' }}>{formatDate(b.check_in)}</strong> → <strong style={{ color: '#374151' }}>{formatDate(b.check_out)}</strong></span>
                            <span>{b.nights} night{b.nights !== 1 ? 's' : ''}</span>
                            <span>{b.adults}A{b.children > 0 ? ` + ${b.children}C` : ''}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>{formatDate(b.created_at)}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#16A34A' }}>{formatCurrency(b.total_price)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTES TAB ── */}
            {panelTab === 'notes' && (
              <div>
                {/* Add note form */}
                <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #F1F5F9' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Add Note</h4>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Write a note about this guest…"
                    rows={3}
                    style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}
                    >
                      {NOTE_TYPES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddNote}
                      disabled={!noteInput.trim() || loadingNoteAdd}
                      style={{
                        padding: '8px 16px', background: '#6366F1', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: noteInput.trim() ? 'pointer' : 'not-allowed',
                        opacity: !noteInput.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                      {loadingNoteAdd ? 'Saving…' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Notes list */}
                {notes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 6 }}>notes</span>
                    No notes yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notes.map((note) => {
                      const noteTypeColors = {
                        general: '#6366F1', complaint: '#EF4444', preference: '#22C55E',
                        vip_request: '#F59E0B', warning: '#EF4444', compliment: '#22C55E',
                      };
                      const nc = noteTypeColors[note.note_type] || '#6366F1';
                      return (
                        <div key={note.id} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #F1F5F9', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <span style={{ background: nc + '18', color: nc, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                              {note.note_type.replace('_', ' ')}
                            </span>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                            </button>
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{note.content}</p>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>
                            {note.author_name ? `by ${note.author_name} · ` : ''}{formatDate(note.created_at)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ─── Small helper component ────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#94A3B8', width: 18, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#94A3B8', minWidth: 90 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
