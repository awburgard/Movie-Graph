const { ApolloServer, gql } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

const typeDefs = gql`
  scalar Date

  enum Status {
    WATCHED
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  type Actor {
    id: ID!
    name: String!
  }

  type Movie {
    id: ID!
    title: String!
    releaseDate: Date
    rating: Int
    status: Status
    actor: [Actor]
  }

  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }
`;

const movies = [
    {
        id: "1",
        title: "Aladdin",
        releaseDate: new Date("11-25-1992"),
        rating: 5,
        actor: [
            {
                id: "1",
                name: "Robin Williams"
            }
        ]
    },
    {
        id: "2",
        title: "Hacksaw Ridge",
        releaseDate: new Date("11-04-2016"),
        rating: 5,
        actor: [
            {
                id: "1",
                name: "Andrew Garfield"
            }
        ]
    }
];

const resolvers = {
    Query: {
        movies: () => {
            return movies;
        },

        movie: (obj, { id }, context, info) => {
            const foundMovie = movies.find(movie => {
                return movie.id === id;
            });
            return foundMovie;
        }
    },
    Date: new GraphQLScalarType({
        name: "Date",
        description: "it's a date, deal with it",
        parseValue(value) {
            // value from the client
            return new Date(value);
        },
        serialize(value) {
            // value sent to the client
            return value.getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value);
            }
            return null;
        }
    })
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true
});

server
    .listen({
        port: process.env.PORT || 4000
    })
    .then(({ url }) => {
        console.log(`Server started at ${url}`);
    });
