import React, { useState } from 'react';
import { IdentityTag, Text, Tag, Icon } from 'components';

interface HackathonCardProps {
  title: string;
  description: string;
  tags: string[];
  cashPrize: string;
  imgSrc: string;
  startDate: string;
  endDate: string;
  winners?: string[];
  isLiked?: boolean;
  onLikeToggle?: () => void;
  status: 'upcoming' | 'ongoing' | 'past';
}

const HackathonCard: React.FC<HackathonCardProps> = ({
  title,
  description,
  tags,
  cashPrize,
  imgSrc,
  startDate,
  endDate,
  winners,
  isLiked = false,
  onLikeToggle,
  status,
}) => {
  const [liked, setLiked] = useState(isLiked);

  const handleLikeToggle = () => {
    setLiked(!liked);
    if (onLikeToggle) onLikeToggle();
  };

  const statusStyles = {
    upcoming: 'text-blue-500',
    ongoing: 'text-green-500',
    past: 'text-gray-500',
  };

  return (
    <div className={`relative w-full flex flex-col overflow-hidden gap-3 p-5 text-left bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary/10 hover:border-primary/50 hover:cursor-pointer transition-all duration-300 max-w-[400px] md:max-w-none`}>
      <div className="flex justify-between items-center">
        <Text variant="headline" className={`title-text ${statusStyles[status]}`}>{title}</Text>
        <button onClick={handleLikeToggle}>
          <Icon name={liked ? "heart-filled" : "heart-outline"} className={`w-6 h-6 ${liked ? 'text-red-500' : 'text-gray-500'}`} />
        </button>
      </div>
      <div className="relative w-full mt-3">
        <img src={imgSrc} alt={title} className="h-full object-cover rounded-xl aspect-video" />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </div>
        <Text variant="body" className="text-secondary mt-2">{description}</Text>
      <div className="flex gap-6 text-secondary/70 mt-2">
        <Text variant="body" className="text-secondary/70">{cashPrize}</Text>
        <Text variant="body" className="text-secondary/70">{startDate} to {endDate}</Text>
        
      </div>
      {winners && winners.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <Text variant="body" className="text-secondary/70">Winners:</Text>
          {winners.map((winner, index) => (
            <IdentityTag key={index}>{winner}</IdentityTag>
          ))}
        </div>
      )}
    </div>
  );
};

export { HackathonCard }; 