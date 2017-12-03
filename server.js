const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');

//middleware 
//output at localhost:4000/graphql
app.use('/graphql', expressGraphQL({
    schema,
    graphiql:true
}));

app.listen(4000, ()=>{
    console.log('listeneing');
});