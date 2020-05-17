import  { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import { getAllGroups } from '../../businessLogic/group'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent ) : Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ',event);
    
    const group = await getAllGroups()

    return{
        statusCode:201,
        headers:{
            'Access-Control-Allow-Origin' :'*'
        },
        body: JSON.stringify({
            group
        })
    }
}
