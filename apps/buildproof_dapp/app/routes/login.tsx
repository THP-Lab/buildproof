import { Text } from '@0xintuition/buildproof_ui'

import PrivyLoginButton from '@client/privy-login-button'
import { BuiltOnBase } from '@components/built-on-base'
import { HeaderLogo } from '@components/header-logo'
import logger from '@lib/utils/logger'
import { User as PrivyUser } from '@privy-io/react-auth'
import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useSubmit } from '@remix-run/react'
import { PATHS } from 'app/consts'

export async function action({ request }: ActionFunctionArgs) {
  logger('[Action] Entering login action')
  const url = new URL(request.url)
  const redirectUrl = url.searchParams.get('redirectTo') ?? PATHS.APP
  logger('[Action] Redirecting to', redirectUrl)
  return json({ success: true, redirectTo: redirectUrl })
}

export default function Login() {
  const submit = useSubmit()

  function handleLogin(
    user: PrivyUser,
    isNewUser: boolean,
    wasAlreadyAuthenticated: boolean,
  ) {
    logger('user', user)
    logger('isNewUser', isNewUser)
    logger('wasAlreadyAuthenticated', wasAlreadyAuthenticated)

    const formData = new FormData()
    formData.append('userId', user.id)
    submit(formData, { method: 'post' })
  }

  return (
    <div>
      <div className="flex flex-col justify-between h-screen w-full p-8">
        <div className="flex flex-row justify-between w-full">
          <HeaderLogo />
          <div className="justify-end">
            <BuiltOnBase />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Text variant="heading4" weight="semibold" className="mb-4">
            Sign in to BuildProof
          </Text>
          <Text variant="body" className="text-secondary-foreground/60 mb-10">
            Connect your wallet to get started
          </Text>
          <PrivyLoginButton handleLogin={handleLogin} />
        </div>
        <div className="flex items-center justify-center max-sm:flex-col max-sm:gap-2 max-sm:items-center max-sm:text-center gap-1">
          <Text variant="body" className="text-secondary-foreground/60">
            Have a question or need help resolving an issue?
          </Text>
          <Link
            to="https://discord.com/channels/909531430881746974/1151564740255043604"
            target="_blank"
            className="text-base text-foreground/70 hover:text-foreground/90"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
