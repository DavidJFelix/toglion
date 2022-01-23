import {chunk} from '../chunk'

test('chunk splits array into even sized chunk arrays', () => {
  // Given
  const initial = [1, 2, 3, 4, 5, 6, 7, 8]
  const expected = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ]

  // When
  const result = chunk(initial, 2)

  // Then
  expect(result).toEqual(expected)
})
