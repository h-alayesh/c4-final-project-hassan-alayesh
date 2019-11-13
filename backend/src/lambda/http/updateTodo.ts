import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS  from 'aws-sdk'

import * as AWSXRay from 'aws-xray-sdk'


const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

    const updTodoItem = {
  
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
      UpdateExpression: "set #nm=:nm, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues: {
        ":nm": newTodoVal.name,
        ":dueDate": newTodoVal.dueDate,
        ":done": newTodoVal.done
      },
      ExpressionAttributeNames:{
        "#nm": "name"
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(
        undefined
      )
    }

}
