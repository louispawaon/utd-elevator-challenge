export default class Elevator {
  constructor() {
    
    this.onStep = null
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.requests = []
    this.riders= []
  }

  dispatch(){
    while (this.requests.length) {
      this.goToFloor(this.requests[0])
    }

    if (this.checkReturnToLoby()) {
      this.returnToLoby()
    }
  }

  
  dispatchEfficient(){
    let direction = null

    const hasFloorsAbove = () => {
      const requestAbove = this.requests.some(request => request.currentFloor > this.currentFloor)
      const riderAbove = this.riders.some(rider => rider.dropOffFloor > this.currentFloor)
      return requestAbove || riderAbove
    }

    const hasFloorsBelow = () => {
      const requestBelow = this.requests.some(request => request.currentFloor < this.currentFloor)
      const riderBelow = this.riders.some(rider => rider.dropOffFloor < this.currentFloor)
      return requestBelow || riderBelow
    }

    while (this.requests.length || this.riders.length) {
      if (!direction) {
        if (this.riders.length) {
          direction = this.riders[0].dropOffFloor >= this.currentFloor ? 'up' : 'down'
        } else if (this.requests.length) {
          direction = this.requests[0].currentFloor >= this.currentFloor ? 'up' : 'down'
        }
      }

      if (direction === 'up' && !hasFloorsAbove() && hasFloorsBelow()) {
        direction = 'down'
      } else if (direction === 'down' && !hasFloorsBelow() && hasFloorsAbove()) {
        direction = 'up'
      }

      if (direction === 'up') {
        this._moveUpEfficient()
      } else if (direction === 'down') {
        this._moveDownEfficient()
      }
    }

    if (this.checkReturnToLoby()) {
      this.returnToLoby()
    }
  }

  _hasStopEfficient(){
    const pickupStop = this.requests.some(request => request.currentFloor === this.currentFloor)
    const dropoffStop = this.riders.some(rider => rider.dropOffFloor === this.currentFloor)
    return pickupStop || dropoffStop
  }

  _hasPickupEfficient(){
    const remaining = []
    for (const request of this.requests) {
      if (request.currentFloor === this.currentFloor) {
        this.riders.push(request)
      } else {
        remaining.push(request)
      }
    }
    this.requests = remaining
  }

  _notifyStep() {
    if (typeof this.onStep === 'function') {
      this.onStep()
    }
  }

  _moveUpEfficient(){
    this.currentFloor++
    this.floorsTraversed++
    if (this._hasStopEfficient()) {
      this.stops++
      this._hasPickupEfficient()
      this.hasDropoff()
    }
    this._notifyStep()
  }

  _moveDownEfficient(){
    if (this.currentFloor > 0) {
      this.currentFloor--
      this.floorsTraversed++
      if (this._hasStopEfficient()) {
        this.stops++
        this._hasPickupEfficient()
        this.hasDropoff()
      }
      this._notifyStep()
    }
  }

  goToFloor(person){  
    while (this.currentFloor < person.currentFloor) {
      this.moveUp()
    }

    while (this.currentFloor > person.currentFloor) {
      this.moveDown()
    }

    this.hasPickup()

    while (this.currentFloor < person.dropOffFloor) {
      this.moveUp()
    }

    while (this.currentFloor > person.dropOffFloor) {
      this.moveDown()
    }

    this.hasDropoff()

    if (this.checkReturnToLoby()) {
      this.returnToLoby()
    }
  }

  moveUp(){
    this.currentFloor++
    this.floorsTraversed++
    if(this.hasStop()){
      this.stops++
      this.hasPickup()
      this.hasDropoff()
    }
    this._notifyStep()
  }

  moveDown(){
    if(this.currentFloor > 0){      
      this.currentFloor--
      this.floorsTraversed++
      if(this.hasStop()){
        this.stops++
        this.hasPickup()
        this.hasDropoff()
      }
      this._notifyStep()
    }
  }

  hasStop(){
    const pickupStop =
      this.riders.length === 0 &&
      this.requests.length > 0 &&
      this.requests[0].currentFloor === this.currentFloor
    const dropoffStop = this.riders.some(rider => rider.dropOffFloor === this.currentFloor)

    return pickupStop || dropoffStop
  }

  hasPickup(){
    if (this.riders.length) {
      return
    }
    while (this.requests.length && this.requests[0].currentFloor === this.currentFloor) {
      this.riders.push(this.requests.shift())
    }
  }

  hasDropoff(){
    this.riders = this.riders.filter(rider => rider.dropOffFloor !== this.currentFloor)
  }

  
  getHour() {
    return new Date().getHours()
  }

  checkReturnToLoby(){
    const beforeNoon = this.getHour() < 12
    return beforeNoon && !this.riders.length && !this.requests.length
  }

  returnToLoby(){
    while(this.currentFloor > 0){
      this.moveDown()
    }
  }

  reset(){
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.requests = []
    this.riders = []
  }
}
