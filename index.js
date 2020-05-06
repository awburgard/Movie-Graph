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

  input ActorInput {
    id: ID
  }

  input MovieInput {
      id: ID
      title: String
      releaseDate: Date
      rating: Int
      status: Status
      actor: [ActorInput]
  }

  type Mutation {
      addMovie(movie: MovieInput): [Movie]
  }

`;

const actors = [
    {
        id: 'williams',
        name: 'Robin Williams'
    },
    {
        id: 'garfield',
        name: 'Andrew Garfield'
    }
]

const movies = [
    {
        id: "1",
        title: "Aladdin",
        releaseDate: new Date("11-25-1992"),
        rating: 5,
        actor: [
            {
                id: "williams"
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
                id: "garfield"
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

    Movie: {
        actor: (obj, args, context) => {
            const actorId = obj.actor.map(actor => actor.id)
            const filteredActors = actors.filter(actor => {
                return actorId.includes(actor.id)
            })
            return filteredActors
        }
    },

    Mutation: {
        addMovie: (obj, { movie }, { userId }) => {
            if (userId) {
                const newMoviesList = [
                    ...movies,
                    movie
                ];
                return newMoviesList;
            }
            return movies;
        }
    },


    Date: new GraphQLScalarType({
        name: "Date",
        description: "Date returned as a string",
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
    playground: true,
    context: ({ req }) => {
        const fakeUser = {
            userId: 'user1'
        }
        return {
            ...fakeUser
        }
    }
});

server
    .listen({
        port: process.env.PORT || 4000
    })
    .then(({ url }) => {
        console.log(`Server started at ${url}`);
    });
