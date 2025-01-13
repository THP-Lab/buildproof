import React, { useState, ChangeEvent } from 'react';
import {
  SidebarLayout,
  SidebarLayoutProvider,
  SidebarLayoutNav,
  SidebarLayoutNavBody,
  SidebarLayoutContent,
  SidebarLayoutNavHeader,
  SidebarLayoutNavHeaderButton,
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
  IconName,
  SidebarNavItem,
  Icon,
} from '@0xintuition/buildproof_ui';
import { HackathonCard } from '@0xintuition/buildproof_ui/src/components/HackathonCard';

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

export default function App() {
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
    <SidebarLayoutProvider>
      <SidebarLayout>
        <SidebarLayoutNav>
          <SidebarLayoutNavHeader>
            <SidebarLayoutNavHeaderButton
              imgLogo={
                <svg width="28" height="28" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="256" height="256" rx="16" fill="#0A100D" />
                  <rect x="106" y="194" width="72" height="12" rx="6" fill="#FF8964" />
                  <rect x="106" y="170" width="100" height="12" rx="6" fill="#FF8964" />
                  <rect x="162" y="146" width="44" height="12" rx="6" fill="#FF8964" />
                  <rect x="106" y="146" width="44" height="12" rx="6" fill="#FF8964" />
                  <rect x="50" y="194" width="44" height="12" rx="6" fill="#E33B3B" />
                  <rect x="50" y="170" width="44" height="12" rx="6" fill="#E33B3B" />
                  <rect x="50" y="146" width="44" height="12" rx="6" fill="#E33B3B" />
                  <rect x="50" y="122" width="128" height="12" rx="6" fill="#E33B3B" />
                  <rect x="134" y="98.0001" width="72" height="12" rx="6" fill="#E33B3B" />
                  <rect x="50" y="98" width="72" height="12" rx="6" fill="#FF8964" />
                  <rect x="106" y="74.0001" width="100" height="12" rx="6" fill="#E33B3B" />
                  <rect x="50" y="74" width="44" height="12" rx="6" fill="#FF8964" />
                  <rect x="50" y="50" width="128" height="12" rx="6" fill="#E33B3B" />
                </svg>
              }
              textLogo={
                <svg width="110" height="22" viewBox="0 0 665 103" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9.8H27.72C37 9.8 44.08 11.8 48.96 15.8C53.92 19.8 56.4 25.52 56.4 32.96C56.4 36.48 55.56 39.64 53.88 42.44C52.28 45.16 49.96 47.36 46.92 49.04C43.88 50.64 40.32 51.48 36.24 51.56V50.84C43.76 50.92 49.6 52.8 53.76 56.48C57.92 60.16 60 65.12 60 71.36C60 78.8 57.4 84.6 52.2 88.76C47.08 92.92 39.88 95 30.6 95H3V9.8ZM30.72 83.96C36.24 83.96 40.44 82.84 43.32 80.6C46.2 78.28 47.64 75.04 47.64 70.88C47.64 66.56 46.2 63.2 43.32 60.8C40.44 58.4 36.24 57.2 30.72 57.2H14.76V83.96H30.72ZM27.96 46.28C33.4 46.28 37.44 45.2 40.08 43.04C42.72 40.8 44.04 37.64 44.04 33.56C44.04 29.4 42.72 26.24 40.08 24.08C37.44 21.92 33.4 20.84 27.96 20.84H14.76V46.28H27.96Z" fill="#FF8964" />
                </svg>
              }
              productLogo={
                <svg width="75" height="22" viewBox="0 0 75 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1.13135" y="1" width="73" height="20" rx="5.5" fill="url(#paint0_linear_12803_13204)" fillOpacity="0.9" />
                  <rect x="1.13135" y="1" width="73" height="20" rx="5.5" fill="url(#paint1_linear_12803_13204)" fillOpacity="0.2" />
                  <rect x="1.13135" y="1" width="73" height="20" rx="5.5" stroke="url(#paint2_linear_12803_13204)" />
                  <path d="M7.9245 6.98H13.8525V8.516H9.7485V10.472H13.7085V11.984H9.7485V13.964H13.9485V15.5H7.9245V6.98Z" fill="black" />
                  <defs>
                    <linearGradient id="paint0_linear_12803_13204" x1="45.6313" y1="0.499999" x2="45.0239" y2="21.4824" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="#736961" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_12803_13204" x1="74.6313" y1="11" x2="0.631348" y2="11" gradientUnits="userSpaceOnUse">
                      <stop stopOpacity="0" />
                      <stop offset="0.0793919" stopColor="white" stopOpacity="0.8" />
                      <stop offset="0.955" stopColor="#FBFBFB" stopOpacity="0.786437" />
                      <stop offset="1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint2_linear_12803_13204" x1="27.6314" y1="0.5" x2="27.6314" y2="21.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" stopOpacity="0.24" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              }
              onClick={() => { }}
            />
          </SidebarLayoutNavHeader>
          <SidebarLayoutNavBody className="flex flex-col justify-between">
            <div className="flex flex-col gap-px">
              <SidebarNavItem
                iconName={IconName.layoutGrid}
                label="Home"
                onClick={() => { }}
              />
              <SidebarNavItem
                iconName={IconName.medal}
                label="Hackathons"
                onClick={() => { }}
              />
              <SidebarNavItem
                iconName={IconName.personCircle}
                label="Profile"
                onClick={() => { }}
              />
            </div>
          </SidebarLayoutNavBody>
        </SidebarLayoutNav>

        <SidebarLayoutContent>
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
        </SidebarLayoutContent>
      </SidebarLayout>
    </SidebarLayoutProvider>
  );
}
