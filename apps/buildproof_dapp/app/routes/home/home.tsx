import React, { ChangeEvent, useEffect, useState } from 'react'

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
import {
  configureClient,
  useGetTriplesWithPositionsQuery,
} from '@0xintuition/graphql'

import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { requireUser } from '../../.server/auth'

const TAG_PREDICATE_ID = 3
const TOP_WEB3_TOOLING_LABEL = 'BP_test'
const DEFAULT_PAGE_SIZE = 6

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request)
    return json({
      userAddress: user.wallet?.address,
      predicateId: TAG_PREDICATE_ID,
    })
  } catch (error) {
    console.error('Error in loader:', error)
    return json({
      userAddress: undefined,
      predicateId: TAG_PREDICATE_ID,
    })
  }
}

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

type HackathonStatus = 'past' | 'upcoming' | 'ongoing'

interface AtomData {
  id: string
  data?: string | null
  label?: string | null
  image?: string | null
  as_subject_triples?: Array<{
    predicate: {
      id: string
      data: string
    }
    object: {
      data: string
      label: string
    }
  }>
}

interface Hackathon {
  title: string
  description: string
  tags: string[]
  cashPrize: string
  imgSrc: string
  startDate: string
  endDate: string
  winners?: string[]
  isLiked?: boolean
  onLikeToggle?: () => void
  status: HackathonStatus
}

type LoaderReturn = {
  userAddress: string | undefined
  predicateId: number
}

export function Home() {
  console.log('Home component rendered')
  const data = useLoaderData()

  if (!data) {
    return (
      <div className="p-6">
        <Text>Loading...</Text>
      </div>
    )
  }

  const { userAddress, predicateId = TAG_PREDICATE_ID } = data as LoaderReturn

  // Si pas d'adresse utilisateur, on peut afficher un message ou un loader
  if (!userAddress) {
    return (
      <div className="p-6">
        <Text>Connecting to wallet...</Text>
      </div>
    )
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | HackathonStatus>(
    'all',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [ipfsDataMap, setIpfsDataMap] = useState<Record<string, any>>({})

  // Fetch triples
  const { data: triplesData, isLoading } = useGetTriplesWithPositionsQuery(
    {
      limit: DEFAULT_PAGE_SIZE,
      where: {
        _and: [
          { predicate_id: { _eq: TAG_PREDICATE_ID } },
          { object: { label: { _eq: TOP_WEB3_TOOLING_LABEL } } },
        ],
      },
      address: userAddress!,
    },
    {
      queryKey: [
        'get-triples-with-positions',
        predicateId,
        TOP_WEB3_TOOLING_LABEL,
        userAddress,
      ],
      enabled: !!userAddress && !!predicateId,
    },
  )
  console.log('Loading:', isLoading)
  console.log('Triples Data:', triplesData) // Ajoute ce log

  // Fetch IPFS data for each subject atom
  useEffect(() => {
    console.log('Fetching IPFS data for triples:', triplesData)
    const fetchIpfsData = async (ipfsUrl: string, atomId: string) => {
      if (ipfsUrl.startsWith('ipfs://')) {
        const ipfsHash = ipfsUrl.replace('ipfs://', '')
        const url = `https://ipfs.io/ipfs/${ipfsHash}`
        try {
          const response = await fetch(url)
          const data = await response.json()
          setIpfsDataMap((prev) => ({
            ...prev,
            [atomId]: data,
          }))
        } catch (err) {
          console.error('Error fetching IPFS data:', err)
        }
      }
    }

    if (triplesData?.triples) {
      triplesData.triples.forEach((triple) => {
        const subject = triple.subject as AtomData | undefined
        if (subject?.data) {
          fetchIpfsData(subject.data, subject.id)
        }
      })
    }
  }, [triplesData])

  // Transform triples data into hackathons
  useEffect(() => {
    if (triplesData?.triples && Object.keys(ipfsDataMap).length > 0) {
      const newHackathons = triplesData.triples.map((triple) => {
        const subject = triple.subject as AtomData | undefined
        const ipfsData = ipfsDataMap[subject?.id || '']

        // Find cash prize from subject's triples
        const cashPrize =
          subject?.as_subject_triples?.find(
            (t) => t.predicate.data === 'total cash prize',
          )?.object.data || '0'

        // Extract tags from subject's triples
        const tags =
          subject?.as_subject_triples
            ?.filter((t) => t.predicate.id === String(TAG_PREDICATE_ID))
            .map((t) => t.object.label) || []

        // Get current date for status calculation
        const now = new Date()
        const startDate = ipfsData?.startDate
          ? new Date(ipfsData.startDate)
          : now
        const endDate = ipfsData?.endDate ? new Date(ipfsData.endDate) : now

        // Calculate status
        let status: HackathonStatus = 'upcoming'
        if (now > endDate) {
          status = 'past'
        } else if (now >= startDate && now <= endDate) {
          status = 'ongoing'
        }

        return {
          title: ipfsData?.name || subject?.label || 'Unnamed Hackathon',
          description: ipfsData?.description || 'No description available',
          tags,
          cashPrize: `$${cashPrize}`,
          imgSrc:
            ipfsData?.image ||
            'https://avatars.githubusercontent.com/u/186075312?s=200&v=4',
          startDate: ipfsData?.startDate || 'TBA',
          endDate: ipfsData?.endDate || 'TBA',
          status,
          isLiked: false,
        }
      })

      console.log('New Hackathons:', newHackathons)
      setHackathons(newHackathons)
    }
  }, [triplesData, ipfsDataMap])

  const itemsPerPage = 6

  // Filter hackathons based on status and search query
  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesStatus =
      statusFilter === 'all' || hackathon.status === statusFilter
    const matchesSearch =
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredHackathons.length / itemsPerPage)
  const paginatedHackathons = filteredHackathons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Get all unique tags and their counts
  const tagCounts = hackathons
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

  console.log('Paginated Hackathons:', paginatedHackathons)

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
              title={hackathon.title}
              description={hackathon.description}
              tags={hackathon.tags}
              cashPrize={hackathon.cashPrize}
              imgSrc={hackathon.imgSrc}
              startDate={hackathon.startDate}
              endDate={hackathon.endDate}
              winners={hackathon.winners}
              isLiked={hackathon.isLiked}
              status={hackathon.status}
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
