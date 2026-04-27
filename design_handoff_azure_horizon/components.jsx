/* Azure Horizon — shared components and pages */

const Icon = ({ name, size }) => (
  <span className="material-symbols-outlined" style={{ fontSize: size || 20 }}>{name}</span>
);

const Stars = ({ value = 5, size = 14, total = 5 }) => (
  <span className="ah-stars" style={{ fontSize: size }}>
    {Array.from({ length: total }).map((_, i) => (
      <Icon key={i} name={i < value ? 'star' : 'star'} size={size} />
    )).map((s, i) => (
      <span key={i} className={i < value ? '' : 'empty'}>★</span>
    ))}
  </span>
);

const Header = ({ active = 'home', transparent, loggedIn = true }) => (
  <header className={`ah-header ${transparent ? 'is-transparent' : ''}`}>
    <div className="ah-logo">
      <div className="ah-logo-mark"></div>
      <span>Azure Horizon</span>
    </div>
    <nav className="ah-nav">
      <a className={active === 'home' ? 'is-active' : ''}>Stay</a>
      <a className={active === 'rooms' ? 'is-active' : ''}>Rooms</a>
      <a className={active === 'experiences' ? 'is-active' : ''}>Experiences</a>
      <a className={active === 'dining' ? 'is-active' : ''}>Dining</a>
      <a className={active === 'about' ? 'is-active' : ''}>About</a>
    </nav>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {loggedIn ? (
        <>
          <div className="ah-bell"><Icon name="notifications" size={18} /></div>
          <div className="ah-avatar">EM</div>
        </>
      ) : (
        <>
          <button className="ah-btn ah-btn-ghost ah-btn-sm">Sign in</button>
          <button className="ah-btn ah-btn-primary ah-btn-sm">Book now</button>
        </>
      )}
    </div>
  </header>
);

const Page = ({ children, scroll = true }) => (
  <div className="ah-page ah-root">
    {scroll ? <div className="ah-scroll">{children}</div> : children}
  </div>
);

// ─── HOME — Variant A: Editorial / Full-bleed ocean ────────────────────
const HomeA = () => (
  <Page>
    <Header active="home" transparent />
    <div style={{ marginTop: -68 }}>
      <section className="ah-hero">
        <div className="ah-img ah-img-ocean" style={{ position: 'absolute', inset: 0, fontSize: 14 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>full-bleed ocean hero · 1920×1080</span>
        </div>
        <div className="ah-hero-overlay"></div>
        <div className="ah-hero-content">
          <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.85, marginBottom: 14 }}>★★★★★ &nbsp; Miami · South Beach</div>
          <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, margin: 0, maxWidth: 760 }}>
            Where the<br />Atlantic meets<br /><em style={{ fontWeight: 400, fontStyle: 'italic' }}>quiet luxury.</em>
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, maxWidth: 480, marginTop: 18, fontWeight: 500 }}>
            Oceanfront suites, three-time Michelin dining, and a private stretch of South Beach.
          </p>
        </div>
      </section>
      <div style={{ padding: '0 48px', marginTop: -48, position: 'relative', zIndex: 5 }}>
        <SearchBar />
      </div>
    </div>
    <FeaturedRooms />
    <Facilities />
    <ReviewsCarousel />
    <TrustRow />
    <Footer />
  </Page>
);

const SearchBar = () => (
  <div className="ah-searchbar">
    <div>
      <span className="ah-searchbar-label">Destination</span>
      <span className="ah-searchbar-value">Azure Horizon · Miami</span>
    </div>
    <div>
      <span className="ah-searchbar-label">Check-in</span>
      <span className="ah-searchbar-value">May 14, 2026</span>
    </div>
    <div>
      <span className="ah-searchbar-label">Check-out</span>
      <span className="ah-searchbar-value">May 19, 2026</span>
    </div>
    <div>
      <span className="ah-searchbar-label">Guests</span>
      <span className="ah-searchbar-value">2 adults · 1 child</span>
    </div>
    <div className="ah-searchbar-cta">
      <button className="ah-btn ah-btn-primary ah-btn-lg ah-btn-pulse">
        <Icon name="search" size={18} /> Search
      </button>
    </div>
  </div>
);

const RoomCard = ({ name, price, capacity, sqft, amenities, img, badge, badgeKind = 'confirmed' }) => (
  <div className="ah-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div className={`ah-img ${img}`} style={{ height: 200, position: 'relative' }}>
      {badge && <span className={`ah-badge ah-badge-${badgeKind}`} style={{ position: 'absolute', top: 12, left: 12 }}>{badge}</span>}
      <span style={{ color: 'rgba(0,0,0,0.5)' }}>room photo</span>
    </div>
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <div>
        <h3 className="ah-h3">{name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
          <span><Icon name="group" size={14} /> {capacity}</span>
          <span>·</span>
          <span><Icon name="square_foot" size={14} /> {sqft} ft²</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {amenities.map((a, i) => <span key={i} className="ah-chip">{a}</span>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>${price}<span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>/night</span></div>
        </div>
        <button className="ah-btn ah-btn-primary ah-btn-sm">Book Now</button>
      </div>
    </div>
  </div>
);

const FeaturedRooms = () => (
  <section style={{ padding: '80px 48px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
      <div>
        <div className="ah-eyebrow" style={{ marginBottom: 8 }}>Suites & Rooms</div>
        <h2 className="ah-h1">Designed to slow you down</h2>
      </div>
      <a className="ah-btn ah-btn-secondary">View all 64 rooms <Icon name="arrow_forward" size={16} /></a>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      <RoomCard name="Atlantic Sunrise Suite" price="789" capacity="2 guests" sqft="640" amenities={['Ocean view', 'King bed', 'Balcony']} img="ah-img-ocean" badge="Most loved" />
      <RoomCard name="Coral Garden Room" price="445" capacity="2 guests" sqft="380" amenities={['Garden view', 'Queen bed', 'Patio']} img="ah-img-room" badge="Available" />
      <RoomCard name="Penthouse Horizon" price="2,140" capacity="4 guests" sqft="1,820" amenities={['Private pool', 'Butler', '2 bedrooms']} img="ah-img-suite" badge="2 left" badgeKind="pending" />
    </div>
  </section>
);

const Facilities = () => {
  const items = [
    { icon: 'pool', label: 'Infinity Pool', desc: 'Three pools, ocean-edge cabanas' },
    { icon: 'spa', label: 'Coral Spa', desc: '12 treatment rooms, hammam' },
    { icon: 'restaurant', label: 'Michelin Dining', desc: 'Four restaurants, two starred' },
    { icon: 'fitness_center', label: 'Wellness Club', desc: '24/7 gym, yoga deck, pilates' },
    { icon: 'directions_boat', label: 'Marina Access', desc: 'Yacht charters & water sports' },
    { icon: 'child_care', label: "Kids' Club", desc: 'Ages 4–12, all day' },
  ];
  return (
    <section style={{ padding: '0 48px 80px' }}>
      <div className="ah-eyebrow" style={{ marginBottom: 8 }}>Property</div>
      <h2 className="ah-h1" style={{ marginBottom: 32 }}>Everything within reach</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {items.map((it, i) => (
          <div key={i} className="ah-card" style={{ padding: 24, display: 'flex', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={it.icon} size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{it.label}</div>
              <div className="ah-muted" style={{ fontSize: 13, marginTop: 2 }}>{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ReviewsCarousel = () => {
  const reviews = [
    { name: 'Sofía R.', stay: 'Atlantic Sunrise Suite · 5 nights', rating: 5, quote: 'The kind of place where time bends. We extended twice and still left too soon.' },
    { name: 'Marcus T.', stay: 'Coral Garden Room · 3 nights', rating: 5, quote: 'Service so anticipatory it felt like mind reading. The breakfast on the terrace alone is worth the trip.' },
    { name: 'Aiko & Jun', stay: 'Penthouse Horizon · 7 nights', rating: 5, quote: 'Honeymoon perfection. The private pool at sunset will live in our memory forever.' },
  ];
  return (
    <section style={{ padding: '0 48px 80px', background: 'white' }}>
      <div style={{ padding: '60px 0' }}>
        <div className="ah-eyebrow" style={{ marginBottom: 8 }}>Guest reviews · 4.9 / 5</div>
        <h2 className="ah-h1" style={{ marginBottom: 32 }}>What our guests are saying</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {reviews.map((r, i) => (
            <div key={i} className="ah-card" style={{ padding: 24 }}>
              <span className="ah-stars" style={{ marginBottom: 12 }}>{'★★★★★'.split('').map((s, j) => <span key={j}>★</span>)}</span>
              <p style={{ fontSize: 15, lineHeight: 1.55, fontWeight: 500, margin: '8px 0 16px' }}>"{r.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #818CF8, #6366F1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{r.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                  <div className="ah-muted" style={{ fontSize: 12 }}>{r.stay}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustRow = () => (
  <section style={{ padding: '32px 48px', borderTop: '1px solid var(--border)', background: 'white' }}>
    <div className="ah-trust">
      <span className="ah-trust-item">★★★★★ Forbes Travel Guide</span>
      <span className="ah-trust-item">AAA Five Diamond</span>
      <span className="ah-trust-item">Condé Nast Top 10</span>
      <span className="ah-trust-item">Michelin Key 2026</span>
      <span className="ah-trust-item">Travel + Leisure 100</span>
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ padding: '48px', background: '#0F172A', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 800, fontSize: 17, marginBottom: 12 }}>
          <div className="ah-logo-mark"></div> Azure Horizon
        </div>
        <div style={{ maxWidth: 320, lineHeight: 1.6 }}>1 Ocean Drive, Miami Beach, FL 33139<br />+1 305 555 0140</div>
      </div>
      <div style={{ display: 'flex', gap: 60, fontWeight: 600 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong style={{ color: 'white', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Stay</strong>
          <a>Rooms</a><a>Suites</a><a>Residences</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong style={{ color: 'white', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Property</strong>
          <a>Spa</a><a>Dining</a><a>Experiences</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong style={{ color: 'white', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Help</strong>
          <a>Contact</a><a>FAQ</a><a>Press</a>
        </div>
      </div>
    </div>
  </footer>
);

// ─── HOME — Variant B: Split / Editorial card grid ─────────────────────
const HomeB = () => (
  <Page>
    <Header active="home" />
    <section style={{ padding: '48px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 24 }}>
        <div className="ah-eyebrow" style={{ marginBottom: 16 }}>★★★★★ Miami · Est. 1962</div>
        <h1 style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.95, margin: 0 }}>
          A horizon<br />of your own.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 460, marginTop: 20, lineHeight: 1.55, fontWeight: 500 }}>
          Sixty-four oceanfront suites and residences on a private mile of South Beach. Open year-round.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="ah-btn ah-btn-primary ah-btn-lg">Check availability</button>
          <button className="ah-btn ah-btn-secondary ah-btn-lg">Take the tour</button>
        </div>
        <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
          <div><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>4.9</div><div className="ah-muted" style={{ fontSize: 12 }}>2,847 reviews</div></div>
          <div><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>64</div><div className="ah-muted" style={{ fontSize: 12 }}>oceanfront rooms</div></div>
          <div><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>1mi</div><div className="ah-muted" style={{ fontSize: 12 }}>private beach</div></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, height: 600 }}>
        <div className="ah-img ah-img-ocean" style={{ borderRadius: 16, gridRow: 'span 2' }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>ocean / sunrise</span></div>
        <div className="ah-img ah-img-suite" style={{ borderRadius: 16 }}><span style={{ color: 'rgba(0,0,0,0.5)' }}>penthouse</span></div>
        <div className="ah-img ah-img-pool" style={{ borderRadius: 16 }}><span style={{ color: 'rgba(0,0,0,0.5)' }}>infinity pool</span></div>
      </div>
    </section>
    <section style={{ padding: '0 48px 48px' }}>
      <SearchBar />
    </section>
    <FeaturedRooms />
    <Facilities />
    <Footer />
  </Page>
);

// ─── HOME — Variant C: Compact / data-dense like Booking.com ───────────
const HomeC = () => (
  <Page>
    <div style={{ background: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 100%)', color: 'white', padding: '20px 32px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div className="ah-logo" style={{ color: 'white' }}>
          <div className="ah-logo-mark"></div>
          <span>Azure Horizon</span>
        </div>
        <nav style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 600 }}>
          <a style={{ color: 'white', opacity: 0.9 }}>Stays</a>
          <a style={{ color: 'white', opacity: 0.9 }}>Experiences</a>
          <a style={{ color: 'white', opacity: 0.9 }}>List a property</a>
          <a style={{ color: 'white', opacity: 0.9 }}>Help</a>
          <button className="ah-btn ah-btn-sm" style={{ background: 'white', color: 'var(--primary)' }}>Sign in</button>
        </nav>
      </div>
      <div style={{ maxWidth: 720, marginBottom: 24 }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.05 }}>Find your next stay at Azure Horizon</h1>
        <p style={{ fontSize: 16, marginTop: 8, opacity: 0.9, fontWeight: 500 }}>Ocean-view suites, member rates from $389/night.</p>
      </div>
      <SearchBar />
    </div>
    <section style={{ padding: '40px 32px 24px' }}>
      <h2 className="ah-h2" style={{ marginBottom: 16 }}>Trending this week in Miami</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { name: 'Atlantic Sunrise', price: 789, img: 'ah-img-ocean', tag: 'Best seller' },
          { name: 'Coral Garden', price: 445, img: 'ah-img-room', tag: 'Genius price' },
          { name: 'Penthouse Horizon', price: 2140, img: 'ah-img-suite', tag: '2 left' },
          { name: 'Reef Studio', price: 329, img: 'ah-img-pool', tag: 'New' },
        ].map((r, i) => (
          <div key={i} className="ah-card" style={{ overflow: 'hidden' }}>
            <div className={`ah-img ${r.img}`} style={{ height: 140, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 8, left: 8, background: 'white', color: 'var(--primary)', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{r.tag}</span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <span className="ah-stars">★★★★★</span>
                <span className="ah-muted" style={{ fontSize: 12 }}>4.9</span>
              </div>
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: 16 }}>${r.price}<span className="ah-muted" style={{ fontSize: 12, fontWeight: 500 }}>/night</span></div>
            </div>
          </div>
        ))}
      </div>
    </section>
    <Facilities />
    <Footer />
  </Page>
);

Object.assign(window, { Icon, Stars, Header, Page, SearchBar, RoomCard, FeaturedRooms, Facilities, ReviewsCarousel, TrustRow, Footer, HomeA, HomeB, HomeC });
