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

// using the certificate in case we want to use certificate type of token
const certificate =`-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJc0995are579uMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1uMW92eng3dy5hdXRoMC5jb20wHhcNMjAwNTE2MTAxMTI3WhcNMzQw
MTIzMTAxMTI3WjAhMR8wHQYDVQQDExZkZXYtbjFvdnp4N3cuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwZgaZoPmbPghy5OuiDsGIq7H
pmF2Q2ndXwbbBZCyS+aysQifZXsjtNc1QhJ7HFtRTdXRXLlFfAIgb9059cI4Zu7c
g3TQl4Vf1u9OF9suczUVYJCjcQqsqSCbg5jNNPGc1/dJ4QsrmzRqRunyodjJWHMm
pZ3HtRknTepKQJ+ihVlWEyAkTblyJf6TazurBg4X5xruNWurmE746VB/OjmWcHaf
jG9ocfGgNi89zuc03hvUq1fTvNi5gR0DrchqTsOvSWsL2tVOCzmmwoakMrFn26rs
swsKhaEfl9KJic36QYgydpvY+59sztRW4Aup9RIqCf2S2+5LJLjoDDtnAJTRlQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSZVNDH3afRleHTgYFk
J6r/CdO6+jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBABoLKJ5G
JeQMixa3b6GzvjSld03FSI/kLeVgADkoaUPGxgJ8gdkmq0q/6TNWLsKbgahBxkD6
auvzDmqDMNVzTfRHfgv6Lfs1ymo+XKF2HhBotEvaos+NO8mr1QzzNDFQm7fruN14
6O+akq9qvcnhE/wa18nXTPF10XcFs8G09lwGEeVslIiNoyiyo+VzpqHfcEacevpH
D031rdGTvzVCh5qo1fV2Bvlb/qCGFltF3Y9O5NX+SS4TnTRMf1v9KvacmM58DURz
Jq4LdxmhIx1q/Jq+TeV4CwXQZ6H1JcJScZhDzZQ++2J+w8dhLByHBmP+SG+Ges6N
Fu9kex9xM26acAc=
-----END CERTIFICATE-----`
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

    // const secretObject : any = await getSecret()
    // const secret = secretObject[secretField]

  //  we are using this in case we stor the secret in the environment variable return  verify(token, auth0secret) as JwtToken
 // we use this for verifying when we use secrets  return  verify(token, auth0secret) as JwtToken  
  
  return  verify(token, certificate, { algorithms : ['RS256'] }) as JwtToken  

}

async function getSecret(){
    if(cachedSecret) return cachedSecret

    const data = await client.getSecretValue({
        SecretId: secretId
    }).promise()

    cachedSecret = data.SecretString

    return JSON.parse(cachedSecret)

}

