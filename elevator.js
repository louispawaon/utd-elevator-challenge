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
    while (this.requests.length) {
      this.goToFloor(this.requests[0])
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

  /** Wall-clock hour (0–23); override in tests. Level 6: before noon return to lobby when idle; after noon stay at last dropoff. */
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
