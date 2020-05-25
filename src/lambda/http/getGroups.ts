import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import { getAllGroups } from '../../businessLogic/group'



// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
//     console.log('Processing event: ',event);
    
//     const group = await getAllGroups()

//     return{
//         statusCode:201,
//         headers:{
//             'Access-Control-Allow-Origin' :'*'
//         },
//         body: JSON.stringify({
//             group
//         })
//     }
// }

//---------------code for expres to serverless----------------------------------------------------------

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'

const app = express()

app.get('/groups', async (req,res)=>{
    const group = await getAllGroups()
    res.json({
        items: group
    })
})

const server = awsServerlessExpress.createServer(app)
exports.handler =(event, context) => {
    awsServerlessExpress.proxy(server, event, context)
}  

