import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="page-center">
      <div className="surface-card not-found">
        <h1 className="auth-title">404</h1>
        <p className="auth-subtitle">This page could not be found.</p>
        <Link to="/" className="btn btn--primary">
          Go home
        </Link>
      </div>
    </main>
  );
}
