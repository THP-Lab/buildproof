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
    title: 'Amazing Hackathon Project',
    description: 'This is a brief description of the hackathon project.',
    tags: ['Blockchain', 'AI', 'Open Source'],
    cashPrize: '$10,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '06/01/25',
    endDate: '28/02/25',
    winners: ['John', 'Jane'],
    isLiked: false,
  },
}; 