/* allStay — Auth, Account, Reviews, Notifications */

// ─── LOGIN ─────────────────────────────────────────────────────────────
const Login = () => (
  <Page>
    <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'linear-gradient(135deg, #F0F9FF 0%, #DBEAFE 60%, #EFF6FF 100%)' }}>
      <div className="ah-card" style={{ padding: 40, width: 420 }}>
        <div className="ah-logo" style={{ marginBottom: 24, justifyContent: 'center' }}>
          <div className="ah-logo-mark"></div><span>allStay</span>
        </div>
        <h1 className="ah-h2" style={{ textAlign: 'center', marginBottom: 6 }}>Welcome back</h1>
        <p className="ah-muted" style={{ fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Sign in to manage your stay.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ah-field">
            <label className="ah-label">Email</label>
            <input className="ah-input" defaultValue="elena.marin@email.com" />
          </div>
          <div className="ah-field">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="ah-label">Password</label>
              <a style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Forgot?</a>
            </div>
            <input className="ah-input" type="password" defaultValue="••••••••" />
          </div>
          <label className="ah-check is-checked" style={{ marginTop: 4 }}>
            <span className="ah-check-box"><Icon name="check" size={14} /></span>
            <span>Keep me signed in</span>
          </label>
          <button className="ah-btn ah-btn-primary ah-btn-lg ah-btn-block" style={{ marginTop: 8 }}>Sign In</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>OR<div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { provider: 'Google', glyph: 'G', color: '#EA4335' },
            { provider: 'Apple', glyph: '', color: '#000' },
            { provider: 'Meta', glyph: 'f', color: '#1877F2' },
          ].map((s, i) => (
            <button key={i} className="ah-btn ah-btn-secondary" style={{ justifyContent: 'flex-start', paddingLeft: 16 }}>
              <span style={{ width: 20, height: 20, borderRadius: 4, background: s.color, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{s.glyph}</span>
              <span style={{ flex: 1, textAlign: 'center' }}>Continue with {s.provider}</span>
            </button>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 24, color: 'var(--text-secondary)', fontWeight: 600 }}>
          New here? <a style={{ color: 'var(--primary)', cursor: 'pointer' }}>Create an account</a>
        </p>
      </div>
    </div>
  </Page>
);

// ─── REGISTER ──────────────────────────────────────────────────────────
const Register = () => (
  <Page scroll={false}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', height: '100%' }}>
      <aside className="ah-img ah-img-ocean" style={{ padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
        <div className="ah-logo" style={{ color: 'white' }}>
          <div className="ah-logo-mark"></div><span>allStay</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, color: 'white' }}>
          <div style={{ fontSize: 64, lineHeight: 1, opacity: 0.6, marginBottom: 16 }}>"</div>
          <p style={{ fontSize: 22, lineHeight: 1.4, fontWeight: 600, letterSpacing: '-0.015em', maxWidth: 420 }}>
            The kind of place where time bends. We extended twice and still left too soon.
          </p>
          <div style={{ marginTop: 20, fontSize: 13, fontWeight: 600 }}>Sofía R. · Atlantic Sunrise Suite, 5 nights</div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.65) 100%)', zIndex: 1 }}></div>
      </aside>
      <div style={{ padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          <h1 className="ah-h1" style={{ fontSize: 32 }}>Create your account</h1>
          <p className="ah-muted" style={{ fontSize: 14, marginTop: 6, marginBottom: 28 }}>Get member rates, room upgrades, and late check-out.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="ah-field">
              <label className="ah-label">First name</label>
              <input className="ah-input" defaultValue="Elena" />
            </div>
            <div className="ah-field">
              <label className="ah-label">Last name</label>
              <input className="ah-input" defaultValue="Marin" />
            </div>
            <div className="ah-field" style={{ gridColumn: 'span 2' }}>
              <label className="ah-label">Email</label>
              <input className="ah-input" defaultValue="elena.marin@email.com" />
            </div>
            <div className="ah-field" style={{ gridColumn: 'span 2' }}>
              <label className="ah-label">Password</label>
              <input className="ah-input" type="password" defaultValue="••••••••••••" />
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {['#16A34A', '#16A34A', '#16A34A', '#E2E8F0'].map((c, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: c }}></div>
                ))}
              </div>
              <span className="ah-help"><strong style={{ color: 'var(--success)' }}>Strong</strong> · 12+ chars, mixed case, numbers</span>
            </div>
            <div className="ah-field" style={{ gridColumn: 'span 2' }}>
              <label className="ah-label">Confirm password</label>
              <input className="ah-input" type="password" defaultValue="••••••••••••" />
            </div>
          </div>
          <label className="ah-check is-checked" style={{ marginTop: 18 }}>
            <span className="ah-check-box"><Icon name="check" size={14} /></span>
            <span style={{ fontSize: 13 }}>I agree to the <a style={{ color: 'var(--primary)' }}>Terms</a> and <a style={{ color: 'var(--primary)' }}>Privacy Policy</a></span>
          </label>
          <button className="ah-btn ah-btn-primary ah-btn-lg ah-btn-block" style={{ marginTop: 20 }}>Create account</button>
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: 'var(--text-secondary)', fontWeight: 600 }}>
            Already have one? <a style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  </Page>
);

// ─── DASHBOARD ─────────────────────────────────────────────────────────
const Dashboard = () => (
  <Page>
    <Header active="dashboard" />
    <section style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div className="ah-eyebrow" style={{ marginBottom: 8 }}>Member since 2023 · Gold tier</div>
          <h1 className="ah-h1" style={{ fontSize: 34 }}>Welcome back, Elena.</h1>
          <p className="ah-muted" style={{ fontSize: 14, marginTop: 6 }}>Your next stay starts in 17 days. We'll have your usual suite ready.</p>
        </div>
        <button className="ah-btn ah-btn-primary"><Icon name="add" size={16} /> New booking</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { icon: 'event_available', label: 'Confirmed', val: '2', sub: 'Upcoming stays', tone: 'var(--success)', bg: 'var(--success-bg)' },
          { icon: 'pending', label: 'Pending', val: '1', sub: 'Awaiting payment', tone: 'var(--warning)', bg: 'var(--warning-bg)' },
          { icon: 'history', label: 'Completed', val: '8', sub: 'Past stays', tone: '#1D4ED8', bg: 'var(--primary-light)' },
          { icon: 'paid', label: 'Total spent', val: '$32,840', sub: 'Lifetime', tone: 'var(--primary)', bg: 'var(--primary-light)' },
        ].map((s, i) => (
          <div key={i} className="ah-stat">
            <div className="ah-stat-icon" style={{ color: s.tone, background: s.bg }}><Icon name={s.icon} /></div>
            <div className="ah-stat-val">{s.val}</div>
            <div className="ah-stat-lbl">{s.label} · {s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="ah-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottom: '1px solid var(--border)' }}>
            <h3 className="ah-h3">Recent bookings</h3>
            <a style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View all</a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                {['Reference', 'Dates', 'Suite', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { ref: 'AHM-7K2P-9W4X', dates: 'May 14 → 19, 2026', suite: 'Atlantic Sunrise', total: '$4,413', kind: 'confirmed', label: 'Confirmed' },
                { ref: 'AHM-3Y8R-1Q2D', dates: 'Jul 02 → 09, 2026', suite: 'Penthouse Horizon', total: '$14,980', kind: 'pending', label: 'Pending' },
                { ref: 'AHM-9F6L-5T7N', dates: 'Feb 12 → 15, 2026', suite: 'Coral Garden', total: '$1,635', kind: 'completed', label: 'Completed' },
                { ref: 'AHM-2H4J-8B1V', dates: 'Dec 22 → 28, 2025', suite: 'Atlantic Sunrise', total: '$5,712', kind: 'completed', label: 'Completed' },
              ].map((r, i) => (
                <tr key={i} style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '16px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{r.ref}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>{r.dates}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>{r.suite}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700 }}>{r.total}</td>
                  <td style={{ padding: '16px 20px' }}><span className={`ah-badge ah-badge-${r.kind}`}>{r.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ah-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="ah-img ah-img-ocean" style={{ height: 100 }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>your next stay</span></div>
            <div style={{ padding: 18 }}>
              <div className="ah-eyebrow">In 17 days</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Atlantic Sunrise Suite</div>
              <div className="ah-muted" style={{ fontSize: 13 }}>May 14 → May 19 · 5 nights</div>
              <button className="ah-btn ah-btn-secondary ah-btn-block ah-btn-sm" style={{ marginTop: 12 }}>View itinerary</button>
            </div>
          </div>
          <div className="ah-card" style={{ padding: 18 }}>
            <h3 className="ah-h3" style={{ marginBottom: 12 }}>Quick actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                ['restaurant', 'Reserve at Coral Restaurant'],
                ['spa', 'Book a spa treatment'],
                ['directions_car', 'Arrange airport transfer'],
                ['help', 'Concierge chat'],
              ].map(([icon, label], i) => (
                <a key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <Icon name={icon} size={18} />{label}
                  <Icon name="chevron_right" size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  </Page>
);

// ─── MY BOOKINGS ────────────────────────────────────────────────────────
const MyBookings = () => (
  <Page>
    <Header active="dashboard" />
    <section style={{ padding: '40px 48px' }}>
      <h1 className="ah-h1" style={{ fontSize: 32, marginBottom: 24 }}>My bookings</h1>
      <div className="ah-tabs" style={{ marginBottom: 24 }}>
        {['All (11)', 'Upcoming (3)', 'Past (8)', 'Cancelled (1)'].map((t, i) => (
          <div key={i} className={`ah-tab ${i === 1 ? 'is-active' : ''}`}>{t}</div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { name: 'Atlantic Sunrise Suite', img: 'ah-img-ocean', dates: 'May 14 → 19, 2026 · 5 nights', ref: 'AHM-7K2P-9W4X', total: '$4,413', kind: 'confirmed', label: 'Confirmed', flipped: false },
          { name: 'Penthouse Horizon', img: 'ah-img-suite', dates: 'Jul 02 → 09, 2026 · 7 nights', ref: 'AHM-3Y8R-1Q2D', total: '$14,980', kind: 'pending', label: 'Pending payment', flipped: true },
          { name: 'Coral Garden Room', img: 'ah-img-room', dates: 'Sep 18 → 21, 2026 · 3 nights', ref: 'AHM-5G2Z-7Q8M', total: '$1,485', kind: 'confirmed', label: 'Confirmed', flipped: false },
        ].map((b, i) => (
          <div key={i} className={`ah-flip ${b.flipped ? 'is-flipped' : ''}`} style={{ position: 'relative' }}>
            <div className="ah-flip-inner">
              <div className="ah-flip-front ah-card" style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 20, padding: 16, alignItems: 'center' }}>
                <div className={`ah-img ${b.img}`} style={{ borderRadius: 8, height: 140 }}></div>
                <div>
                  <span className={`ah-badge ah-badge-${b.kind}`}>{b.label}</span>
                  <h3 className="ah-h3" style={{ marginTop: 10 }}>{b.name}</h3>
                  <div className="ah-muted" style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>{b.dates}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace', marginTop: 6 }}>{b.ref}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{b.total}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="ah-btn ah-btn-secondary ah-btn-sm">View</button>
                    <button className="ah-btn ah-btn-secondary ah-btn-sm">Modify</button>
                    <button className="ah-btn ah-btn-ghost ah-btn-sm" style={{ color: 'var(--error)' }}>Cancel</button>
                  </div>
                </div>
              </div>
              {b.flipped && (
                <div className="ah-flip-back">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon name="warning" size={24} style={{ color: 'var(--warning)' }} />
                    <h3 className="ah-h3">Cancel this booking?</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>
                    Your $1,498 deposit is non-refundable within 48h of booking. The remaining $13,482 will be returned to Visa •• 4242 in 5–7 business days.
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="ah-btn ah-btn-ghost ah-btn-sm">Keep booking</button>
                    <button className="ah-btn ah-btn-danger ah-btn-sm">Yes, cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  </Page>
);

// ─── PROFILE ────────────────────────────────────────────────────────────
const Profile = () => (
  <Page>
    <Header active="dashboard" />
    <section style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          ['person', 'Profile', true],
          ['lock', 'Password & security'],
          ['notifications', 'Notifications'],
          ['credit_card', 'Payment methods'],
          ['history', 'Payment history'],
          ['star', 'My reviews'],
        ].map(([icon, label, active], i) => (
          <a key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: active ? 'var(--primary-light)' : 'transparent', color: active ? 'var(--primary)' : 'var(--text)' }}>
            <Icon name={icon} size={18} />{label}
          </a>
        ))}
      </aside>
      <div>
        <h1 className="ah-h1" style={{ fontSize: 32, marginBottom: 24 }}>Profile</h1>

        <div className="ah-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 className="ah-h3" style={{ marginBottom: 18 }}>Photo</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="ah-avatar-upload">
              EM
              <div className="ah-avatar-upload-overlay">
                <Icon name="photo_camera" size={20} />
                <span>Upload</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Hover to change</div>
              <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>JPG or PNG · Max 5MB</div>
            </div>
          </div>
        </div>

        <div className="ah-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 className="ah-h3" style={{ marginBottom: 18 }}>Personal info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="ah-field"><label className="ah-label">First name</label><input className="ah-input" defaultValue="Elena" /></div>
            <div className="ah-field"><label className="ah-label">Last name</label><input className="ah-input" defaultValue="Marin" /></div>
            <div className="ah-field" style={{ gridColumn: 'span 2' }}><label className="ah-label">Email</label><input className="ah-input" defaultValue="elena.marin@email.com" /></div>
            <div className="ah-field"><label className="ah-label">Phone</label><input className="ah-input" defaultValue="+1 305 555 0184" /></div>
            <div className="ah-field"><label className="ah-label">Date of birth</label><input className="ah-input" defaultValue="04 / 18 / 1991" /></div>
            <div className="ah-field" style={{ gridColumn: 'span 2' }}><label className="ah-label">Address</label><input className="ah-input" defaultValue="412 Brickell Ave, Miami, FL 33131" /></div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="ah-btn ah-btn-ghost ah-btn-sm">Cancel</button>
            <button className="ah-btn ah-btn-primary ah-btn-sm">Save changes</button>
          </div>
        </div>

        <div className="ah-card" style={{ padding: 24 }}>
          <h3 className="ah-h3" style={{ marginBottom: 18 }}>Notification preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['Booking confirmations & receipts', 'Email + SMS', true],
              ['Check-in reminders', 'Email only', true],
              ['Special offers & member rates', 'Email only', false],
              ['Marketing & newsletter', 'Off', false],
            ].map(([label, sub, on], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                  <div className="ah-muted" style={{ fontSize: 12, marginTop: 2 }}>{sub}</div>
                </div>
                <div className={`ah-toggle ${on ? 'is-on' : ''}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </Page>
);

// ─── REVIEWS / NOTIFICATIONS / PAYMENT HISTORY combined ────────────────
const ReviewsPage = () => (
  <Page>
    <Header active="dashboard" />
    <section style={{ padding: '40px 48px' }}>
      <h1 className="ah-h1" style={{ fontSize: 32, marginBottom: 24 }}>Reviews</h1>
      <div className="ah-card" style={{ padding: 24, marginBottom: 24, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
        <div className="ah-img ah-img-ocean" style={{ borderRadius: 10, height: 160 }}></div>
        <div>
          <div className="ah-eyebrow" style={{ marginBottom: 6 }}>Stay completed Feb 15, 2026</div>
          <h3 className="ah-h3">Coral Garden Room</h3>
          <p className="ah-muted" style={{ fontSize: 13, marginTop: 6, marginBottom: 14 }}>3 nights · We'd love to hear how it went.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Your rating</span>
            <div style={{ display: 'flex', gap: 4, fontSize: 24, color: '#F59E0B' }}>
              {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ cursor: 'pointer', color: i < 4 ? '#F59E0B' : 'var(--border-strong)' }}>★</span>)}
            </div>
          </div>
          <textarea className="ah-textarea" rows={3} placeholder="What did you love? What could be better?" defaultValue="The garden room was a quiet paradise. Service was attentive without being intrusive."></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="ah-btn ah-btn-primary ah-btn-sm">Submit review</button>
          </div>
        </div>
      </div>

      <h2 className="ah-h2" style={{ marginBottom: 16 }}>Your past reviews (4)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { suite: 'Atlantic Sunrise Suite', date: 'Dec 28, 2025', rating: 5, body: 'Perfect from arrival to departure. The sunrise from the balcony alone is worth the rate. The team remembered our anniversary.', response: 'Elena, thank you for trusting us with your anniversary. The team can\'t wait to welcome you back in May. — Carla, GM' },
          { suite: 'Atlantic Sunrise Suite', date: 'Aug 04, 2025', rating: 5, body: 'Second stay this year. Still the gold standard for Miami oceanfront.', response: null },
          { suite: 'Reef Studio Loft', date: 'Mar 12, 2025', rating: 4, body: 'Lovely room, slightly small for two with luggage. Service made up for it.', response: 'Thank you for the honest feedback — we\'ve since added more storage to all Reef Lofts.' },
        ].map((r, i) => (
          <div key={i} className="ah-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="ah-h3" style={{ fontSize: 15 }}>{r.suite}</h3>
                <div className="ah-muted" style={{ fontSize: 12, marginTop: 2 }}>{r.date}</div>
              </div>
              <span style={{ fontSize: 16, color: '#F59E0B' }}>{'★'.repeat(r.rating)}<span style={{ color: 'var(--border-strong)' }}>{'★'.repeat(5 - r.rating)}</span></span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, fontWeight: 500 }}>{r.body}</p>
            {r.response && (
              <div style={{ marginTop: 14, padding: 14, background: 'var(--bg)', borderRadius: 10, borderLeft: '3px solid var(--primary)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Response from allStay</div>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{r.response}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  </Page>
);

const NotificationsPage = () => (
  <Page>
    <Header active="dashboard" />
    <section style={{ padding: '40px 48px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="ah-h1" style={{ fontSize: 32 }}>Notifications</h1>
        <button className="ah-btn ah-btn-ghost ah-btn-sm">Mark all as read</button>
      </div>
      <div className="ah-card" style={{ overflow: 'hidden' }}>
        {[
          { icon: 'check_circle', tone: 'success', title: 'Booking confirmed · AHM-7K2P-9W4X', body: 'Atlantic Sunrise Suite, May 14 → 19', time: '2h ago', unread: true },
          { icon: 'event_upcoming', tone: 'info', title: 'Check-in is in 17 days', body: 'Use mobile key to skip the front desk on arrival.', time: '1d ago', unread: true },
          { icon: 'local_offer', tone: 'warning', title: 'Member offer · 20% off Coral Spa', body: 'Add a treatment to your May stay before April 30.', time: '3d ago', unread: false },
          { icon: 'star', tone: 'info', title: 'How was your Coral Garden stay?', body: 'Leave a review — takes 30 seconds.', time: '5d ago', unread: false },
          { icon: 'paid', tone: 'success', title: 'Payment received', body: '$1,635 for AHM-9F6L-5T7N', time: '1w ago', unread: false },
        ].map((n, i, arr) => {
          const bg = n.tone === 'success' ? 'var(--success-bg)' : n.tone === 'warning' ? 'var(--warning-bg)' : 'var(--primary-light)';
          const fg = n.tone === 'success' ? 'var(--success)' : n.tone === 'warning' ? 'var(--warning)' : 'var(--primary)';
          return (
            <div key={i} style={{ display: 'flex', gap: 14, padding: 18, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', background: n.unread ? 'rgba(37,99,235,0.03)' : 'white' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={n.icon} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {n.title}
                  {n.unread && <span style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }}></span>}
                </div>
                <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>{n.body}</div>
              </div>
              <div className="ah-muted" style={{ fontSize: 12, fontWeight: 600 }}>{n.time}</div>
            </div>
          );
        })}
      </div>
    </section>
  </Page>
);

const PaymentHistory = () => (
  <Page>
    <Header active="dashboard" />
    <section style={{ padding: '40px 48px' }}>
      <h1 className="ah-h1" style={{ fontSize: 32, marginBottom: 24 }}>Payment history</h1>
      <div className="ah-card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
              {['Date', 'Booking', 'Amount', 'Method', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Apr 27, 2026', ref: 'AHM-7K2P-9W4X', amt: '$4,413.00', method: 'Visa •• 4242', kind: 'confirmed', label: 'Paid' },
              { date: 'Apr 02, 2026', ref: 'AHM-3Y8R-1Q2D', amt: '$1,498.00', method: 'Visa •• 4242', kind: 'pending', label: 'Pending' },
              { date: 'Feb 15, 2026', ref: 'AHM-9F6L-5T7N', amt: '$1,635.00', method: 'Amex •• 1009', kind: 'completed', label: 'Settled' },
              { date: 'Dec 28, 2025', ref: 'AHM-2H4J-8B1V', amt: '$5,712.00', method: 'Visa •• 4242', kind: 'completed', label: 'Settled' },
              { date: 'Aug 04, 2025', ref: 'AHM-1L7P-4D9K', amt: '$3,920.00', method: 'Visa •• 4242', kind: 'completed', label: 'Settled' },
              { date: 'Mar 12, 2025', ref: 'AHM-6N2X-8F3W', amt: '$1,247.00', method: 'Apple Pay', kind: 'cancelled', label: 'Refunded' },
            ].map((p, i, arr) => (
              <tr key={i} style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600 }}>{p.date}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{p.ref}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700 }}>{p.amt}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600 }}>{p.method}</td>
                <td style={{ padding: '14px 20px' }}><span className={`ah-badge ah-badge-${p.kind}`}>{p.label}</span></td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <a style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}><Icon name="download" size={14} /> Receipt</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </Page>
);

Object.assign(window, { Login, Register, Dashboard, MyBookings, Profile, ReviewsPage, NotificationsPage, PaymentHistory });
