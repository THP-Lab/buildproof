import { json } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { getUserWallet } from '@server/auth'
import type { LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
  // Get the wallet if it exists, but don't require it
  const wallet = await getUserWallet(request)

  return json({
    wallet,
  })
}

export default function App() {
  return (
    <div className="h-screen flex">
      <Outlet />
    </div>
  )
}
