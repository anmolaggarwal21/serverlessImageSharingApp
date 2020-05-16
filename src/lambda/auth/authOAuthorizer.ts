import {CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
import {JwtToken} from '../../auth/JwtToken'
import * as AWS from 'aws-sdk'
import {verify} from 'jsonwebtoken'

const auth0secret = process.env.AUTH_0_SECRET
const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager()
let cachedSecret: string 

export const handler: CustomAuthorizerHandler = async (event : CustomAuthorizerEvent) : Promise<CustomAuthorizerResult> => {
    try{
     const decoded =   await  verifyToken(event.authorizationToken)
        console.log('User was authroized')

        return{
            principalId: decoded.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'

                    }

                ]
            }

        }
    }
    catch(error){
        console.log('User was not authroized')

        return{
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'

                    }

                ]
            }

        }

    }

}

async function verifyToken (authHeader: string) : Promise< JwtToken>{
    console.log(authHeader)
    if(!authHeader){
        console.log('inside first array')
        throw new Error('No authorization header') 
    }

    if(!authHeader.toLowerCase().startsWith('bearer')){
        console.log('inside second array')
        throw new Error('Invalid Authorization Header') 
    }

    const split = authHeader.split(' ')
    const token = split[1]
    const secretObject : any = await getSecret()
    const secret = secretObject[secretField]

  //  we are using this in case we stor the secret in the environment variable return  verify(token, auth0secret) as JwtToken
  return  verify(token, secret) as JwtToken    

}

async function getSecret(){
    if(cachedSecret) return cachedSecret

    const data = await client.getSecretValue({
        SecretId: secretId
    }).promise()

    cachedSecret = data.SecretString

    return JSON.parse(cachedSecret)

}

