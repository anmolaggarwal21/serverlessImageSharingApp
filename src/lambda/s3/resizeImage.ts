import { SNSEvent, S3Event, SNSHandler} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
//import * as Jimp from 'jimp'
var Jimp = require('jimp');



const originalBucketName = process.env.IMAGES_S3_BUCKET
const resizedBucketName = process.env.RESIZEIMAGES_S3_BUCKET

 var key: string
const s3= new AWS.S3({
    signatureVersion: 'v4'
})


export const handler: SNSHandler= async (event: SNSEvent)=>{
    console.log('Processing SNS event', JSON.stringify(event))
    for (const snsRecord of event.Records){
        const s3EventStr = snsRecord.Sns.Message
        console.log('Processing S3 Event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)
        await processingImage(s3Event)

    }
}


async function processingImage ( s3event: S3Event)  {

  
for(const record of s3event.Records){
    key = record.s3.object.key
    console.log("Processing S3 item with key:", key)
}
try{
const response = await s3.getObject({
    Bucket: originalBucketName , 
    Key: key 
}).promise()
console.log(response.ContentType)
const body = response.Body
//var file = new Buffer(response.Body, 'binary');
console.log(body)
const image = await Jimp.read(body)
console.log(image);
image.resize(150, Jimp.AUTO)
const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

await s3
  .putObject({
    Bucket: resizedBucketName,
    Key: `${key}.jpeg`,
    Body: convertedBuffer
  }).promise()
}
catch(e){
    console.log(JSON.stringify(e))
}

}



