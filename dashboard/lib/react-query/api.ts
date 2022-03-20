import {useMutation, useQuery, useQueryClient} from 'react-query'
import {Flag} from 'types'

export const useGetFlag = (id: string) =>
  useQuery<{flags: Flag[]}>(['flags', id], async () => {
    const result = await fetch(`/api/flags/${id}`)
    const flags = result.json()
    return flags
  })

export const useListFlags = (organizationId: string) =>
  useQuery<{flags: Flag[]}>(['flags'], async () => {
    const result = await fetch(`/api/organizations/${organizationId}/flags`)
    const flags = result.json()
    return flags
  })
export const useCreateFlag = () => {
  const queryClient = useQueryClient()
  return useMutation(
    async (newFlag: Omit<Flag, 'id'>) => {
      console.log(newFlag)
      console.log(JSON.stringify(newFlag))
      const response = await fetch('/api/flags', {
        method: 'post',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(newFlag),
      })
      const flag = await response.json()
      return flag as Flag
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flags'])
      },
    },
  )
}

export const useUpdateFlag = () => {
  const queryClient = useQueryClient()
  return useMutation(
    async (newFlag: Flag) => {
      return fetch(`/api/flags/${newFlag.id}`, {
        method: 'put',
        body: JSON.stringify(newFlag),
      })
    },
    {
      onSuccess: () => {
        // FIXME: make this just invalidate the one flag
        queryClient.invalidateQueries(['flags'])
      },
    },
  )
}
