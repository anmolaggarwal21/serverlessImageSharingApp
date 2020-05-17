import * as uuid from 'uuid'

import {Group} from '../models/group'
import {GroupAccess} from '../dataLayer/groupAccess'
import { CreateGroupRequest } from '../requests/CreateGroupRequests'

import {decode} from 'jsonwebtoken'
import { JwtToken } from '../auth/JwtToken'

const groupAccess = new GroupAccess()

export async function getAllGroups(): Promise<Group[]>{
    return groupAccess.getAllGroups()
}

export async function createGroup(
    createGroupRequest: CreateGroupRequest,
    jwtToken: string
 ): Promise<Group>{
        console.log('inside cdreate group of business logic')
    const itemId = uuid.v4()
    const userIdToken = decode(jwtToken) as JwtToken
    const userId= userIdToken.sub

    //const userId = 

    return await groupAccess.createGroup({
        id: itemId,
        userId : userId,
        name: createGroupRequest.name,
        description : createGroupRequest.description

    })
 }


