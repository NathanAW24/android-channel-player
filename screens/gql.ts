import { GraphQLClient, gql } from 'graphql-request';
console.log(process.env.GRAPHQL_ENDPOINT);
export const gqlclient = new GraphQLClient(
  'https://adswift-nest-backend-enotcrv3ia-as.a.run.app/graphql',
  {
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpb3RfdGFibGV0IiwibmFtZSI6IklPVCBUQUJMRVQiLCJpYXQiOjE1MTYyMzkwMjJ9.owjYVDb4YpQNhLCUyQsNy-yCaLiKI5NjZv867g0D7NA',
    },
  }
);
