import { SNSEvent, S3Event, SNSHandler} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'


const docClient = new AWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTION_TABLE
const stage = process.env.STAGE
const apiId= process.env.API_ID
const region = process.env.REGION 

  var key: string

const connectionsParams ={
    apiVersion : "2018-11-29",
    endpoint: `${apiId}.execute-api.${region}.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionsParams)

export const handler: SNSHandler= async (event: SNSEvent)=>{
    console.log('Processing SNS event', JSON.stringify(event))
    for (const snsRecord of event.Records){
        const s3EventStr = snsRecord.Sns.Message
        console.log('Processing S3 Event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)
        await processs3Event(s3Event)

    }
}


async function processs3Event ( s3event: S3Event)  {

    console.log("apiId is ",apiId)
for(const record of s3event.Records){
    key = record.s3.object.key
    console.log("Processing S3 item with key:", key)
}

const connections = await docClient.scan({
TableName: connectionsTable 
}).promise()

const payLoad = {
    imageId: key
}

for (const connection of connections.Items){
    const connectionId= connection.id 
    await sendNotificationToConnectedSocketUser(connectionId,payLoad)
}

}

async function sendNotificationToConnectedSocketUser(connectioId, payLoad){
    try{
        console.log("trying to send the notification to the socket user to connection Id",connectioId)
        await apiGateway.postToConnection({
            ConnectionId: connectioId,
            Data: JSON.stringify(payLoad)
        }).promise()
    }
    catch(e){
        console.log("failed to send the notification to the socket user to connection Id",connectioId)
        console.log("connection params ", connectionsParams.endpoint)
        console.log("error occured in ", JSON.stringify(e));
        if(e.statusCode === 410){
            console.log("Stale connection")

            await docClient.delete({
                TableName: connectionsTable,
                Key:{
                    id: connectioId
                }
            })
        }
    }

}

