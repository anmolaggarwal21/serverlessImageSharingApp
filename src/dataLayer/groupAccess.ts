import {Group } from '../models/group'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';

import  *  as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
export class GroupAccess{

    private readonly docClient: DocumentClient  = createDynamoDBClient()
    private readonly groupsTable = process.env.GROUP_TABLE
    constructor (){
       
    }
    

    async getAllGroups(): Promise<Group[]> {
        console.log('Getting all groups')

        const result = await this.docClient.scan({
            TableName: this.groupsTable
        }).promise()

        const items = result.Items
        return items as Group[]
    }

    async createGroup (group: Group): Promise<Group> {
        console.log(`Creating a group with id ${group.id}`)

        await this.docClient.put({
            TableName: this.groupsTable,
            Item: group
        }).promise()

        return group

    }
}
function createDynamoDBClient (){
    console.log(' process enc value is '+ process.env.IS_OFFLINE)
    if(process.env.IS_OFFLINE == 'true'){
        console.log('Creating a local dynamo db instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint : 'http://localhost:8000'
        })
    }
    else{
        return new XAWS.DynamoDB.DocumentClient();
    }
    }




