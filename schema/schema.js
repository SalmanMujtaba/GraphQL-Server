const graphql = require('graphql');
const axios = require('axios');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
    name:'Company',
    fields: ()=>({
        id:{type: GraphQLString},
        name:{type: GraphQLString},
        description:{type: GraphQLString},
        users:{
            type: new GraphQLList(UserType),        
            resolve(parentValue, args){
                //get the list of users of the company
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                .then(resp=>resp.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: {type: GraphQLString},
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        company: {
            type: CompanyType,
            //companyId is resolved to the company object from our json web server
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                .then(resp=>resp.data);
            }
        }
    }
}); 

//Root of the graph
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields:()=>({
        user:{
            type: UserType,
            args: {id: { type: GraphQLString}},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/users/${args.id}`)
                .then(resp=>resp.data);
            }
        },
        //get the company details that is set root as company and not user
        company:{
            type: CompanyType,
            args: {id: { type: GraphQLString}},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(resp=>resp.data);
            }
        } 
    })
});

const mutation = new GraphQLObjectType({
    name:'Mutation',
    fields: {
        addUser:{
            type: UserType,
            args: {
                firstName: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
                companyId: {type: GraphQLString}
            },
            resolve(parentValue, {firstName, age})
            {
                return axios.post('http://localhost:3000/users',{firstName, age})
                .then(res=>res.data);
            }
        },
        deleteUser:{
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args){
                return axios.delete(`http://localhost:3000/users/${args.id}`)
                .then(res=>res.data);
            }
        },
        editUser:{
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName: {type: GraphQLString},
                age: {type: GraphQLInt}
            },
            resolve(parentValue, args)
            { 
                return axios.patch(`http://localhost:3000/users/${args.id}`,args)
                .then(res=>res.data);
            }
        }
    }
});
 
//return the schema basically
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
}); 
