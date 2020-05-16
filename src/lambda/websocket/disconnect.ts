import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()

const connectionTable = process.env.CONNECTION_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ',event);

    const connectionId = event.requestContext.connectionId
    const deleteItem = {
        TableName: connectionTable,
        Key: { id: connectionId }
    }
    
    await docClient.delete(deleteItem).promise()
    

    return{
        statusCode:200,
       
        body : ''
        }

    

}
