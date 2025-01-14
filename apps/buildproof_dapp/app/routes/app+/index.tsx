import { SidebarLayout, SidebarLayoutProvider, SidebarLayoutNav, SidebarLayoutNavBody, SidebarLayoutContent, SidebarLayoutNavHeader, SidebarLayoutNavHeaderButton, SidebarNavItem, IconName } from '@0xintuition/buildproof_ui'
import { usePrivy } from '@privy-io/react-auth'
import { Link } from '@remix-run/react'

import { AuthButton } from '../../components/auth-button'
import buildproofLogo from '../../assets/svg/buildproof-logo.svg'
import { Home } from '../../pages/Home'

export default function App() {
  const { authenticated, ready } = usePrivy()

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <SidebarLayoutProvider>
      <SidebarLayout>
        <SidebarLayoutNav>
          <SidebarLayoutNavHeader>
            <SidebarLayoutNavHeaderButton
              imgLogo={<img src={buildproofLogo} alt="BuildProof Logo" />}
              textLogo={<span>BuildProof</span>}
              productLogo={<span>Dapp</span>}
            />
          </SidebarLayoutNavHeader>
          <SidebarLayoutNavBody>
            <Link to="/app">
              <SidebarNavItem iconName={IconName.layoutGrid} label="Home" />
            </Link>
            {authenticated && (
              <>
                <Link to="/app/hackathons">
                  <SidebarNavItem iconName={IconName.medal} label="Hackathons" />
                </Link>
                <Link to="/app/profile">
                  <SidebarNavItem iconName={IconName.personCircle} label="Profile" />
                </Link>
              </>
            )}
            <div className="mt-auto pb-4">
              <AuthButton />
            </div>
          </SidebarLayoutNavBody>
        </SidebarLayoutNav>
        <SidebarLayoutContent>
          {authenticated ? (
            <Home />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-2xl font-bold mb-4">Welcome to BuildProof</h1>
              <p className="text-gray-500 mb-8">Connect your wallet to get started</p>
              <AuthButton />
            </div>
          )}
        </SidebarLayoutContent>
      </SidebarLayout>
    </SidebarLayoutProvider>
  )
}
