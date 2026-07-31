import React from 'react';
import type { User } from '../../hooks/useUsers';
import './SidebarHeader.css';

interface SidebarHeaderProps {
  currentUser: User;
  handleLogout: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  currentUser,
  handleLogout,
}) => {
  return (
    <div className="sidebar-header">
      <div className="current-user-card">
        <div className="user-avatar">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <span className="name">{currentUser.name}</span>
          <span className="email">{currentUser.email}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
