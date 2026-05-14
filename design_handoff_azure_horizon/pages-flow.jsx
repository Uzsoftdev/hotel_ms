/* allStay — Search, Room Details, Booking flow */

// ─── SEARCH / ROOMS LISTING ─────────────────────────────────────────────
const SearchPage = () => {
  const filters = [
    { title: 'Price per night', items: ['Under $300', '$300–$600', '$600–$1,000', '$1,000+'], type: 'range' },
    { title: 'Room type', items: ['Standard Room', 'Deluxe Room', 'Junior Suite', 'Penthouse', 'Residence'] },
    { title: 'Capacity', items: ['1 guest', '2 guests', '3–4 guests', '5+ guests'] },
    { title: 'Amenities', items: ['Ocean view', 'Private balcony', 'Plunge pool', 'Butler service', 'Kitchenette', 'Pet-friendly'] },
  ];
  return (
    <Page>
      <Header active="rooms" />
      <div style={{ padding: '32px 48px', background: 'white', borderBottom: '1px solid var(--border)' }}>
        <SearchBar />
      </div>
      <section style={{ padding: '32px 48px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="ah-h3">Filters</h3>
            <a style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Clear all</a>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Price per night</span><span className="ah-muted">$320 – $2,400</span>
            </div>
            <div className="ah-range">
              <div className="ah-range-fill" style={{ left: '15%', right: '25%' }}></div>
              <div className="ah-range-thumb" style={{ left: '15%' }}></div>
              <div className="ah-range-thumb" style={{ left: '75%' }}></div>
            </div>
          </div>
          {filters.slice(1).map((f, i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{f.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.items.map((it, j) => {
                  const checked = (i === 0 && j === 1) || (i === 1 && j === 1) || (i === 2 && (j === 0 || j === 2));
                  return (
                    <label key={j} className={`ah-check ${checked ? 'is-checked' : ''}`}>
                      <span className="ah-check-box">{checked && <Icon name="check" size={14} />}</span>
                      <span>{it}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div className="ah-h2">14 rooms · May 14 → 19</div>
              <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>2 adults, 1 child · 5 nights</div>
            </div>
            <select className="ah-select" style={{ width: 220 }} defaultValue="rec">
              <option value="rec">Sort: Recommended</option>
              <option>Price (low to high)</option>
              <option>Guest rating</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { name: 'Atlantic Sunrise Suite', price: 789, capacity: '2 guests', sqft: 640, img: 'ah-img-ocean', amenities: ['Ocean view', 'King bed', 'Private balcony', 'Espresso bar'], badge: 'Most loved', kind: 'confirmed', rating: 4.9 },
              { name: 'Coral Garden Room', price: 445, capacity: '2 guests', sqft: 380, img: 'ah-img-room', amenities: ['Garden view', 'Queen bed', 'Patio', 'Free breakfast'], badge: '12 left', kind: 'confirmed', rating: 4.8 },
              { name: 'Reef Studio Loft', price: 329, capacity: '2 guests', sqft: 320, img: 'ah-img-pool', amenities: ['Pool view', 'Queen bed', 'Kitchenette'], badge: '4 left', kind: 'pending', rating: 4.7 },
              { name: 'Penthouse Horizon', price: 2140, capacity: '4 guests', sqft: 1820, img: 'ah-img-suite', amenities: ['Private pool', 'Butler service', '2 bedrooms', 'Rooftop deck'], badge: 'Last 1', kind: 'cancelled', rating: 5.0 },
            ].map((r, i) => (
              <div key={i} className="ah-card" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 200px', gap: 20, padding: 16 }}>
                <div className={`ah-img ${r.img}`} style={{ borderRadius: 8, height: 200, position: 'relative' }}>
                  <span className={`ah-badge ah-badge-${r.kind}`} style={{ position: 'absolute', top: 10, left: 10 }}>{r.badge}</span>
                </div>
                <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <h3 className="ah-h3">{r.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
                      <span><Icon name="group" size={14} /> {r.capacity}</span>
                      <span>·</span>
                      <span><Icon name="square_foot" size={14} /> {r.sqft} ft²</span>
                      <span>·</span>
                      <span style={{ color: 'var(--primary)' }}>★ {r.rating}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {r.amenities.map((a, j) => <span key={j} className="ah-chip">{a}</span>)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 'auto' }}>
                    <Icon name="check_circle" size={14} /> Free cancellation until 48h before check-in
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', textAlign: 'right' }}>
                  <div>
                    <div className="ah-muted" style={{ fontSize: 12 }}>5 nights, all-in</div>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em' }}>${(r.price * 5).toLocaleString()}</div>
                    <div className="ah-muted" style={{ fontSize: 12 }}>${r.price}/night</div>
                  </div>
                  <button className="ah-btn ah-btn-primary" style={{ width: '100%' }}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Page>
  );
};

// ─── ROOM DETAILS ───────────────────────────────────────────────────────
const Calendar = ({ start = 14, end = 19, disabled = [11, 12, 22, 23] }) => {
  const days = Array.from({ length: 35 }, (_, i) => i - 3); // pad with previous month
  return (
    <div className="ah-cal">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="ah-cal-head">{d}</div>)}
      {days.map((d, i) => {
        const valid = d >= 1 && d <= 31;
        const isDis = valid && disabled.includes(d);
        const isStart = d === start;
        const isEnd = d === end;
        const isRange = d > start && d < end;
        return (
          <div key={i} className={`ah-cal-day ${!valid ? 'is-muted' : ''} ${isDis ? 'is-disabled' : ''} ${isStart ? 'is-start' : ''} ${isEnd ? 'is-end' : ''} ${isRange ? 'is-range' : ''}`}>
            {valid ? d : (d <= 0 ? 30 + d : d - 31)}
          </div>
        );
      })}
    </div>
  );
};

const Counter = ({ label, sublabel, value, min = 0, max = 4, atMax = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
      <div className="ah-muted" style={{ fontSize: 12 }}>{sublabel}</div>
    </div>
    <div className="ah-counter">
      <button className="ah-counter-btn" disabled={value <= min}>−</button>
      <span className="ah-counter-val">{value}</span>
      <button className="ah-counter-btn" disabled={atMax}>+</button>
    </div>
  </div>
);

const RoomDetails = () => (
  <Page>
    <Header active="rooms" />
    <section style={{ padding: '24px 48px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 16 }}>
        <a>Rooms</a> <Icon name="chevron_right" size={14} /> <a>Suites</a> <Icon name="chevron_right" size={14} /> <span style={{ color: 'var(--text)' }}>Atlantic Sunrise Suite</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '240px 240px', gap: 8, height: 488 }}>
        <div className="ah-img ah-img-ocean" style={{ borderRadius: '12px 0 0 12px', gridRow: 'span 2' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>main shot · ocean</span>
        </div>
        <div className="ah-img ah-img-room"><span style={{ color: 'rgba(0,0,0,0.5)' }}>bedroom</span></div>
        <div className="ah-img ah-img-suite" style={{ borderRadius: '0 12px 0 0' }}><span style={{ color: 'rgba(0,0,0,0.5)' }}>bathroom</span></div>
        <div className="ah-img ah-img-pool"><span style={{ color: 'rgba(0,0,0,0.5)' }}>balcony</span></div>
        <div className="ah-img ah-img-spa" style={{ borderRadius: '0 0 12px 0', position: 'relative' }}>
          <span style={{ color: 'rgba(0,0,0,0.5)' }}>terrace</span>
          <button className="ah-btn ah-btn-secondary ah-btn-sm" style={{ position: 'absolute', bottom: 12, right: 12 }}>
            <Icon name="grid_view" size={14} /> All 28 photos
          </button>
        </div>
      </div>
    </section>
    <section style={{ padding: '40px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
      <div>
        <div className="ah-eyebrow" style={{ marginBottom: 8 }}>Oceanfront Suite</div>
        <h1 className="ah-h1" style={{ fontSize: 40 }}>Atlantic Sunrise Suite</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: 'var(--primary)' }}>★ 4.9 · 312 reviews</span>
          <span className="ah-muted">·</span>
          <span><Icon name="square_foot" size={14} /> 640 ft²</span>
          <span className="ah-muted">·</span>
          <span><Icon name="elevator" size={14} /> Floors 8–14</span>
          <span className="ah-muted">·</span>
          <span><Icon name="group" size={14} /> Sleeps 2 + 1 child</span>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.65, marginTop: 24, color: 'var(--text-secondary)', fontWeight: 500, maxWidth: 640 }}>
          Wake up to the Atlantic from a king-size bed positioned to face the horizon. The suite spans 640 square feet across the bedroom, marble bath with deep soaking tub, and a 180-square-foot private balcony that turns into your own sunrise theatre at dawn.
        </p>

        <h2 className="ah-h2" style={{ marginTop: 40, marginBottom: 16 }}>What's included</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 640 }}>
          {[
            ['king_bed', 'King-size bed, Frette linens'],
            ['bathtub', 'Marble bath, soaking tub'],
            ['balcony', '180 ft² ocean balcony'],
            ['wifi', 'Gigabit Wi-Fi'],
            ['coffee_maker', 'Espresso bar, daily setup'],
            ['ac_unit', 'Dual-zone climate'],
            ['local_bar', 'Curated mini-bar'],
            ['room_service', '24h in-room dining'],
          ].map(([icon, label], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <Icon name={icon} size={20} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>

        <h2 className="ah-h2" style={{ marginTop: 40, marginBottom: 16 }}>Cancellation policy</h2>
        <div className="ah-card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start', maxWidth: 640 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="verified" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Free cancellation until May 12, 11:59 PM</div>
            <div className="ah-muted" style={{ fontSize: 13, marginTop: 4 }}>Cancel up to 48 hours before check-in for a full refund. Within 48 hours, the first night is non-refundable.</div>
          </div>
        </div>
      </div>

      <aside style={{ position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
        <div className="ah-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>$789</span>
              <span className="ah-muted" style={{ fontSize: 14 }}> /night</span>
            </div>
            <span className="ah-chip" style={{ background: 'var(--success-bg)', color: '#15803D' }}>Member rate</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Check-in</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>May 14, 2026</div>
            </div>
            <div style={{ border: '1px solid var(--border-strong)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>Check-out</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>May 19, 2026</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>May 2026</div>
            <Calendar />
            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--primary-light)' }}></span>selected</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#FCA5A5' }}></span>unavailable</span>
            </div>
          </div>
          <Counter label="Adults" sublabel="13+" value={2} min={1} max={2} atMax={true} />
          <Counter label="Children" sublabel="2–12" value={1} max={1} atMax={true} />
          <div className="ah-help" style={{ fontSize: 11, marginBottom: 14 }}>This room sleeps 3 (2 adults + 1 child). Capacity reached.</div>
          <textarea className="ah-textarea" rows={3} placeholder="Special requests (e.g. crib, late check-in, dietary)" style={{ marginBottom: 14 }}></textarea>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, paddingTop: 12, borderTop: '1px solid var(--border)', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="ah-muted">$789 × 5 nights</span><span style={{ fontWeight: 600 }}>$3,945</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="ah-muted">Resort fee</span><span style={{ fontWeight: 600 }}>$185</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="ah-muted">Taxes</span><span style={{ fontWeight: 600 }}>$498</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}><span>Total</span><span>$4,628</span></div>
          </div>
          <button className="ah-btn ah-btn-primary ah-btn-lg ah-btn-block ah-btn-pulse">Reserve</button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, fontWeight: 600 }}>You won't be charged yet</div>
        </div>
      </aside>
    </section>
  </Page>
);

// ─── BOOKING — Step 2 (personal details) with running summary ────────────
const BookingFlow = () => (
  <Page>
    <Header active="rooms" />
    <section style={{ padding: '32px 48px 60px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
      <div>
        <div className="ah-stepper" style={{ marginBottom: 32, maxWidth: 640 }}>
          <div className="ah-step is-done"><span className="ah-step-num"><Icon name="check" size={14} /></span>Dates &amp; guests</div>
          <div className="ah-step-line is-done"></div>
          <div className="ah-step is-active"><span className="ah-step-num">2</span>Personal details</div>
          <div className="ah-step-line"></div>
          <div className="ah-step"><span className="ah-step-num">3</span>Payment</div>
          <div className="ah-step-line"></div>
          <div className="ah-step"><span className="ah-step-num">4</span>Confirm</div>
        </div>

        <h1 className="ah-h1" style={{ fontSize: 28, marginBottom: 8 }}>Who's checking in?</h1>
        <p className="ah-muted" style={{ fontSize: 14, marginBottom: 24 }}>The lead guest must be 18 or older. We'll send confirmation here.</p>

        <div className="ah-card" style={{ padding: 24, maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <div className="ah-input-group">
                <Icon name="mail" /><span className="ah-input-icon"><Icon name="mail" size={18} /></span>
                <input className="ah-input" defaultValue="elena.marin@email.com" />
              </div>
            </div>
            <div className="ah-field">
              <label className="ah-label">Phone</label>
              <input className="ah-input is-error" defaultValue="305 555" />
              <span className="ah-help is-error"><Icon name="error" size={12} /> Please enter a complete phone number.</span>
            </div>
            <div className="ah-field">
              <label className="ah-label">Country of residence</label>
              <select className="ah-select" defaultValue="us"><option value="us">United States</option><option>Canada</option></select>
            </div>
            <div className="ah-field" style={{ gridColumn: 'span 2' }}>
              <label className="ah-label">Special requests (optional)</label>
              <textarea className="ah-textarea" rows={3} placeholder="Crib, late check-in, dietary requirements"></textarea>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 24, padding: 16, background: 'var(--bg)', borderRadius: 10 }}>
            <Icon name="loyalty" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Sign up for Azure Rewards (free)</div>
              <div className="ah-muted" style={{ fontSize: 12, marginTop: 2 }}>Earn 4× points on this stay and unlock late check-out.</div>
            </div>
            <div className="ah-toggle is-on"></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, maxWidth: 640 }}>
          <button className="ah-btn ah-btn-ghost"><Icon name="arrow_back" size={16} /> Back</button>
          <button className="ah-btn ah-btn-primary ah-btn-lg">Continue to payment <Icon name="arrow_forward" size={16} /></button>
        </div>
      </div>

      <aside style={{ position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
        <div className="ah-card" style={{ overflow: 'hidden' }}>
          <div className="ah-img ah-img-ocean" style={{ height: 140 }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>Atlantic Sunrise</span></div>
          <div style={{ padding: 20 }}>
            <h3 className="ah-h3">Atlantic Sunrise Suite</h3>
            <div className="ah-muted" style={{ fontSize: 13, marginTop: 4 }}>allStay · Miami Beach</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div><div className="ah-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Check-in</div><div style={{ fontWeight: 700, fontSize: 14 }}>Thu, May 14</div></div>
              <div style={{ textAlign: 'right' }}><div className="ah-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Check-out</div><div style={{ fontWeight: 700, fontSize: 14 }}>Tue, May 19</div></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, fontSize: 12, fontWeight: 600 }}>
              <span className="ah-chip">5 nights</span>
              <span className="ah-chip">2 adults · 1 child</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="ah-muted">$789 × 5 nights</span><span style={{ fontWeight: 600 }}>$3,945</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="ah-muted">Resort fee</span><span style={{ fontWeight: 600 }}>$185</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="ah-muted">Taxes</span><span style={{ fontWeight: 600 }}>$498</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}><span>Member discount</span><span style={{ fontWeight: 600 }}>−$215</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}><span>Total</span><span>$4,413</span></div>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'var(--success-bg)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#15803D', display: 'flex', gap: 8 }}>
              <Icon name="verified" size={16} /> Free cancellation until May 12
            </div>
          </div>
        </div>
      </aside>
    </section>
  </Page>
);

// ─── CONFIRMATION ─────────────────────────────────────────────────────
const Confirmation = () => (
  <Page>
    <Header active="rooms" />
    <section style={{ padding: '60px 48px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon name="check_circle" size={40} />
      </div>
      <h1 className="ah-h1" style={{ fontSize: 36 }}>You're all set, Elena.</h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '12px auto 0', fontWeight: 500 }}>
        We've sent a confirmation to <strong style={{ color: 'var(--text)' }}>elena.marin@email.com</strong>. Your suite will be ready at 3:00 PM on May 14.
      </p>
      <div className="ah-card" style={{ padding: 28, marginTop: 32, textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div className="ah-eyebrow" style={{ marginBottom: 4 }}>Booking reference</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace' }}>AHM-7K2P-9W4X</div>
          </div>
          <span className="ah-badge ah-badge-confirmed">Confirmed</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="ah-img ah-img-ocean" style={{ borderRadius: 10, height: 180 }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>your suite</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><div className="ah-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Suite</div><div style={{ fontWeight: 700, fontSize: 15 }}>Atlantic Sunrise Suite</div></div>
            <div><div className="ah-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Check-in → out</div><div style={{ fontWeight: 700, fontSize: 15 }}>May 14 → May 19, 2026</div><div className="ah-muted" style={{ fontSize: 12 }}>5 nights, 2 adults, 1 child</div></div>
            <div><div className="ah-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total paid</div><div style={{ fontWeight: 700, fontSize: 15 }}>$4,413.00 · Visa •• 4242</div></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <div className="ah-qr"></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Skip the front desk</div>
            <div className="ah-muted" style={{ fontSize: 13, marginTop: 4, maxWidth: 280 }}>Show this QR at the lobby concierge for instant key and welcome refreshment.</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="ah-btn ah-btn-secondary ah-btn-sm"><Icon name="download" size={14} /> Wallet</button>
              <button className="ah-btn ah-btn-secondary ah-btn-sm"><Icon name="event" size={14} /> Add to calendar</button>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
        <button className="ah-btn ah-btn-primary ah-btn-lg">View My Bookings</button>
        <button className="ah-btn ah-btn-secondary ah-btn-lg"><Icon name="ios_share" size={16} /> Share</button>
      </div>
    </section>
  </Page>
);

Object.assign(window, { SearchPage, RoomDetails, BookingFlow, Confirmation, Calendar, Counter });
