import { useShortcuts } from './hooks/useShortcuts';
import { useGoAlias } from './hooks/useHashRoute';
import { CreateShortcutForm } from './components/CreateShortcutForm';
import { ShortcutList } from './components/ShortcutList';
import { RedirectView } from './components/RedirectView';
import './styles/app.css';

export default function App() {
  const { shortcuts, loading, error, reload, addShortcut } = useShortcuts();
  const alias = useGoAlias();

  if (alias) {
    return (
      <Shell>
        <RedirectView alias={alias} shortcuts={shortcuts} loading={loading} />
      </Shell>
    );
  }

  return (
    <Shell>
      <CreateShortcutForm existing={shortcuts} onCreate={addShortcut} />
      <ShortcutList
        shortcuts={shortcuts}
        loading={loading}
        error={error}
        onRetry={reload}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__logo">
          go<span className="app__slash">/</span>links
        </h1>
        <p className="app__tagline">Short, memorable links for internal destinations.</p>
      </header>
      <main className="app__main">{children}</main>
    </div>
  );
}
