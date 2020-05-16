import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()

const connectionTable = process.env.CONNECTION_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ',event);

    const connectionId = event.requestContext.connectionId
     
    const item= {
        id: connectionId,
        timestamp: new Date().toISOString()
    }
    
    await docClient.put({
        TableName: connectionTable,
        Item: item 
    }).promise()
    

    return{
        statusCode:200,
        headers:{
            'Access-Control-Allow-Origin' :'*'
        },
        body : ''
        }

    

}
