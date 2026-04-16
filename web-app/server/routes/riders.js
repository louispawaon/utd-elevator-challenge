import { Router } from 'express'
import * as store from '../store.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(store.listRiders())
})

router.delete('/', (_req, res) => {
  store.clearRiders()
  res.status(204).end()
})

router.get('/:id', (req, res) => {
  const row = store.getRider(req.params.id)
  if (!row) {
    res.status(404).json({ error: 'Rider not found' })
    return
  }
  res.json(row)
})

router.post('/', (req, res) => {
  const err = store.validationErrorForPersonFields(req.body)
  if (err) {
    res.status(400).json({ error: err })
    return
  }
  const { name, currentFloor, dropOffFloor } = req.body
  const row = store.createRider({
    name: String(name).trim(),
    currentFloor,
    dropOffFloor,
  })
  res.status(201).json(row)
})

router.put('/:id', (req, res) => {
  const cur = store.getRider(req.params.id)
  if (!cur) {
    res.status(404).json({ error: 'Rider not found' })
    return
  }
  const merged = {
    name: req.body.name ?? cur.name,
    currentFloor: req.body.currentFloor ?? cur.currentFloor,
    dropOffFloor: req.body.dropOffFloor ?? cur.dropOffFloor,
  }
  const err = store.validationErrorForPersonFields(merged)
  if (err) {
    res.status(400).json({ error: err })
    return
  }
  const updated = store.updateRider(req.params.id, {
    name: String(merged.name).trim(),
    currentFloor: merged.currentFloor,
    dropOffFloor: merged.dropOffFloor,
  })
  res.json(updated)
})

router.patch('/:id', (req, res) => {
  const cur = store.getRider(req.params.id)
  if (!cur) {
    res.status(404).json({ error: 'Rider not found' })
    return
  }
  const patch =  (req.body)
  const merged = {
    name: patch.name !== undefined ? patch.name : cur.name,
    currentFloor: patch.currentFloor !== undefined ? patch.currentFloor : cur.currentFloor,
    dropOffFloor: patch.dropOffFloor !== undefined ? patch.dropOffFloor : cur.dropOffFloor,
  }
  const err = store.validationErrorForPersonFields(merged)
  if (err) {
    res.status(400).json({ error: err })
    return
  }
  const updated = store.updateRider(req.params.id, {
    name: String(merged.name).trim(),
    currentFloor: merged.currentFloor,
    dropOffFloor: merged.dropOffFloor,
  })
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  const ok = store.deleteRider(req.params.id)
  if (!ok) {
    res.status(404).json({ error: 'Rider not found' })
    return
  }
  res.status(204).end()
})

export default router
