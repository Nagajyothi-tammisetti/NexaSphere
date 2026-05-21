import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Styles ── */
import './styles/themes.css';
import './styles/globals.css';
import './styles/animations.css';
import './styles/chatbot.css';
import './styles/components.css';
import './styles/aurora.css';
import './styles/motion.css';

/* ── Shared / Layout ── */
import Navbar                  from './shared/Navbar';
import Footer                  from './shared/Footer';
import ScrollProgress          from './shared/ScrollProgress';
import ParticleBackground      from './shared/ParticleBackground';
import GeometricGridBackground from './shared/GeometricGridBackground';
import CinematicOpening        from './shared/CinematicOpening';
import Chatbot                 from './shared/Chatbot';
import {
  AmbientOrbs,
  SectionDivider,
  PageFlash,
  useNsReveal,
  useHeroParallax,
  useNavScrollTint,
  useGlobalMouseParallax,
  useMagneticCards,
} from './shared/MotionLayer';

/* ── Home sections (single-page layout) ── */
import HeroSection       from './pages/home/HeroSection';
import ActivitiesSection from './pages/activities/ActivitiesSection';
import EventsSection     from './pages/events/EventsSection';
import AboutSection      from './pages/about/AboutSection';
import TeamSection       from './pages/team/TeamSection';

/* ── Full-page views ── */
import ActivitiesPage    from './pages/activities/ActivitiesPage';
import ActivityDetailPage from './pages/activities/ActivityDetailPage';
import EventsPage        from './pages/events/EventsPage';
import EventDetailPage   from './pages/events/EventDetailPage';
import ProjectsPage      from './pages/projects/ProjectsPage';
import RoadmapsPage      from './pages/roadmaps/RoadmapsPage';
import AboutPage         from './pages/about/AboutPage';
import TeamPage          from './pages/team/TeamPage';
import ContactPage       from './pages/contact/ContactPage';
import RecruitmentPage   from './pages/recruitment/RecruitmentPage';
import MembershipPage    from './pages/membership/MembershipPage';
import AdminPage         from './pages/admin/AdminPage';
import ResumeAnalyzerPage from './pages/resume/ResumeAnalyzerPage'; // issue #59

/* ── Components ── */
import SearchBar         from './components/SearchBar';
import Terminal          from './components/developer/Terminal';
import BookmarksDrawer   from './components/bookmarks/BookmarksDrawer';

/* ── Hooks & Context ── */
import { useDeveloperMode }  from './hooks/useDeveloperMode';
import { BookmarkProvider }  from './context/BookmarkContext';

/* ── Data ── */
import { activityPages }               from './data/activities/index';
import { events as fallbackEvents }    from './data/eventsData';

/* ── Assets ── */
import nexasphereLogo from './assets/images/logos/nexasphere-logo.png';

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
═══════════════════════════════════════════════════════════════════════════ */
const MNH  = 88;   // mobile nav height
const DNH  = 64;   // desktop nav height

const TABS = [
  'Home', 'Activities', 'Events', 'Projects',
  'Roadmaps', 'Resume', 'About', 'Team', 'Contact',
];

/* ═══════════════════════════════════════════════════════════════════════════
   <Wipe> — full-viewport page transition overlay
═══════════════════════════════════════════════════════════════════════════ */
function Wipe({ on, ph }) {
  if (!on) return null;
  const ease = 'cubic-bezier(.77,0,.18,1)';
  return (
    <>
      {/* Main wipe layer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'var(--bg)',
        animation: `${ph === 'out' ? 'wipeDown .27s' : 'wipeUp .30s'} ${ease} forwards`,
        pointerEvents: 'all',
      }} />

      {/* Brand-colour accent layer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 8001, pointerEvents: 'none',
        background: 'linear-gradient(90deg,#CC1111,#880000,#EE2222)',
        opacity: .09,
        animation: `${ph === 'out' ? 'wipeDown .20s .04s' : 'wipeUp .24s .04s'} ${ease} forwards`,
      }} />

      {/* Shimmer on exit */}
      {ph === 'out' && <div className="wipe-shimmer" aria-hidden="true" />}

      {/* Flash on enter */}
      {ph === 'in' && <PageFlash />}

      {/* Logo splash on exit */}
      {ph === 'out' && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', zIndex: 8002,
          transform: 'translate(-50%,-50%)', pointerEvents: 'none',
          opacity: 0, animation: 'splashIn .16s .1s ease forwards',
        }}>
          <img
            src={nexasphereLogo}
            alt=""
            style={{
              height: '46px', mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 12px var(--c1))', opacity: .6,
            }}
          />
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   <PageIn> — mount animation for every routed page
═══════════════════════════════════════════════════════════════════════════ */
function PageIn({ children, k }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [k]);

  return (
    <div style={{
      opacity:    ready ? 1 : 0,
      transform:  ready ? 'none' : 'translateY(16px) scale(.99)',
      transition: 'opacity .42s cubic-bezier(.22,1,.36,1), transform .42s cubic-bezier(.22,1,.36,1)',
      willChange: 'opacity, transform',
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   <Cursor> — custom anti-gravity orb cursor (desktop only)
═══════════════════════════════════════════════════════════════════════════ */
function Cursor() {
  const orbRef   = useRef(null);
  const trailRef = useRef(null);
  const glowRef  = useRef(null);
  const state    = useRef({
    mx: 0, my: 0, ox: 0, oy: 0,
    floatY: 0, floatPhase: 0,
    hovering: false, clicking: false, raf: null,
  });

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    document.body.style.cursor = 'none';
    const s = state.current;

    const onMove = e => { s.mx = e.clientX; s.my = e.clientY; };
    const onDown = ()  => { s.clicking = true; };
    const onUp   = ()  => { s.clicking = false; };
    const onOver = e   => {
      s.hovering = !!e.target.closest('button, a, [role="button"], [tabindex]');
    };

    const tick = () => {
      // Snap orb directly to pointer (no lag) – float adds the organic motion
      s.ox += (s.mx - s.ox) * 1.0;
      s.oy += (s.my - s.oy) * 1.0;

      // Layered sine for natural floating
      s.floatPhase += 0.022;
      s.floatY =
        Math.sin(s.floatPhase)       * 2 +
        Math.sin(s.floatPhase * 1.7) * 1 +
        Math.sin(s.floatPhase * 0.5) * 1;

      const fy      = s.oy + s.floatY;
      const scale   = s.clicking ? 0.7 : s.hovering ? 1.55 : 1;
      const opacity = s.hovering ? 0.95 : 0.82;

      if (orbRef.current) {
        orbRef.current.style.left      = `${s.ox}px`;
        orbRef.current.style.top       = `${fy}px`;
        orbRef.current.style.transform = `translate(-50%,-50%) scale(${scale})`;
        orbRef.current.style.opacity   = opacity;
      }
      if (trailRef.current) {
        trailRef.current.style.left    = `${s.ox}px`;
        trailRef.current.style.top     = `${s.oy + s.floatY * 0.4}px`;
        trailRef.current.style.opacity = s.hovering ? 0 : 0.35;
      }
      if (glowRef.current) {
        glowRef.current.style.left = `${s.mx}px`;
        glowRef.current.style.top  = `${s.my}px`;
      }

      s.raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('mouseover', onOver, { passive: true });
    s.raf = requestAnimationFrame(tick);

    return () => {
      document.body.style.cursor = '';
      cancelAnimationFrame(s.raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      {/* Wide ambient glow — follows raw pointer */}
      <div ref={glowRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 10000,
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,17,17,.055) 0%, rgba(136,0,0,.03) 40%, transparent 70%)',
        transform: 'translate(-50%,-50%)',
        transition: 'opacity .3s',
      }} />

      {/* Soft blur trail — lags slightly behind orb */}
      <div ref={trailRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 10002,
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,17,17,0.7) 0%, transparent 70%)',
        transform: 'translate(-50%,-50%)', filter: 'blur(6px)',
        transition: 'opacity .25s',
      }} />

      {/* Core orb */}
      <div ref={orbRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 100000,
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #fff 0%, #CC1111 40%, #880000 100%)',
        boxShadow: '0 0 10px rgba(204,17,17,.9), 0 0 24px rgba(204,17,17,.5), 0 0 50px rgba(136,0,0,.3)',
        transition: 'transform .08s cubic-bezier(.34,1.56,.64,1), opacity .2s',
      }}>
        {/* Specular highlight */}
        <div style={{
          position: 'absolute', top: '20%', left: '22%',
          width: '5px', height: '5px', borderRadius: '50%',
          background: 'rgba(255,255,255,.9)', filter: 'blur(1px)',
        }} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   <NotFoundPage>
═══════════════════════════════════════════════════════════════════════════ */
function NotFoundPage({ onGoHome }) {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 24px',
    }}>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 'clamp(5rem,18vw,10rem)', fontWeight: 900,
        background: 'linear-gradient(135deg,#CC1111 0%,#EE2222 50%,#FF4444 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', lineHeight: 1, marginBottom: '16px',
      }}>404</div>
      <h2 style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 'clamp(1rem,3vw,1.5rem)', fontWeight: 700,
        color: 'var(--t1)', marginBottom: '12px',
      }}>Page Not Found</h2>
      <p style={{
        color: 'var(--t2)', fontSize: '1rem',
        maxWidth: '380px', lineHeight: 1.7, marginBottom: '32px',
      }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <button className="btn btn-primary" onClick={onGoHome}>← Go Home</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Root <App>
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {

  /* ── Core state ── */
  const [cinDone,      setCinDone]      = useState(false);
  const [activeTab,    setActiveTab]    = useState('Home');
  const [mobile,       setMobile]       = useState(window.innerWidth <= 768);
  const [theme,        setTheme]        = useState(() => localStorage.getItem('ns-theme') || 'dark');
  const [eventsData,   setEventsData]   = useState(fallbackEvents);

  /* ── Wipe transition state ── */
  const [wipeOn, setWipeOn] = useState(false);
  const [wipePh, setWipePh] = useState('out');

  /* ── Routing: null = home scroll-spy, object = full-page view ── */
  const [page, setPage] = useState(null);

  /* ── Overlay state ── */
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  /* ── Developer terminal ── */
  const { isOpen: isTerminalOpen, closeTerminal } = useDeveloperMode();

  /* ─────────────────────────────────────────────────────────────────────
     Side-effects
  ───────────────────────────────────────────────────────────────────── */

  // Apply theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ns-theme', theme); } catch {}
  }, [theme]);

  // Fetch live events from API; fall back to static data
  useEffect(() => {
    let alive = true;
    const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
    const url  = base ? `${base}/api/content/events` : '/api/content/events';

    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        if (alive && Array.isArray(data?.events) && data.events.length > 0)
          setEventsData(data.events);
      })
      .catch(() => { /* silently keep fallback data */ });

    return () => { alive = false; };
  }, []);

  // Back-to-top button
  useEffect(() => {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400);
    const onClick  = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', onClick);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-tab scroll-spy (home page only, not sub-pages)
  useEffect(() => {
    if (page) return;
    const nh = mobile ? MNH : DNH;
    const onScroll = () => {
      const sy = window.scrollY + nh + 30;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${TABS[i].toLowerCase()}`);
        if (el && el.offsetTop <= sy) { setActiveTab(TABS[i]); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobile, page]);

  // Responsive mobile flag
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Ctrl/Cmd + K → open search
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Escape → close overlays
  useEffect(() => {
    const onKey = e => {
      if (e.key !== 'Escape') return;
      setSearchOpen(false);
      setBookmarksOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Scroll-reveal + mouse effects (after cinematic completes)
  useEffect(() => {
    if (!cinDone) return;

    /* Intersection Observer — reveal classes */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.classList.contains('fired')) {
          e.target.classList.add('fired');
          e.target.addEventListener(
            'animationend',
            () => { e.target.style.opacity = '1'; e.target.style.transform = 'none'; },
            { once: true }
          );
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -36px 0px' });

    document
      .querySelectorAll('.pop-in,.pop-left,.pop-right,.pop-scale,.pop-flip,.pop-word,.pop-num')
      .forEach(el => obs.observe(el));

    /* Magnetic buttons + activity card tilt */
    const onMouseMove = e => {
      // Magnetic pull on .mag-btn elements
      document.querySelectorAll('.mag-btn').forEach(btn => {
        const r  = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width  / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        const d  = Math.hypot(dx, dy);
        btn.style.transform = d < 88
          ? `translate(${dx * (88 - d) / 88 * 0.32}px, ${dy * (88 - d) / 88 * 0.32}px)`
          : '';
      });

      // 3-D tilt on .activity-card elements
      document.querySelectorAll('.activity-card').forEach(card => {
        const r       = card.getBoundingClientRect();
        const cx      = r.left + r.width  / 2;
        const cy      = r.top  + r.height / 2;
        const dx      = e.clientX - cx;
        const dy      = e.clientY - cy;
        const dist    = Math.hypot(dx, dy);
        const maxDist = Math.max(r.width, r.height) * 0.9;
        if (dist < maxDist) {
          const intensity = (1 - dist / maxDist) * 6;
          card.style.setProperty('--rx',  (dx / r.width  * intensity).toFixed(2));
          card.style.setProperty('--ry', (-dy / r.height * intensity).toFixed(2));
        } else {
          card.style.setProperty('--rx', '0');
          card.style.setProperty('--ry', '0');
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [cinDone, page]);

  /* ── Motion layer hooks ── */
  useNsReveal([cinDone, page]);
  useHeroParallax();
  useNavScrollTint();
  useGlobalMouseParallax();
  useMagneticCards();

  /* ─────────────────────────────────────────────────────────────────────
     Navigation helpers
  ───────────────────────────────────────────────────────────────────── */

  /**
   * nav(fn) — run page-transition wipe, execute fn at mid-point,
   * then wipe back in. All route changes go through this.
   */
  const nav = useCallback(fn => {
    setWipeOn(true);
    setWipePh('out');
    setTimeout(() => {
      fn();
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => {
        setWipePh('in');
        setTimeout(() => setWipeOn(false), 340);
      });
    }, 275);
  }, []);

  /** Handle Navbar tab click */
  const onTab = useCallback(tab => {
    const fullPageTabs = [
      'Activities', 'Events', 'Projects', 'Roadmaps',
      'Resume', 'About', 'Team', 'Contact',
    ];

    if (fullPageTabs.includes(tab)) {
      nav(() => { setPage({ type: 'section', section: tab }); setActiveTab(tab); });
      return;
    }

    // 'Home' — scroll back to top of single-page layout
    nav(() => {
      setPage(null);
      setActiveTab(tab);
      setTimeout(() => {
        const el = document.getElementById(`section-${tab.toLowerCase()}`);
        if (!el) return;
        window.scrollTo({ top: el.offsetTop - (mobile ? MNH : DNH), behavior: 'smooth' });
      }, 50);
    });
  }, [nav, mobile]);

  /** Navigate into an activity detail */
  const onNavigate = useCallback((type, title) => {
    if (type === 'activity')
      nav(() => setPage({ type: 'activity', activityKey: title }));
  }, [nav]);

  /** Navigate into an event detail */
  const onEvent = useCallback(ev => {
    nav(() => setPage(p => ({ ...p, type: 'event', event: ev })));
  }, [nav]);

  /** KSS card click (Insight Session activity context) */
  const onKSSClick = useCallback(ev => {
    nav(() => setPage({ type: 'event', activityKey: 'Insight Session', event: ev }));
  }, [nav]);

  /** Back from event detail → parent activity detail */
  const onBackAct = useCallback(() => {
    nav(() => setPage(p => ({ type: 'activity', activityKey: p.activityKey })));
  }, [nav]);

  /** Back from any detail page → activities section */
  const onBackMain = useCallback(() => {
    nav(() => {
      setPage(null);
      setTimeout(() => {
        const el = document.getElementById('section-activities');
        if (!el) return;
        window.scrollTo({ top: el.offsetTop - (mobile ? MNH : DNH), behavior: 'smooth' });
      }, 50);
    });
  }, [nav, mobile]);

  /** Back to home */
  const onBackHome = useCallback(() => {
    nav(() => { setPage(null); setActiveTab('Home'); window.scrollTo({ top: 0 }); });
  }, [nav]);

  /** Open Apply / Join as full pages */
  const openApply = useCallback(() => nav(() => setPage({ type: 'apply' })), [nav]);
  const openJoin  = useCallback(() => nav(() => setPage({ type: 'join'  })), [nav]);

  /** Theme toggle */
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  /* ─────────────────────────────────────────────────────────────────────
     Derived values
  ───────────────────────────────────────────────────────────────────── */
  const nh  = mobile ? MNH : DNH;
  const cur = page?.activityKey ? activityPages[page.activityKey] : null;

  /* ─────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────── */
  return (
    <BookmarkProvider>

      {/* ── Chatbot (always mounted after cinematic) ── */}
      <Chatbot />

      {/* ── Cinematic opening splash ── */}
      {!cinDone && (
        <CinematicOpening theme={theme} onDone={() => setCinDone(true)} />
      )}

      {/* ── Global UI (only after cinematic) ── */}
      {cinDone && <ScrollProgress />}
      <Cursor />
      <Wipe on={wipeOn} ph={wipePh} />

      {cinDone && <AmbientOrbs theme={theme} />}
      {cinDone && <GeometricGridBackground theme={theme} />}
      {cinDone && <ParticleBackground theme={theme} />}

      {cinDone && (
        <Navbar
          activeTab={activeTab}
          onTabChange={onTab}
          onToggleTheme={toggleTheme}
          theme={theme}
          onApply={openApply}
          onJoin={openJoin}
          onToggleBookmarks={() => setBookmarksOpen(prev => !prev)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          Main content area
      ══════════════════════════════════════════════════════════════ */}
      <main style={{ paddingTop: nh, position: 'relative', zIndex: 1 }}>

        {page ? (
          /* ── Full-page routed view ── */
          <PageIn k={`${page.type}-${page.section ?? ''}-${page.activityKey ?? ''}`}>

            {/* Section pages */}
            {page.section === 'Activities' && (
              <ActivitiesPage onNavigate={onNavigate} onBack={onBackHome} />
            )}
            {page.section === 'Events' && (
              <EventsPage
                onBack={onBackHome}
                onEventClick={onKSSClick}
                events={eventsData}
              />
            )}
            {page.section === 'Projects' && (
              <ProjectsPage onBack={onBackHome} />
            )}
            {page.section === 'Roadmaps' && (
              <RoadmapsPage onBack={onBackHome} />
            )}
            {page.section === 'About' && (
              <AboutPage onBack={onBackHome} />
            )}
            {page.section === 'Team' && (
              <TeamPage onBack={onBackHome} onApply={openApply} />
            )}
            {page.section === 'Contact' && (
              <ContactPage onBack={onBackHome} />
            )}

            {/* ── AI Resume Analyzer (issue #59) ── */}
            {page.section === 'Resume' && (
              <ResumeAnalyzerPage onBack={onBackHome} />
            )}

            {/* Detail views */}
            {page.type === 'activity' && cur && (
              <ActivityDetailPage
                activity={cur}
                onBack={onBackMain}
                onSelectEvent={onEvent}
              />
            )}
            {page.type === 'event' && page.event && (
              <EventDetailPage
                event={page.event}
                onBack={page.activityKey ? onBackAct : onBackMain}
              />
            )}

            {/* Modal-style full pages */}
            {page.type === 'apply' && <RecruitmentPage onBack={onBackHome} />}
            {page.type === 'join'  && <MembershipPage  onBack={onBackHome} />}
            {page.type === 'admin' && <AdminPage        onBack={onBackHome} />}

            {/* 404 fallback */}
            {page.type && !['section','activity','event','apply','join','admin'].includes(page.type) && (
              <NotFoundPage onGoHome={onBackHome} />
            )}

          </PageIn>
        ) : (
          /* ── Single-page home layout (scroll-spy) ── */
          cinDone && (
            <PageIn k="home-main">
              <HeroSection
                onTabChange={onTab}
                onApply={openApply}
                onJoin={openJoin}
                theme={theme}
              />
              <SectionDivider />
              <ActivitiesSection onNavigate={onNavigate} />
              <SectionDivider />
              <EventsSection onEventClick={onKSSClick} events={eventsData} />
              <SectionDivider />
              <AboutSection />
              <SectionDivider />
              <TeamSection onApply={openApply} />
              <Footer
                onAdmin={() => nav(() => setPage({ type: 'admin' }))}
                onProjects={() => onTab('Projects')}
                onRoadmaps={() => onTab('Roadmaps')}
              />
            </PageIn>
          )
        )}
      </main>

      {/* ── Back-to-top button ── */}
      {cinDone && <button id="back-to-top" aria-label="Back to top">↑</button>}

      {/* ── Floating search button (bottom-left) ── */}
      {cinDone && (
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
          title="Search  (Ctrl + K)"
          style={{
            position: 'fixed', bottom: '80px', left: '24px', zIndex: 8500,
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#CC1111,#880000)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(204,17,17,0.5)',
            transition: 'transform .2s, box-shadow .2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform  = 'scale(1.12)';
            e.currentTarget.style.boxShadow  = '0 6px 28px rgba(204,17,17,0.75)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform  = 'scale(1)';
            e.currentTarget.style.boxShadow  = '0 4px 20px rgba(204,17,17,0.5)';
          }}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="#fff" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}

      {/* ── Search overlay ── */}
      <SearchBar
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        activities={activityPages}
        events={eventsData}
        onNavigate={onNavigate}
        onEventClick={onKSSClick}
      />

      {/* ── Developer terminal ── */}
      <Terminal
        isOpen={isTerminalOpen}
        onClose={closeTerminal}
        theme={theme}
        setTheme={setTheme}
        onNavigate={onTab}
      />

      {/* ── Bookmarks drawer ── */}
      <BookmarksDrawer
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        onNavigate={type => {
          const map = { Event: 'Events', Activity: 'Activities', Roadmap: 'Roadmaps' };
          if (map[type]) onTab(map[type]);
        }}
      />

    </BookmarkProvider>
  );
}