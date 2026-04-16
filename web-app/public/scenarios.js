


export const SCENARIOS = [
  {
    id: 'l4-bob-sue',
    label: 'Bob then Sue',
    mode: 'fifo',
    people: [
      { name: 'Bob', currentFloor: 3, dropOffFloor: 9 },
      { name: 'Sue', currentFloor: 6, dropOffFloor: 2 },
    ],
  },
  {
    id: 'l5-a-up-b-up',
    label: 'A up, B up',
    mode: 'fifo',
    people: [
      { name: 'Oliver', currentFloor: 3, dropOffFloor: 6 },
      { name: 'Angela', currentFloor: 1, dropOffFloor: 5 },
    ],
  },
  {
    id: 'l5-a-up-b-down',
    label: 'A up, B down',
    mode: 'fifo',
    people: [
      { name: 'Beverly', currentFloor: 3, dropOffFloor: 6 },
      { name: 'James', currentFloor: 5, dropOffFloor: 1 },
    ],
  },
  {
    id: 'l5-a-down-b-up',
    label: 'A down, B up',
    mode: 'fifo',
    people: [
      { name: 'Jeanne', currentFloor: 7, dropOffFloor: 1 },
      { name: 'Karl', currentFloor: 2, dropOffFloor: 8 },
    ],
  },
  {
    id: 'l5-a-down-b-down',
    label: 'A down, B down',
    mode: 'fifo',
    people: [
      { name: 'Max', currentFloor: 8, dropOffFloor: 2 },
      { name: 'Charlie', currentFloor: 5, dropOffFloor: 0 },
    ],
  },
  {
    id: 'l7-up-up-eff',
    label: 'A up, B up (efficient)',
    mode: 'efficient',
    people: [
      { name: 'Oliver', currentFloor: 3, dropOffFloor: 6 },
      { name: 'Angela', currentFloor: 1, dropOffFloor: 5 },
    ],
  },
  {
    id: 'l7-up-down-eff',
    label: 'A up, B down (efficient)',
    mode: 'efficient',
    people: [
      { name: 'Beverly', currentFloor: 3, dropOffFloor: 6 },
      { name: 'James', currentFloor: 5, dropOffFloor: 1 },
    ],
  },
  {
    id: 'l7-down-up-eff',
    label: 'A down, B up (efficient)',
    mode: 'efficient',
    people: [
      { name: 'Jeanne', currentFloor: 7, dropOffFloor: 1 },
      { name: 'Karl', currentFloor: 2, dropOffFloor: 8 },
    ],
  },
  {
    id: 'l7-down-down-eff',
    label: 'A down, B down (efficient)',
    mode: 'efficient',
    people: [
      { name: 'Max', currentFloor: 8, dropOffFloor: 2 },
      { name: 'Charlie', currentFloor: 5, dropOffFloor: 0 },
    ],
  },
]
