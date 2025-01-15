import { SidebarLayout, SidebarLayoutProvider, SidebarLayoutNav, SidebarLayoutNavBody, SidebarLayoutContent, SidebarLayoutNavHeader, SidebarLayoutNavHeaderButton, SidebarNavItem, IconName } from '@0xintuition/buildproof_ui'
import { Link } from '@remix-run/react'

import buildproofLogo from '../../assets/svg/buildproof-logo.svg'
import { Home } from '../home/Home'

export default function App() {
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
            <Link to="/app/hackathons">
              <SidebarNavItem iconName={IconName.medal} label="Hackathons" />
            </Link>
            <Link to="/app/profile">
              <SidebarNavItem iconName={IconName.personCircle} label="Profile" />
            </Link>
          </SidebarLayoutNavBody>
        </SidebarLayoutNav>
        <SidebarLayoutContent>
          <Home />
        </SidebarLayoutContent>
      </SidebarLayout>
    </SidebarLayoutProvider>
  )
}
