// AI-generated: Custom hooks encapsulating Apollo GraphQL chat mutations, queries, and active subscriptions with strong typing
import { gql, useQuery, useMutation } from '@apollo/client';
import { useEffect } from 'react';

export interface Chat {
  id: string;
  name?: string;
  createdAt: string;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  sequence: number;
  createdAt: string;
}

const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      name
      createdAt
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      name
      createdAt
    }
  }
`;

const JOIN_CHAT = gql`
  mutation JoinChat($input: JoinChatInput!) {
    joinChat(input: $input) {
      id
      chatId
      userId
      joinedAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      chatId
      senderId
      content
      sequence
      createdAt
    }
  }
`;

const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: ID!, $senderId: ID!, $limit: Int!, $beforeSequence: Int) {
    chatMessages(chatId: $chatId, senderId: $senderId, limit: $limit, beforeSequence: $beforeSequence) {
      id
      chatId
      senderId
      content
      sequence
      createdAt
    }
  }
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      id
      chatId
      senderId
      content
      sequence
      createdAt
    }
  }
`;

export function useGetChatsQuery() {
  return useQuery<{ chats: Chat[] }>(GET_CHATS);
}

export function useCreateChatMutation() {
  return useMutation<{ createChat: Chat }, { input: { name?: string } }>(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
  });
}

export function useJoinChatMutation() {
  return useMutation<{ joinChat: ChatParticipant }, { input: { chatId: string; userId: string } }>(JOIN_CHAT);
}

export function useSendMessageMutation() {
  return useMutation<{ sendMessage: Message }, { input: { chatId: string; senderId: string; content: string } }>(SEND_MESSAGE);
}

export function useGetChatMessagesQuery(chatId: string, senderId: string, limit = 50, beforeSequence?: number) {
  const result = useQuery<{ chatMessages: Message[] }, { chatId: string; senderId: string; limit: number; beforeSequence?: number }>(
    GET_CHAT_MESSAGES,
    {
      variables: { chatId, senderId, limit, beforeSequence },
      skip: !chatId || !senderId,
      fetchPolicy: 'network-only',
    }
  );

  const { subscribeToMore } = result;

  useEffect(() => {
    if (!chatId || !senderId || !subscribeToMore) return;

    const unsubscribe = subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      variables: { chatId },
      updateQuery: (
        prev: { chatMessages: Message[] },
        { subscriptionData }: { subscriptionData: { data: { messageAdded: Message } } }
      ) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.messageAdded;
        
        // Prevent duplicate messages
        if (prev.chatMessages.some((msg: Message) => msg.id === newMessage.id)) {
          return prev;
        }

        // Return updated list sorted by sequence
        const updatedList = [...prev.chatMessages, newMessage].sort((a, b) => a.sequence - b.sequence);
        return {
          chatMessages: updatedList,
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, senderId, subscribeToMore]);

  return result;
}
