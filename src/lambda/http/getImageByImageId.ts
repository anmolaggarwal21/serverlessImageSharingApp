import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import  *  as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)


const docClient = new XAWS.DynamoDB.DocumentClient()

const imageTable = process.env.IMAGE_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ',event);
    const imageId = event.pathParameters.imageId
    
    const result = await docClient.query({
        TableName: imageTable,
        IndexName: imageIdIndex,
        KeyConditionExpression: 'imageId = :imageId',
        ExpressionAttributeValues:{
            ':imageId' : imageId
        },
        ScanIndexForward: false
    }).promise()

     if(result.Count != 0){
        return{
            statusCode:200,
            headers:{
                'Access-Control-Allow-Origin' :'*'
            },
            body : JSON.stringify(result.Items[0] )
        }
    }
    else{
        return {
            statusCode:401,
            headers:{
                'Access-Control-Allow-Origin' :'*'
            },
            body : 'No image with given Id present'
        }
    }
   
    

}


