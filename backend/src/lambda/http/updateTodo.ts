import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS  from 'aws-sdk'

import * as AWSXRay from 'aws-xray-sdk'

import { parseUserId } from '../../auth/utils'

const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)
    const updTodoItem = {
    
      "userId": userId,
      "todoId": todoId
    }
    const newTodoVal = {
    
      "name": updatedTodo.name,
      "dueDate": updatedTodo.dueDate,
      "done": updatedTodo.done
    }
    await docClient.update({
      TableName: todosTable,
      Key: updTodoItem,
      ExpressionAttributeValues:newTodoVal
    }).promise()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        newTodoVal
      })
    }


  //return undefined
}
