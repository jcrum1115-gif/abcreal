import styled from 'styled-components';

export const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0 2rem;
  height: 60px;
  background: #1a365d;
  color: #fff;
`;

export const Brand = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  margin-right: auto;
  letter-spacing: 0.02em;
`;

export const NavList = styled.ul`
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
  a {
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.25rem 0;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;

    &:hover {
      color: #fff;
    }

    &.active {
      color: #fff;
      border-bottom-color: #63b3ed;
    }
  }
`;
