import React from 'react';
import './AuthForm.css';

interface AuthFormProps {
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  newUserName: string;
  setNewUserName: (val: string) => void;
  newUserEmail: string;
  setNewUserEmail: (val: string) => void;
  newUserPassword: string;
  setNewUserPassword: (val: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (val: boolean) => void;
  showSignUpPassword: boolean;
  setShowSignUpPassword: (val: boolean) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  authMode,
  setAuthMode,
  errorMsg,
  setErrorMsg,
  handleLogin,
  handleCreateUser,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  showLoginPassword,
  setShowLoginPassword,
  showSignUpPassword,
  setShowSignUpPassword,
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>rtcs gateway</h1>
          <p>{authMode === 'login' ? 'Login with email and password' : 'Sign up for a new account'}</p>
        </div>

        {errorMsg && (
          <div className="error-banner-auth">
            {errorMsg}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form auth-form-column">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" className="input-field" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input type={showLoginPassword ? 'text' : 'password'} placeholder="Enter your password" className="input-field" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                <button type="button" className="password-toggle-btn" onClick={() => setShowLoginPassword(!showLoginPassword)} title={showLoginPassword ? 'Hide password' : 'Show password'}>
                  {showLoginPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary">Log In</button>
            <div className="auth-redirect-wrapper">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>New user? </span>
              <button type="button" className="auth-redirect-link" onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}>Sign up</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateUser} className="auth-form auth-form-column">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" className="input-field" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" className="input-field" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Create Password</label>
              <div className="password-input-wrapper">
                <input type={showSignUpPassword ? 'text' : 'password'} placeholder="Create a password (min 6 chars)" className="input-field" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
                <button type="button" className="password-toggle-btn" onClick={() => setShowSignUpPassword(!showSignUpPassword)} title={showSignUpPassword ? 'Hide password' : 'Show password'}>
                  {showSignUpPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary">Sign Up & Login</button>
            <div className="auth-redirect-wrapper">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Already existing user? </span>
              <button type="button" className="auth-redirect-link" onClick={() => { setAuthMode('login'); setErrorMsg(null); }}>Log in instead</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
