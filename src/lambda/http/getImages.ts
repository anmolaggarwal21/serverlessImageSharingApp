import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk'



const docClient = new AWS.DynamoDB.DocumentClient()

const imageTable = process.env.IMAGE_TABLE
const groupTable = process.env.GROUP_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ',event);
    const groupId = event.pathParameters.groupId;
    const groupIdExist = await validateGroup(groupId);
    if (groupIdExist){
    
        const items = await getImagesPerGroup(groupId);
        return{
            statusCode:200,
            headers:{
                'Access-Control-Allow-Origin' :'*'
            },
            body : JSON.stringify({ items} )
        }
    }

    else{
        return {
            statusCode:400,
            headers:{
                'Access-Control-Allow-Origin':'*'
            },
            body: "Invalid Request"
        }
    }

    

}

async function validateGroup(groupId: any)  {

   const group = await docClient.get({
        TableName: groupTable,
        Key:{
            id: groupId
        }
    }).promise()

    return !!group;
}

async function getImagesPerGroup(groupID: string){

    const result = await docClient.query({
        TableName: imageTable,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues:{
            ':groupId' : groupID
        },
        ScanIndexForward: false
    }).promise()

    return result.Items
}