import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (username: string, customerId: string) => void;
}

const Login: FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result && result.id) {
        // Store username and customer ID in localStorage
        localStorage.setItem('user', JSON.stringify({ username, id: result.id }));
        onLoginSuccess(username, result.id);
        navigate('/');
      }
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏦 SecureBank</h1>
          <p>Your Trusted Financial Partner</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading || !username || !password} className="login-btn">
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <div className="credentials-list">
            <div className="credential-option" onClick={() => { setUsername('jocelyn'); setPassword('jocelyn123'); }}>
              <span className="cred-user">jocelyn</span> / <span className="cred-pass">jocelyn123</span>
            </div>
            <div className="credential-option" onClick={() => { setUsername('alex'); setPassword('alex456'); }}>
              <span className="cred-user">alex</span> / <span className="cred-pass">alex456</span>
            </div>
            <div className="credential-option" onClick={() => { setUsername('sarah'); setPassword('sarah789'); }}>
              <span className="cred-user">sarah</span> / <span className="cred-pass">sarah789</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
