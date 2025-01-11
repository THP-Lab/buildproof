import type { Meta, StoryObj } from '@storybook/react';
import { HackathonCard } from './HackathonCard';

const meta: Meta<typeof HackathonCard> = {
  title: 'Components/HackathonCard',
  component: HackathonCard,
};

export default meta;

type Story = StoryObj<typeof HackathonCard>;

export const BasicUsage: Story = {
  args: {
    title: 'Past Hackathon',
    description: 'This hackathon project has been Past successfully.',
    tags: ['Blockchain', 'AI', 'Open Source'],
    cashPrize: '$10,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '01/01/2023',
    endDate: '10/01/2023',
    winners: ['John', 'Jane'],
    isLiked: false,
    status: 'past',
  },
};

export const Upcoming: Story = {
  args: {
    title: 'Upcoming Hackathon',
    description: 'This hackathon will start soon.',
    tags: ['Blockchain', 'AI'],
    cashPrize: '$5,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '01/02/2025',
    endDate: '15/03/2025',
    winners: [],
    isLiked: false,
    status: 'upcoming',
  },
};

export const Ongoing: Story = {
  args: {
    title: 'Ongoing Hackathon',
    description: 'This hackathon is currently in progress.',
    tags: ['Web3', 'Innovation'],
    cashPrize: '$10,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '06/01/2025',
    endDate: '28/02/2025',
    winners: [],
    isLiked: false,
    status: 'ongoing',
  },
};

export const Past: Story = {
  args: {
    title: 'Past Hackathon',
    description: 'This hackathon project is currently in progress.',
    tags: ['Web3', 'Innovation'],
    cashPrize: '$5,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '01/01/2023',
    endDate: '10/01/2023',
    winners: ['John', 'Jane'],
    isLiked: false,
    status: 'ongoing',
  },
}; 