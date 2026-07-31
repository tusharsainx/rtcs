import React from 'react';
import type { Chat } from '../../hooks/useChats';
import './ChatList.css';

interface ChatListProps {
  chatsLoading: boolean;
  chats: Chat[] | undefined;
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chatsLoading,
  chats,
  selectedChat,
  onSelectChat,
}) => {
  return (
    <div className="chats-list-container">
      <h4 className="chats-list-title">Active Chats</h4>
      {chatsLoading ? (
        <p className="chat-join-badge-wrapper">Loading chats...</p>
      ) : chats && chats.length === 0 ? (
        <p className="chat-join-badge-empty">
          No chats yet. Create one above!
        </p>
      ) : (
        <div className="chats-list">
          {chats?.map((chat: Chat) => (
            <div
              key={chat.id}
              className={`chat-list-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-item-info">
                <span className="chat-item-name">
                  {chat.name || `Chat Session ${chat.id.substring(0, 5)}`}
                </span>
                <span className="chat-item-date">
                  Created {new Date(chat.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="join-badge">Open</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
