const { ApolloServer, gql } = require('apollo-server');

// Schema is the shape of the data
const typeDefs = gql`

    enum Status {
        CAUGHT
        NOT_CAUGHT
        SEEN
        NOT_SEEN
    }

    type Characteristics {
        id: ID!
        gene_modulo: Int
        possible_values: [Int]
    }
    
    type Pokemon {
        id: ID!
        name: String
        moves: [String]
        abilities: [String]
        characteristics: Characteristics
        status: Status
    }

    type Query {
        pokemons: [Pokemon]
        pokemon(id: ID): Pokemon
    }

`;

const pokemonArray = [
    {
        id: 1,
        name: 'Pikachu',
        moves: ['Lightning Strike', 'Shock'],
        abilities: ['Loveable'],
        status: 'CAUGHT'
    },
    {
        id: 2,
        name: 'Bulbasaur',
        moves: ['Vine Whip', 'Grass Attack'],
        abilities: ['Cutie Pie'],
    },
]


const resolvers = {
    Query: {
        pokemons: () => {
            return pokemonArray
        },
        pokemon: (obj, { id }, context, info) => {
            const foundPokemon = pokemonArray.find((pokemon) => {
                return pokemon.id == id
            })
            return foundPokemon
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers, introspection: true, playground: true })

server.listen({
    port: process.env.PORT || 4000
}).then(({ url }) => {
    console.log(`Server started  at ${url}`)
})