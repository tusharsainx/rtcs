// AI-generated: Refactored modular App component assembling subcomponents for clean dashboard views
import { useState, useRef, useEffect, useMemo } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useLoginMutation } from './hooks/useUsers';
import type { User } from './hooks/useUsers';
import {
  useGetChatsQuery,
  useCreateChatMutation,
  useJoinChatMutation,
  useSendMessageMutation,
  useGetChatMessagesQuery,
} from './hooks/useChats';
import type { Chat } from './hooks/useChats';

import './App.css';

import { AuthForm } from './components/AuthForm/AuthForm';
import { SidebarHeader } from './components/SidebarHeader/SidebarHeader';
import { CreateChatBar } from './components/CreateChatBar/CreateChatBar';
import { ChatList } from './components/ChatList/ChatList';
import { ChatWindow } from './components/ChatWindow/ChatWindow';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Forms state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: usersData } = useGetUsersQuery();
  const { data: chatsData, loading: chatsLoading } = useGetChatsQuery();

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.users.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [usersData?.users]);

  const [createUser] = useCreateUserMutation();
  const [login] = useLoginMutation();
  const [createChat] = useCreateChatMutation();
  const [joinChat] = useJoinChatMutation();
  const [sendMessage] = useSendMessageMutation();

  const { data: messagesData, loading: messagesLoading, error: messagesError, refetch: refetchMessages } =
    useGetChatMessagesQuery(selectedChat?.id || '', currentUser?.id || '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.chatMessages]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await createUser({ variables: { input: { name: newUserName, email: newUserEmail, password: newUserPassword } } });
      if (res.data?.createUser) {
        setCurrentUser(res.data.createUser);
        localStorage.setItem('currentUser', JSON.stringify(res.data.createUser));
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await login({ variables: { input: { email: loginEmail, password: loginPassword } } });
      if (res.data?.login) {
        setCurrentUser(res.data.login);
        localStorage.setItem('currentUser', JSON.stringify(res.data.login));
        setLoginEmail('');
        setLoginPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await createChat({ variables: { input: { name: newChatName || undefined } } });
      if (res.data?.createChat && currentUser) {
        setNewChatName('');
        await joinChat({ variables: { input: { chatId: res.data.createChat.id, userId: currentUser.id } } });
        setSelectedChat(res.data.createChat);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create chat');
    }
  };

  const handleJoinChat = async () => {
    if (!selectedChat || !currentUser) return;
    setErrorMsg(null);
    try {
      await joinChat({ variables: { input: { chatId: selectedChat.id, userId: currentUser.id } } });
      refetchMessages();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedChat || !currentUser) return;
    setErrorMsg(null);
    const content = messageContent;
    setMessageContent('');
    try {
      await sendMessage({ variables: { input: { chatId: selectedChat.id, senderId: currentUser.id, content } } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message');
      setMessageContent(content);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedChat(null);
    setErrorMsg(null);
    setAuthMode('login');
    setShowLoginPassword(false);
    setShowSignUpPassword(false);
    localStorage.removeItem('currentUser');
  };

  const isNotParticipant = messagesError?.message?.toLowerCase().includes('not a participant') || false;
  const formatDate = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!currentUser) {
    return (
      <AuthForm
        authMode={authMode}
        setAuthMode={setAuthMode}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        handleLogin={handleLogin}
        handleCreateUser={handleCreateUser}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        newUserName={newUserName}
        setNewUserName={setNewUserName}
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserPassword={newUserPassword}
        setNewUserPassword={setNewUserPassword}
        showLoginPassword={showLoginPassword}
        setShowLoginPassword={setShowLoginPassword}
        showSignUpPassword={showSignUpPassword}
        setShowSignUpPassword={setShowSignUpPassword}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <SidebarHeader currentUser={currentUser} handleLogout={handleLogout} />
        <CreateChatBar newChatName={newChatName} setNewChatName={setNewChatName} handleCreateChat={handleCreateChat} />
        <ChatList chatsLoading={chatsLoading} chats={chatsData?.chats} selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      </div>
      <ChatWindow
        selectedChat={selectedChat}
        currentUser={currentUser}
        errorMsg={errorMsg}
        isNotParticipant={isNotParticipant}
        handleJoinChat={handleJoinChat}
        messagesLoading={messagesLoading}
        messages={messagesData?.chatMessages}
        userMap={userMap}
        messageContent={messageContent}
        setMessageContent={setMessageContent}
        handleSendMessage={handleSendMessage}
        messagesEndRef={messagesEndRef}
        formatDate={formatDate}
      />
    </div>
  );
}

export default App;
