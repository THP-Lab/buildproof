import React from 'react'

import {
  IconName,
  SidebarLayout,
  SidebarLayoutContent,
  SidebarLayoutNav,
  SidebarLayoutNavBody,
  SidebarLayoutNavHeader,
  SidebarLayoutNavHeaderButton,
  SidebarLayoutProvider,
  SidebarNavItem,
} from '@0xintuition/buildproof_ui'

import { usePrivy } from '@privy-io/react-auth'
import { Link } from '@remix-run/react'

import buildproofLogo from '../assets/svg/buildproof-logo.svg'
import { AuthButton } from '../components/auth-button'

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { authenticated, ready } = usePrivy()

  return (
    <SidebarLayoutProvider>
      <SidebarLayout>
        <div className="absolute top-4 right-4 z-50">
          <AuthButton />
        </div>
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
                <Link to="/app/vote">
                  <SidebarNavItem iconName={IconName.medal} label="Vote" />
                </Link>
                <Link to="/app/submit-project">
                  <SidebarNavItem
                    iconName={IconName.medal}
                    label="Submit Project"
                  />
                </Link>
                <Link to="/app/submit-hackathon">
                  <SidebarNavItem
                    iconName={IconName.medal}
                    label="Submit Hackathon"
                  />
                </Link>
                <Link to="/app/verify">
                  <SidebarNavItem iconName={IconName.medal} label="Verify" />
                </Link>
                <Link to="/app/profile">
                  <SidebarNavItem
                    iconName={IconName.personCircle}
                    label="Profile"
                  />
                </Link>
              </>
            )}
          </SidebarLayoutNavBody>
        </SidebarLayoutNav>
        <SidebarLayoutContent>{children}</SidebarLayoutContent>
      </SidebarLayout>
    </SidebarLayoutProvider>
  )
}

export default RootLayout
