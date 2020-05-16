import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

const groupTable = process.env.GROUP_TABLE
const imageTable = process.env.IMAGE_TABLE
const bucket_name = process.env.IMAGES_S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)

const s3= new AWS.S3({
    signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ',event);
    
    const groupId = event.pathParameters.groupId;

    var groupExist = await validateGroup(groupId);
    if(groupExist){
        const imageID = uuid.v4();
        const timestamp = new Date().toISOString();
        const parsedBody = JSON.parse(event.body);

        const newItem ={
            imageID: imageID,
            groupId : groupId,
            timestamp: timestamp,
            imageUrl: `https://${bucket_name}.s3.amazonaws.com/${imageID}`,
            ...parsedBody

        }

        await docClient.put({
            TableName : imageTable,
            Item: newItem
        }).promise();

        const url = getUploadURL(imageID)
        return{
            statusCode:201,
            headers:{
                'Access-Control-Allow-Origin' :'*'
            },
            body: JSON.stringify({
                newItem: newItem,
                uploadUrl : url
            })
        }
    }

    else{
        return{
            statusCode:400,
            headers:{
                'Access-Control-Allow-Origin' :'*'
            },
            body: 'Group Id is not valid'
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

  function getUploadURL(imageId : string){
      return s3.getSignedUrl('putObject', {
          Bucket: bucket_name,
          Key: imageId,
          Expires: urlExpiration
      })
    }




