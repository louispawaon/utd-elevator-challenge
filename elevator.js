export default class Elevator {
  constructor() {
    this.currentFloor = 0
    /** Total pickup/dropoff stops this session; resets with {@link Elevator#reset}. */
    this.stops = 0
    /** Total one-floor moves; fewer means a more efficient run for the same work. Resets with {@link Elevator#reset}. */
    this.floorsTraversed = 0
    this.requests = []
    this.riders= []
  }

  dispatch(){
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
        this.moveUp()
      } else if (direction === 'down') {
        this.moveDown()
      }
    }

    if (this.checkReturnToLoby()) {
      this.returnToLoby()
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
    }
  }

  hasStop(){
    const pickupStop = this.requests.some(request => request.currentFloor === this.currentFloor)
    const dropoffStop = this.riders.some(rider => rider.dropOffFloor === this.currentFloor)

    return pickupStop || dropoffStop
  }

  hasPickup(){
    const pickupRequests = this.requests.filter(request => request.currentFloor === this.currentFloor)

    pickupRequests.forEach(request => this.riders.push(request))
    this.requests = this.requests.filter(request => request.currentFloor !== this.currentFloor)
  }

  hasDropoff(){
    this.riders = this.riders.filter(rider => rider.dropOffFloor !== this.currentFloor)
  }

  checkReturnToLoby(){
    const beforeNoon = new Date().getHours() < 12
    return beforeNoon && !this.riders.length
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
