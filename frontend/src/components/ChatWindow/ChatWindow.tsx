import React, { useLayoutEffect, useRef } from 'react';
import type { Chat, Message } from '../../hooks/useChats';
import type { User } from '../../hooks/useUsers';
import './ChatWindow.css';

interface ChatWindowProps {
  selectedChat: Chat | null;
  currentUser: User;
  errorMsg: string | null;
  isNotParticipant: boolean;
  handleJoinChat: () => void;
  messagesLoading: boolean;
  messages: Message[];
  userMap: Map<string, string>;
  messageContent: string;
  setMessageContent: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  formatDate: (isoString: string) => string;
  onLoadMore: () => Promise<void>;
  loadingMore: boolean;
  hasMore: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedChat,
  currentUser,
  errorMsg,
  isNotParticipant,
  handleJoinChat,
  messagesLoading,
  messages,
  userMap,
  messageContent,
  setMessageContent,
  handleSendMessage,
  messagesEndRef,
  formatDate,
  onLoadMore,
  loadingMore,
  hasMore,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMore && !loadingMore && messages.length > 0) {
      prevScrollHeightRef.current = target.scrollHeight;
      onLoadMore();
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container && prevScrollHeightRef.current !== null) {
      container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  if (!selectedChat) {
    return (
      <div className="chat-empty">
        <h2>Select or Create a Chat Session</h2>
        <p>Pick a chat from the sidebar or type a room name to create a new one.</p>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{selectedChat.name || `Chat Room`}</h3>
          <p>ID: {selectedChat.id}</p>
        </div>
        <div className="chat-header-actions">
          {!isNotParticipant && <span className="live-indicator">Connected live</span>}
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner-alert">
          {errorMsg}
        </div>
      )}

      {isNotParticipant ? (
        <div className="chat-empty-view">
          <div className="join-chat-banner">
            <p>You need to join this chat session to read and write messages.</p>
            <button className="btn-primary chat-join-button-custom" onClick={handleJoinChat}>
              Join Chat Room
            </button>
          </div>
          <div className="chat-empty">
            <p>Joined participants can view messages.</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="messages-scroller" onScroll={handleScroll}>
            {loadingMore && (
              <div className="chat-messages-loader-more">
                <span className="status-dot animate-pulse"></span>
                <span>Loading older history...</span>
              </div>
            )}
            {messagesLoading && (!messages || messages.length === 0) ? (
              <p className="chat-messages-loader">Loading messages...</p>
            ) : !messages || messages.length === 0 ? (
              <p className="chat-messages-empty">No messages yet. Send one to start the conversation!</p>
            ) : (
              messages?.map((msg: Message) => {
                const isSentByMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                    <span className="message-sender">
                      {isSentByMe ? 'You' : (userMap.get(msg.senderId) || `User (${msg.senderId.substring(0, 5)})`)}
                    </span>
                    <div className="message-bubble">{msg.content}</div>
                    <div className="message-info">
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-bar">
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input type="text" placeholder="Type a message..." className="input-field" value={messageContent} onChange={(e) => setMessageContent(e.target.value)} required />
              <button type="submit" className="btn-primary" title="Send Message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
