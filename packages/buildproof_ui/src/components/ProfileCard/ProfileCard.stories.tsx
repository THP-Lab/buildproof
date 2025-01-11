import type { Meta, StoryObj } from '@storybook/react'
import { Button } from 'components/Button'
import { Identity, UserRole } from 'types'

import { ProfileCard, ProfileCardProps } from './ProfileCard'

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  argTypes: {
    variant: {
      description: 'Variant of avatar',
      options: Object.values(Identity),
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'user' },
      },
      control: 'select',
    },
    avatarSrc: {
      description: 'URL of the avatar image',
      table: {
        type: { summary: 'string' },
      },
    },
    name: {
      description: 'Name of the identity',
      table: {
        type: { summary: 'string' },
      },
    },
    id: {
      description: 'Wallet address of the identity',
      table: {
        type: { summary: 'string' },
      },
    },
    vaultId: {
      description: 'Vault ID of the identity',
      table: {
        type: { summary: 'string' },
      },
    },
    stats: {
      description: 'Statistics related to the identity',
      table: {
        type: {
          summary: '{ numberOfFollowers: number, numberOfFollowing?: number }',
        },
      },
    },
    roles: {
      description: 'User roles (Developer > Sponsor > Judge > Admin)',
      table: {
        type: { summary: 'UserRole[]' },
        defaultValue: { summary: '[]' },
      },
      control: 'multi-select',
      options: Object.values(UserRole),
    },
    ipfsLink: {
      description: 'Link related IPFS document',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    externalLink: {
      description: 'Link related to the entity (optional)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    bio: {
      description: 'Bio or description of the identity',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof ProfileCard>

export const BasicUsage: Story = {
  args: {
    variant: 'user',
    avatarSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    name: 'John Doe',
    id: '0x1234567890abcdef1234567890abcdef12345678',
    vaultId: '131',
    stats: {
      numberOfFollowers: 123,
      numberOfFollowing: 45,
    },
    roles: [UserRole.Developer, UserRole.Judge],
    bio: 'John Doe is a blockchain enthusiast. He loves to learn new things and share his knowledge with others. He is also a contributor to various open-source projects.',
  },
  render: (args: ProfileCardProps) => (
    <div className="w-[500px]">
      <ProfileCard {...args}>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => window.open('https://example.com', '_blank')}
        >
          Follow
        </Button>
      </ProfileCard>
    </div>
  ),
}

export const SponsorProfile: Story = {
  args: {
    variant: 'user',
    avatarSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    name: 'Jane Smith',
    id: '0x1234567890abcdef1234567890abcdef12345678',
    vaultId: '131',
    stats: {
      numberOfFollowers: 300,
      numberOfFollowing: 150,
    },
    roles: [UserRole.Sponsor, UserRole.Judge],
    ipfsLink:
      'https://ipfs.io/ipfs/QmYch4WMF5p7yxjEcuZJxNa7AFR1ZeQhCRsn9xG7P3koXo',
    bio: 'Jane Smith is a blockchain enthusiast and sponsor. She supports various blockchain projects and helps them grow.',
  },
  render: (args: ProfileCardProps) => (
    <div className="w-[500px]">
      <ProfileCard {...args} />
    </div>
  ),
}

export const AdminProfile: Story = {
  args: {
    variant: 'user',
    avatarSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    name: 'Admin User',
    id: '0x1234567890abcdef1234567890abcdef12345678',
    vaultId: '131',
    stats: {
      numberOfFollowers: 50,
      numberOfFollowing: 20,
    },
    roles: [UserRole.Admin],
    bio: 'Platform administrator responsible for maintaining and moderating the platform.',
  },
  render: (args: ProfileCardProps) => (
    <div className="w-[500px]">
      <ProfileCard {...args} />
    </div>
  ),
}
