import {useCallback, useState} from 'react'

export type UseLocalStorageReturn<T> = [value: T, set: (value: T) => void]

// if we don't provide `defaultValue`, we could get back `undefined`
export function useLocalStorage<T>(
  key: string,
): UseLocalStorageReturn<T | undefined>

// if we provide `defaultValue`, we'll always get back T
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): UseLocalStorageReturn<T>

export function useLocalStorage<T>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(() => {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : defaultValue
  })

  const set = useCallback(
    (newValue: T) => {
      if (newValue === value) return

      setValue(value)
      localStorage.setItem(key, JSON.stringify(value))
    },
    [value],
  )

  return [value, set]
}
