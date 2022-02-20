import {useMutation, useQuery} from 'react-query'
import {Flag} from 'types'

export const useGetFlag = (id: string) =>
  useQuery<{flags: Flag[]}>(['flags', id], async () => {
    const result = await fetch(`/api/flags/${id}`)
    const flags = result.json()
    return flags
  })
export const useCreateFlags = useMutation(async (newFlag: Omit<Flag, 'id'>) => {
  return fetch('/api/flags', {
    method: 'post',
    body: JSON.stringify(newFlag),
  })
})
