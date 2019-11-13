import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as uuid from 'uuid'

import { parseUserId } from '../../auth/utils'

import { TodoAccess } from '../../dataLayer/todoAccess'

const todoAccess = new TodoAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const todoId = uuid.v4()

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newTodoItem = {

    todoId: todoId,
    userId: parseUserId(jwtToken),
    createdAt: new Date().toISOString(),
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    done: false
    
  }

  const createdTodoItem = await todoAccess.createTodo( newTodoItem )
  // TODO: Implement creating a new TODO item
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(
      
      {
        item: createdTodoItem
      }
    )
  }
}
