import { PATHS } from '@consts/paths'
import { redirect } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
  const redirectTo = new URL(request.url).searchParams.get('redirectTo')
  if (redirectTo) {
    throw redirect(redirectTo)
  }
  throw redirect(PATHS.APP)
}

export default function Index() {
  return null
}
