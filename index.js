require('dotenv').config()
const { ApolloServer, gql, PubSub } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true });
const db = mongoose.connection;

const moiveSchema = new mongoose.Schema({
    title: String,
    releaseDate: Date,
    rating: Number,
    status: String,
    actorIds: [String]
});

var Movie = mongoose.model('Movie', moiveSchema);


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

  type Subscription {
    movieAdded: Movie
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

const pubsub = new PubSub();
const MOVIE_ADDED = 'MOVIE_ADDED'

const resolvers = {
    Subscription: {
        movieAdded: {
            subscribe: () => pubsub.asyncIterator([MOVIE_ADDED])
        }
    },

    Query: {
        movies: async () => {
            try {
                const allMovies = await Movie.find()
                return allMovies;
            } catch (e) {
                console.log(`error: ${e}`)
                return []
            }
        },

        movie: async (obj, { id }) => {
            try {
                const foundMovie = await Movie.findById(id)
                return foundMovie;
            } catch (e) {
                console.log(`error: ${e}`)
                return {}
            }
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
        addMovie: async (obj, { movie }, { userId }) => {
            try {
                if (userId) {
                    const newMoive = await Movie.create({
                        ...movie
                    })
                    pubsub.publish(MOVIE_ADDED, { movieAdded: newMoive })
                    const allMovies = await Movie.find()
                    return allMovies;
                }
                return movies;
            } catch (e) {
                console.log(`error: ${e}`)
                return []
            }
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

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('DB connected')
    server
        .listen({
            port: process.env.PORT || 4000
        })
        .then(({ url }) => {
            console.log(`Server started at ${url}`);
        });
});
