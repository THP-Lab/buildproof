import { useEffect, useRef } from 'react'

import { usePrivy } from '@privy-io/react-auth'
import { useRevalidator } from '@remix-run/react'

export default function PrivyRefresh() {
  const { ready, getAccessToken } = usePrivy()
  const { revalidate } = useRevalidator()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    async function refresh() {
      if (ready && !hasRefreshed.current) {
        hasRefreshed.current = true
        await getAccessToken()
        revalidate()
      }
    }

    refresh()
  }, [ready, revalidate, getAccessToken])

  return null
}
