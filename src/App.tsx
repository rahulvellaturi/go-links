import { useLinks } from './hooks/useLinks';
import { CreateLinkForm } from './components/CreateLinkForm';
import { LinkList } from './components/LinkList';
import './styles/app.css';

export default function App() {
  const { links, loading, error, reload, createLink } = useLinks();

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__logo">
          go<span className="app__slash">/</span>links
        </h1>
        <p className="app__tagline">Short, memorable links for internal destinations.</p>
      </header>

      <main className="app__main">
        <CreateLinkForm existing={links} onCreate={createLink} />
        <LinkList links={links} loading={loading} error={error} onRetry={reload} />
      </main>
    </div>
  );
}
