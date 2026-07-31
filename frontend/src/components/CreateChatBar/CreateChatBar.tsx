import React from 'react';
import './CreateChatBar.css';

interface CreateChatBarProps {
  newChatName: string;
  setNewChatName: (val: string) => void;
  handleCreateChat: (e: React.FormEvent) => void;
}

export const CreateChatBar: React.FC<CreateChatBarProps> = ({
  newChatName,
  setNewChatName,
  handleCreateChat,
}) => {
  return (
    <div className="chat-actions">
      <form onSubmit={handleCreateChat} className="create-chat-form">
        <input
          type="text"
          placeholder="Create chat room..."
          className="input-field"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          required
        />
        <button type="submit" className="btn-icon" title="Create Room">
          +
        </button>
      </form>
    </div>
  );
};
