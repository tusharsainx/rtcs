// AI-generated: Custom hooks encapsulating Apollo GraphQL user operations with routing context
import { gql, useQuery, useMutation } from '@apollo/client';

export interface User {
  id: string;
  name: string;
  email: string;
}

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

const LOGIN_USER = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      id
      name
      email
    }
  }
`;

export function useGetUsersQuery() {
  return useQuery<{ users: User[] }>(GET_USERS, {
    context: { service: 'user' },
  });
}

export function useCreateUserMutation() {
  return useMutation<{ createUser: User }, { input: { name: string; email: string; password: string } }>(
    CREATE_USER,
    {
      context: { service: 'user' },
      refetchQueries: [{ query: GET_USERS, context: { service: 'user' } }],
    }
  );
}

export function useLoginMutation() {
  return useMutation<{ login: User }, { input: { email: string; password: string } }>(
    LOGIN_USER,
    {
      context: { service: 'user' },
      refetchQueries: [{ query: GET_USERS, context: { service: 'user' } }],
    }
  );
}
