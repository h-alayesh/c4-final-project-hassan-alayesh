import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/Todoitem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
    ) {
  }

  async getTodos(userId): Promise<TodoItem[]> {
    const todosIndex = process.env.TODOS_INDEX
    console.log('Getting all Todos for user', userId)

    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async deleteTodo(todoId): Promise<void> {
  const delTodoItem = {

    "todoId": todoId
  }
  await this.docClient.delete({
    TableName: this.todosTable,
    Key: delTodoItem 
  }).promise()

}

async generateUploadUrl(todoId, imageId): Promise<String> {
    const bucketName = process.env.TODOS_IMAGES_S3_BUCKET
    const urlExpiration = 300
    const s3 = new XAWS.S3({
        signatureVersion: 'v4'
      })
  await this.docClient.update({
    TableName: this.todosTable,
    Key: {
  
      "todoId": todoId
    },
    UpdateExpression: "set attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: {
      ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${imageId}`
    },
    ReturnValues: "UPDATED_NEW"
  }).promise()

  const url:String = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })

  return url
}

  async updateTodo(todoId, updTodoItem: TodoUpdate): Promise<void> {
    const updTodoId = {
  
        "todoId": todoId
      }
    await this.docClient.update({
        TableName: this.todosTable,
        Key: updTodoId,
        UpdateExpression: "set #nm=:nm, dueDate=:dueDate, done=:done",
        ExpressionAttributeValues: {
          ":nm": updTodoItem.name,
          ":dueDate": updTodoItem.dueDate,
          ":done": updTodoItem.done
        },
        ExpressionAttributeNames:{
          "#nm": "name"
        },
        ReturnValues: "UPDATED_NEW"
      }).promise()
  }
}




function createDynamoDBClient() {
    
    return new XAWS.DynamoDB.DocumentClient()
  }
 