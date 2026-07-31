// AI-generated: Apollo Client config with custom routing link routing User vs Chat service requests
import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Read env variables (defaulting to localhost:8000 Nginx path routing)
const userServiceUrl = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8000/user-service/graphql';
const chatServiceUrl = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:8000/chat-service/graphql';
const chatServiceWsUrl = import.meta.env.VITE_CHAT_SERVICE_WS_URL || 'ws://localhost:8000/chat-service/graphql';

// Create HTTP Links for both services
const userHttpLink = new HttpLink({ uri: userServiceUrl });
const chatHttpLink = new HttpLink({ uri: chatServiceUrl });

// Create WebSocket Link for subscriptions (exclusively in chat-service)
const chatWsLink = new GraphQLWsLink(
  createClient({
    url: chatServiceWsUrl,
  })
);

// Custom routing link
const routingLink = new ApolloLink((operation, forward) => {
  const context = operation.getContext();
  // Check if operation context specifies 'user' service
  if (context.service === 'user') {
    return userHttpLink.request(operation, forward);
  }
  // Otherwise, default to chat service HTTP link
  return chatHttpLink.request(operation, forward);
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      (definition.operation === 'subscription' ||
        (definition.operation === 'query' && definition.name?.value === 'GetChatServiceInstance'))
    );
  },
  chatWsLink, // routes subscriptions & GetChatServiceInstance query to WebSocket
  routingLink  // routes other queries & mutations
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
