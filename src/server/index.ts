import express from 'express'
import { remultExpress } from "remult/remult-express";
import { Task } from '../shared/task';
import { TasksController } from '../shared/TasksController';
import { createPostgresConnection } from "remult/postgres";

const app = express()

//#region auth
import session from 'cookie-session'
import type { UserInfo } from 'remult'

app.use('/api', session({ secret: process.env['SESSION_SECRET'] || 'my secret' }))

export const validUsers: UserInfo[] = [
  { id: '1', name: 'Jane',roles:["admin"] },
  { id: '2', name: 'Steve' },
]
app.use(express.json())
app.post('/api/signIn', (req, res) => {
  const user = validUsers.find((user) => user.name === req.body.username)
  if (user) {
    req.session!['user'] = user
    res.json(user)
  } else {
    res.status(404).json("Invalid user, try 'Steve' or 'Jane'")
  }
})

app.post('/api/signOut', (req, res) => {
  req.session!['user'] = null
  res.json('signed out')
})

app.get('/api/currentUser', (req, res) =>
  res.json(req.session!['user'])
)
//#endregion

app.use(remultExpress({
  getUser:req=>req.session!["user"],
  entities:[Task],
  controllers:[TasksController],
  dataProvider:createPostgresConnection({
    connectionString:process.env["DATABASE_URL"]|| "postgres://postgres:MASTERKEY@localhost/postgres"
  })
}))
const frontendFiles = process.cwd() + '/dist/angular-todo'
app.use(express.static(frontendFiles))
app.get('/*', (_, res) => {
  res.sendFile(frontendFiles + '/index.html')
})

app.listen(process.env['PORT'] || 3002, () => console.log('Server started'))
