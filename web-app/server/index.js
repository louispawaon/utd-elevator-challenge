import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import requestsRouter from './routes/requests.js'
import ridersRouter from './routes/riders.js'
import * as store from './store.js'
import { runSimulation } from './simulation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..', '..')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.use('/api/requests', requestsRouter)
app.use('/api/riders', ridersRouter)

app.post('/api/simulate', (req, res) => {
  const mode = req.body?.mode === 'efficient' ? 'efficient' : 'fifo'
  const useLobbyClock = Boolean(req.body?.useLobbyClock)
  const reqRows = store
    .listRequests()
    .map(({ name, currentFloor, dropOffFloor }) => ({ name, currentFloor, dropOffFloor }))
  const ridRows = store
    .listRiders()
    .map(({ name, currentFloor, dropOffFloor }) => ({ name, currentFloor, dropOffFloor }))
  const steps = runSimulation({
    mode,
    useLobbyClock,
    requests: reqRows,
    riders: ridRows,
  })
  const last = steps[steps.length - 1]
  store.syncFromSnapshot({
    requests: last.requests,
    riders: last.riders,
  })
  res.json({ steps })
})

app.post('/api/reset', (_req, res) => {
  store.reset()
  res.status(204).end()
})

app.use(express.static(path.join(__dirname, '../public')))

app.get('/vendor/elevator.js', (_req, res) => {
  res.type('application/javascript')
  res.sendFile(path.join(repoRoot, 'elevator.js'))
})

app.get('/vendor/person.js', (_req, res) => {
  res.type('application/javascript')
  res.sendFile(path.join(repoRoot, 'person.js'))
})

app.listen(port, () => {
  console.log(`Elevator visualization: http://localhost:${port}`)
})
