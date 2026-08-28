import { useLinks } from './hooks/useLinks';
import { CreateLinkForm } from './components/CreateLinkForm';
import { LinkList } from './components/LinkList';
import './styles/app.css';
import { useEffect, useState, useRef } from 'react';

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

function AnimatedTotal({ value }: { value: number }) {
  const [animate, setAnimate] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 380);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <span className={`app__stat-pill ${animate ? 'pill--pulse' : ''}`}>
      {value} visits
    </span>
  );
}

export default function App() {
  const { links, loading, error, reload, createLink } = useLinks();
  const [toast, setToast] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && (document.activeElement?.tagName || '') !== 'INPUT') {
        e.preventDefault();
        const el = document.getElementById('shortname') as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const totalVisits = links.reduce((total, link) => total + link.visits, 0);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title-wrap">
          <div className="app__brand-mark">g</div>
          <div>
            <h1 className="app__logo">
              go<span className="app__slash">/</span>links
            </h1>
            <p className="app__tagline">Short, memorable links for internal destinations.</p>
          </div>
        </div>

        <div className="app__stats" aria-label="Link summary">
          <span className="app__stat-pill">{links.length} active</span>
          <AnimatedTotal value={totalVisits} />
          <button
            aria-pressed={dark}
            className="button button--ghost"
            onClick={() => setDark((d) => !d)}
            title="Toggle dark mode"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="app__main">
        <CreateLinkForm existing={links} onCreate={async (input) => {
          await createLink(input);
          showToast(`Created go/${input.shortname}`);
        }} showToast={showToast} />
        <LinkList links={links} loading={loading} error={error} onRetry={reload} showToast={showToast} />
      </main>
      <Toast message={toast} />
    </div>
  );
}
