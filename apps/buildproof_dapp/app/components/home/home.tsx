import React, { useState, ChangeEvent } from 'react';
import {
  ListGrid,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Tags,
  TagsContent,
  TagWithValue,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Text,
  HackathonCard
} from '@0xintuition/buildproof_ui';

type HackathonStatus = 'completed' | 'upcoming' | 'ongoing';

interface Hackathon {
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
  status: HackathonStatus;
}

// Mock data
const MOCK_HACKATHONS: Hackathon[] = [
  {
    title: 'Past Hackathon',
    description: 'This hackathon project has been completed successfully.',
    tags: ['Blockchain', 'AI', 'Open Source'],
    cashPrize: '$10,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '01/01/2023',
    endDate: '10/01/2023',
    winners: ['John', 'Jane'],
    isLiked: false,
    status: 'completed',
  },
  {
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
  {
    title: 'Ongoing Hackathon',
    description: 'This hackathon is currently in progress.',
    tags: ['Web3', 'Innovation'],
    cashPrize: '$15,000',
    imgSrc: 'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
    startDate: '01/01/2024',
    endDate: '03/01/2024',
    winners: [],
    isLiked: false,
    status: 'ongoing',
  }
];

export function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | HackathonStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 6;

  // Filter hackathons based on status and search query
  const filteredHackathons = MOCK_HACKATHONS.filter(hackathon => {
    const matchesStatus = statusFilter === 'all' || hackathon.status === statusFilter;
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredHackathons.length / itemsPerPage);
  const paginatedHackathons = filteredHackathons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get all unique tags and their counts
  const tagCounts = MOCK_HACKATHONS.flatMap(h => h.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as 'all' | HackathonStatus);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLikeToggle = (index: number) => {
    // Here you would typically update the like status in your backend
    console.log(`Toggled like for hackathon at index ${index}`);
  };

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col gap-6">
        <Text variant="h1" className="font-bold">
          Available Hackathons
        </Text>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="w-[200px]">
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[300px]">
            <Input
              type="text"
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="w-full">
          <Tags>
            <TagsContent numberOfTags={Object.keys(tagCounts).length}>
              {Object.entries(tagCounts).map(([tag, count]) => (
                <TagWithValue key={tag} label={tag} value={count} />
              ))}
            </TagsContent>
          </Tags>
        </div>

        {/* Hackathon Grid */}
        <ListGrid>
          {paginatedHackathons.map((hackathon, index) => (
            <HackathonCard
              key={index}
              {...hackathon}
              onLikeToggle={() => handleLikeToggle(index)}
            />
          ))}
        </ListGrid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
} 