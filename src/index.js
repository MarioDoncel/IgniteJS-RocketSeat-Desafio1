const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');
const { use } = require('express/lib/application');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(user=>user.username == username)
  if(!user)return res.status(404).json({error:'User not found'})

  response.locals.user = user
  next()
}


app.post('/users', (request, response) => {
  const {name, username} = request.body
  const user = {
    id:uuidv4(), 
    name,
    username,
    todos: []
  }
  const usernameAlreadyExists = users.some(({username})=> user.username == username)
  if(usernameAlreadyExists) return response.status(400).json({error:'Username already exists'})

  users.push(user)
  response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = response.locals
  response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = response.locals
  const {title, deadline} = request.body

  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  user.todos.push(todo)

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = response.locals
  const {title, deadline} = request.body
  const {id} = request.params
  
  const todo = user.todos.find(todo=> todo.id == id)
  
  if(!todo)return response.status(404).json({error:'Todo not found'})
  todo.title = title
  todo.deadline = new Date(deadline)

  response.status(200).json( todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = response.locals
  const {id} = request.params
  
  const todo = user.todos.find(todo=> todo.id == id)
  
  if(!todo)return response.status(404).json({error:'Todo not found'})
  todo.done = true

  response.status(200).json( todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   const {user} = response.locals
  const {id} = request.params
  
  const todo = user.todos.find(todo=> todo.id == id)
  
  if(!todo)return response.status(404).json({error:'Todo not found'})
  user.todos = user.todos.filter(todo=> todo.id != id)

  response.status(204).json()
});

module.exports = app;