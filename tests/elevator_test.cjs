require('babel-core/register')({
  ignore: /node_modules\/(?!ProjectB)/
});

const assert = require('chai').assert;
const Elevator = require('../elevator').default;
const Person = require('../person').default

describe('Elevator', function() {
  let elevator = new Elevator();

  beforeEach(function() {
    elevator.reset();
    elevator.checkReturnToLoby = Elevator.prototype.checkReturnToLoby.bind(elevator);
  });

  it('should bring a rider to a floor above their current floor', () => {
    let mockUser = { name: "Brittany", currentFloor: 2, dropOffFloor: 5 };
    elevator.checkReturnToLoby = () => false
    elevator.requests.push(mockUser)
    elevator.goToFloor(mockUser);

    assert.equal(elevator.currentFloor, 5);
    assert.equal(elevator.floorsTraversed, 5)
    assert.equal(elevator.stops, 2)
  });

  it('should bring a rider to a floor below their current floor', () => {
    let mockUser = { name: "Brittany", currentFloor: 8, dropOffFloor: 3 };
    elevator.checkReturnToLoby = () => false
    elevator.requests.push(mockUser)
    elevator.goToFloor(mockUser);

    assert.equal(elevator.currentFloor, 3);
    assert.equal(elevator.floorsTraversed, 13)
    assert.equal(elevator.stops, 2)
  });

  it('dispatch should process a queued request end-to-end', () => {
    const request = new Person('Nora', 2, 4)
    elevator.checkReturnToLoby = () => false
    elevator.requests.push(request)

    elevator.dispatch()

    assert.equal(elevator.currentFloor, 4)
    assert.equal(elevator.stops, 2)
    assert.equal(elevator.floorsTraversed, 4)
    assert.equal(elevator.requests.length, 0)
    assert.equal(elevator.riders.length, 0)
  })

  it('The moveUp function should move the elevator up once',() => {
    const nextFloor = elevator.currentFloor + 1
    elevator.moveUp()

    assert.equal(elevator.currentFloor, nextFloor)
  })

  it('The moveDown function should move the elevator down once until the bottom floor but no further',() => {
    elevator.currentFloor++
    const nextFloor = elevator.currentFloor - 1
    elevator.moveDown()

    assert.equal(elevator.currentFloor, nextFloor)

    elevator.currentFloor = 0
    assert.equal(elevator.currentFloor, 0)
  })

  it('should check if the current floor  of the elevator should stop (picking up/dropping off riders)', ()=> {
    const riderA = new Person('Bob',4,5)    
    const riderB = new Person('John',1,4)
    elevator.currentFloor = elevator.floorsTraversed = 4  
    
    elevator.requests.push(riderA) 
    assert.equal(elevator.hasStop(), true)  
    
    elevator.requests = []
    elevator.riders.push(riderB)
    assert.equal(elevator.hasStop(), true)  
  })

  it('when checking the floor, the person requesting the elevator will enter and become a rider', ()=> {
    const request = new Person('Anne', 3, 1)
    elevator.requests.push(request)
    elevator.currentFloor = 3

    elevator.hasPickup()

    assert.equal(elevator.requests.length, 0)
    assert.equal(elevator.riders[0], request)
  })

  it('dropping a person off the elevator should remove the person entirely', () => {
    const rider = new Person('Anne', 1, 3)
    elevator.riders.push(rider)
    elevator.currentFloor = 3

    elevator.hasDropoff()

    assert.equal(elevator.riders.length, 0)
  })

  describe('Level 5 - Person A before Person B', function() {
    const beforeNoon = new Date().getHours() < 12

    it('Person A goes up, Person B goes up', () => {
      const personA = new Person('Oliver', 3, 6)
      const personB = new Person('Angela', 1, 5)
      elevator.requests = [personA, personB]
      assert.equal(elevator.requests.length, 2)
      assert.equal(elevator.riders.length, 0)

      elevator.dispatch()

      assert.equal(elevator.stops, 4)
      assert.equal(elevator.floorsTraversed, beforeNoon ? 20 : 15)
      assert.equal(elevator.currentFloor, beforeNoon ? 0 : 5)
      assert.equal(elevator.requests.length, 0)
      assert.equal(elevator.riders.length, 0)
    })

    it('Person A goes up, Person B goes down', () => {
      const personA = new Person('Beverly', 3, 6)
      const personB = new Person('James', 5, 1)
      elevator.requests = [personA, personB]
      assert.equal(elevator.requests.length, 2)
      assert.equal(elevator.riders.length, 0)

      elevator.dispatch()

      assert.equal(elevator.stops, 4)
      assert.equal(elevator.floorsTraversed, beforeNoon ? 12 : 11)
      assert.equal(elevator.currentFloor, beforeNoon ? 0 : 1)
      assert.equal(elevator.requests.length, 0)
      assert.equal(elevator.riders.length, 0)
    })

    it('Person A goes down, Person B goes up', () => {
      const personA = new Person('Jeanne', 7, 1)
      const personB = new Person('Karl', 2, 8)
      elevator.requests = [personA, personB]
      assert.equal(elevator.requests.length, 2)
      assert.equal(elevator.riders.length, 0)

      elevator.dispatch()

      assert.equal(elevator.stops, 4)
      assert.equal(elevator.floorsTraversed, beforeNoon ? 28 : 20)
      assert.equal(elevator.currentFloor, beforeNoon ? 0 : 8)
      assert.equal(elevator.requests.length, 0)
      assert.equal(elevator.riders.length, 0)
    })

    it('Person A goes down, Person B goes down', () => {
      const personA = new Person('Max', 8, 2)
      const personB = new Person('Charlie', 5, 0)
      elevator.requests = [personA, personB]
      assert.equal(elevator.requests.length, 2)
      assert.equal(elevator.riders.length, 0)

      elevator.dispatch()

      assert.equal(elevator.stops, 4)
      assert.equal(elevator.floorsTraversed, 22)
      assert.equal(elevator.currentFloor, 0)
      assert.equal(elevator.requests.length, 0)
      assert.equal(elevator.riders.length, 0)
    })
  })

  describe('Level 4 - Multiple requests in order', function() {
    it('Bob then Sue', () => {
      const bob = new Person('Bob', 3, 9)
      const sue = new Person('Sue', 6, 2)
      elevator.requests = [bob, sue]
      elevator.checkReturnToLoby = () => false

      elevator.dispatch()

      assert.equal(elevator.currentFloor, 2)
      assert.equal(elevator.floorsTraversed, 16)
      assert.equal(elevator.stops, 4)
      assert.equal(elevator.requests.length, 0)
      assert.equal(elevator.riders.length, 0)
    })
  })
  
  it('should check if the elevator must return to the loby when there are no riders and the time is earlier than 12PM', () => {
    elevator.currentFloor = 5
    elevator.riders = []
    const expected = new Date().getHours() < 12

    assert.equal(elevator.checkReturnToLoby(), expected)
  })

  it('returnToLoby should move elevator back to floor zero', () => {
    elevator.currentFloor = 4

    elevator.returnToLoby()

    assert.equal(elevator.currentFloor, 0)
    assert.equal(elevator.floorsTraversed, 4)
  })

  it('reset should clear elevator state counters and collections', () => {
    elevator.currentFloor = 7
    elevator.stops = 3
    elevator.floorsTraversed = 11
    elevator.requests = [new Person('Sam', 1, 5)]
    elevator.riders = [new Person('Kai', 3, 6)]

    elevator.reset()

    assert.equal(elevator.currentFloor, 0)
    assert.equal(elevator.stops, 0)
    assert.equal(elevator.floorsTraversed, 0)
    assert.equal(elevator.requests.length, 0)
    assert.equal(elevator.riders.length, 0)
  })

  describe('Level 3 - Efficiency metrics', function() {
    it('accumulates floorsTraversed and stops across trips until reset', () => {
      elevator.checkReturnToLoby = () => false
      const first = { name: 'A', currentFloor: 2, dropOffFloor: 5 }
      elevator.requests.push(first)
      elevator.goToFloor(first)
      assert.equal(elevator.floorsTraversed, 5)
      assert.equal(elevator.stops, 2)

      const second = { name: 'B', currentFloor: 5, dropOffFloor: 6 }
      elevator.requests.push(second)
      elevator.goToFloor(second)
      assert.equal(elevator.floorsTraversed, 6)
      assert.equal(elevator.stops, 3)
    })

    it('uses fewer floorsTraversed for a shorter ride from the same pickup floor', () => {
      elevator.checkReturnToLoby = () => false
      const shortTrip = new Person('Short', 2, 3)
      elevator.requests.push(shortTrip)
      elevator.goToFloor(shortTrip)
      const shortFloors = elevator.floorsTraversed

      elevator.reset()
      elevator.checkReturnToLoby = () => false
      const longTrip = new Person('Long', 2, 10)
      elevator.requests.push(longTrip)
      elevator.goToFloor(longTrip)
      const longFloors = elevator.floorsTraversed

      assert.isBelow(shortFloors, longFloors)
    })
  })
});
