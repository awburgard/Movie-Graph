const { ApolloServer, gql } = require('apollo-server');

// Schema is the shape of the data
const typeDefs = gql`
    
    type Pokemon {
        name: String
        moves: Array
        abilities: Array
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