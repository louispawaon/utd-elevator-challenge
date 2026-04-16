import Elevator from '../../elevator.js'
import Person from '../../person.js'




function snapshot(elevator) {
  return {
    currentFloor: elevator.currentFloor,
    stops: elevator.stops,
    floorsTraversed: elevator.floorsTraversed,
    requests: elevator.requests.map((p) => ({
      name: p.name,
      currentFloor: p.currentFloor,
      dropOffFloor: p.dropOffFloor,
    })),
    riders: elevator.riders.map((p) => ({
      name: p.name,
      currentFloor: p.currentFloor,
      dropOffFloor: p.dropOffFloor,
    })),
  }
}


export function collectTimeline(elevator, mode) {
  const steps = []
  steps.push(snapshot(elevator))
  elevator.onStep = () => {
    steps.push(snapshot(elevator))
  }
  try {
    if (mode === 'fifo') {
      elevator.dispatch()
    } else {
      elevator.dispatchEfficient()
    }
  } finally {
    elevator.onStep = null
  }
  return steps
}


export function runSimulation(opts) {
  const e = new Elevator()
  if (opts.useLobbyClock) {
    e.checkReturnToLoby = Elevator.prototype.checkReturnToLoby.bind(e)
    e.getHour = Elevator.prototype.getHour.bind(e)
  } else {
    e.checkReturnToLoby = () => false
  }
  e.requests = opts.requests.map((r) => new Person(r.name, r.currentFloor, r.dropOffFloor))
  e.riders = opts.riders.map((r) => new Person(r.name, r.currentFloor, r.dropOffFloor))
  return collectTimeline(e, opts.mode)
}
