const { ApolloServer, gql } = require('apollo-server');

// Schema is the shape of the data
const typeDefs = gql`
    
    type Pokemon {
        name: String
        moves: [String]
        abilities: [String]
    }

    type Query {
        pokemons: [Pokemon]
    }

`;

const pokemon = [
    {
        name: 'Pikachu',
        moves: ['Lightning Strike', 'Shock'],
        abilities: ['Loveable'],
    },
    {
        name: 'Bulbasaur',
        moves: ['Vine Whip', 'Grass Attack'],
        abilities: ['Cutie Pie'],
    },
]


const resolvers = {
    Query: {
        pokemons: () => {
            return pokemon
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
    console.log(`Server started  at ${url}`)
})