import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { HeaderWrapper, NavList, NavItem, Brand } from './Header.styled';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { label: 'Home',     to: '/' },
  { label: 'About',    to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact',  to: '/contact' },
];

const Header: FC<HeaderProps> = ({ username, onLogout }) => (
  <HeaderWrapper data-testid="Header">
    <Brand>🏦 SecureBank</Brand>
    <nav>
      <NavList>
        {NAV_ITEMS.map(({ label, to }) => (
          <NavItem key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {label}
            </NavLink>
          </NavItem>
        ))}
        {username && (
          <NavItem>
            <span style={{ marginLeft: 'auto', marginRight: '1rem', color: '#fff', fontSize: '0.9rem' }}>
              Welcome, {username}
            </span>
          </NavItem>
        )}
        {onLogout && (
          <NavItem>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Sign Out
            </button>
          </NavItem>
        )}
      </NavList>
    </nav>
  </HeaderWrapper>
);

export default Header;

