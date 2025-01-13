import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { HackathonCard } from './HackathonCard';

describe('HackathonCard', () => {
  it('should render with all props', () => {
    const { getByText, getByAltText } = render(
      <HackathonCard
        title="Hackathon Project"
        description="A brief description"
        tags={['Blockchain', 'AI']}
        cashPrize="$10,000"
        imgSrc="https://avatars.githubusercontent.com/u/186075312?s=200&v=4"
        startDate="2023-01-01"
        endDate="2023-01-10"
        winners={['John', 'Jane']}
        isLiked={false}
        status="upcoming"
      />
    );

    expect(getByText('Hackathon Project')).toBeInTheDocument();
    expect(getByAltText('Hackathon Project')).toBeInTheDocument();
    expect(getByText('A brief description')).toBeInTheDocument();
    expect(getByText('Cash Prize: $10,000')).toBeInTheDocument();
  });

  it('should toggle like state', () => {
    const { getByRole } = render(
      <HackathonCard
        title="Hackathon Project"
        description="A brief description"
        tags={['Blockchain', 'AI']}
        cashPrize="$10,000"
        imgSrc="https://avatars.githubusercontent.com/u/186075312?s=200&v=4"
        startDate="06/01/25"
        endDate="28/02/25"
        isLiked={false}
        status="upcoming"
      />
    );

    const button = getByRole('button');
    fireEvent.click(button);
    expect(button.firstChild).toHaveClass('text-yellow-500');
  });
}); 