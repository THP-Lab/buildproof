import React, { ChangeEvent, useState } from 'react'

import {
  HackathonCard,
  Input,
  ListGrid,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
  Text,
} from '@0xintuition/buildproof_ui'

import { useAdminAddresses } from '../../lib/hooks/useAdminAddresses'
import { Hackathon, useHackathons } from '../../lib/hooks/useHackathons'

type HackathonStatus = 'past' | 'upcoming' | 'ongoing'
const DEFAULT_PAGE_SIZE = 16

export function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | HackathonStatus>(
    'all',
  )
  const [searchQuery, setSearchQuery] = useState('')

  const { adminAddresses, isLoading: isLoadingAdmins } = useAdminAddresses()
  const {
    hackathons,
    isLoading: isLoadingHackathons,
    error,
  } = useHackathons(adminAddresses)

  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesStatus =
      statusFilter === 'all' || hackathon.status === statusFilter
    const matchesSearch =
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredHackathons.length / DEFAULT_PAGE_SIZE)
  const paginatedHackathons = filteredHackathons.slice(
    (currentPage - 1) * DEFAULT_PAGE_SIZE,
    currentPage * DEFAULT_PAGE_SIZE,
  )

  const tagCounts = filteredHackathons
    .flatMap((h) => h.tags)
    .reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as 'all' | HackathonStatus)
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleLikeToggle = (index: number) => {
    console.log(`Toggled like for hackathon at index ${index}`)
  }

  if (isLoadingAdmins || isLoadingHackathons) {
    return (
      <div className="p-6 w-full">
        <Text variant="h1" className="font-bold">
          Available Hackathons
        </Text>
        <div className="mt-4">
          <Text>Chargement des hackathons...</Text>
        </div>
      </div>
    )
  }

  if (error instanceof Error) {
    return (
      <div className="p-6 w-full">
        <Text variant="h1" className="font-bold">
          Available Hackathons
        </Text>
        <div className="mt-4 text-red-500">
          <Text>Error loading hackathons: {error.message}</Text>
          <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col gap-6">
        <Text variant="h1" className="font-bold">
          Available Hackathons
        </Text>

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
                  <SelectItem value="past">Past</SelectItem>
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

        {Object.keys(tagCounts).length > 0 && (
          <div className="w-full">
            <Tags>
              <TagsContent numberOfTags={Object.keys(tagCounts).length}>
                {Object.entries(tagCounts).map(([tag, count]) => (
                  <TagWithValue key={tag} label={tag} value={count} />
                ))}
              </TagsContent>
            </Tags>
          </div>
        )}

        <ListGrid>
          {paginatedHackathons.map((hackathon, index) => (
            <a
              key={index}
              href={`/hackathonDetails/${hackathon.id}`}
              className="block transition-transform hover:scale-105"
              onClick={(e) => {
                if (
                  e.target instanceof HTMLElement &&
                  e.target.closest('.like-button')
                ) {
                  e.preventDefault()
                }
              }}
            >
              <HackathonCard
                {...hackathon}
                onLikeToggle={() => handleLikeToggle(index)}
              />
            </a>
          ))}
        </ListGrid>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
