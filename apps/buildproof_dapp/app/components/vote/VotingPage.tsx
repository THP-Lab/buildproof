import { useEffect, useMemo, useRef, useState } from 'react'

import { ClaimPosition } from '@0xintuition/buildproof_ui'
import type { GetTriplesWithPositionsQuery } from '@0xintuition/graphql'

import { useFetcher } from '@remix-run/react'
import { Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { formatUnits, parseEther } from 'viem'

import { useBatchDepositTriple } from '../../lib/hooks/useBatchDepositTriple'
import { useVerifyAttestor } from '../../lib/hooks/useVerifyAttestor'
import { calculateStakes } from '../../lib/utils/calculateStakes'
import { calculateStakeValue } from './CalcuateStakeValue'
import {
  handleSliderChange as handleSliderChangeWithValidation,
  resetAllSliders as resetAllSlidersWithValidation,
  resetSingleSlider as resetSingleSliderWithValidation,
} from './handleSliderChange'
import { sortItems } from './sortItems'
import type { SupportedCurrency, VoteItem } from './types'
import { VotingPageView } from './VotingPageView'

interface VotingPageProps {
  triplesData: GetTriplesWithPositionsQuery | undefined
  userAddress: string | undefined
  onSearch: (search: {
    subject: string | null
    predicate: string | null
    object: string | null
  }) => void
  currentSearch: {
    subject: string | null
    predicate: string | null
    object: string | null
  }
}

interface EthPriceResponse {
  price: string
}

interface VaultWithSharePrice {
  total_shares: string
  position_count: number
  current_share_price: string
  positions: Array<{
    shares: string
    account?: {
      id: string
      label: string
      image?: string
    } | null
  }>
}

interface TripleWithVaults {
  id: string
  vault_id: string
  counter_vault_id: string
  subject: {
    id: string
    label: string
    image?: string
  }
  predicate: {
    id: string
    label: string
    image?: string
  }
  object: {
    id: string
    label: string
    image?: string
  }
  vault: VaultWithSharePrice
  counter_vault: VaultWithSharePrice
}

export const VotingPage = ({
  triplesData,
  userAddress,
  onSearch,
  currentSearch,
}: VotingPageProps) => {
  const [selectedTab, setSelectedTab] = useState('voting')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currency, setCurrency] = useState<SupportedCurrency>('ETH')

  // Calculate total existing positions and initialize states
  const [ethAmount, setEthAmount] = useState(() => {
    if (!triplesData?.triples) return '0.001'

    // Calculer le total des positions existantes en ETH
    const totalPositions = triplesData.triples.reduce((total, triple) => {
      const typedTriple = triple as unknown as TripleWithVaults
      const userVaultPosition = typedTriple.vault?.positions?.length
        ? typedTriple.vault.positions[0]
        : undefined
      const userCounterVaultPosition = typedTriple.counter_vault?.positions
        ?.length
        ? typedTriple.counter_vault.positions[0]
        : undefined

      // Calculer la valeur en ETH pour la position FOR
      const vaultValue =
        userVaultPosition && typedTriple.vault?.current_share_price
          ? Number(
              formatUnits(
                BigInt(
                  calculateStakeValue(
                    userVaultPosition.shares,
                    typedTriple.vault.current_share_price,
                  ),
                ),
                18,
              ),
            )
          : 0

      // Calculer la valeur en ETH pour la position AGAINST
      const counterVaultValue =
        userCounterVaultPosition &&
        typedTriple.counter_vault?.current_share_price
          ? Number(
              formatUnits(
                BigInt(
                  calculateStakeValue(
                    userCounterVaultPosition.shares,
                    typedTriple.counter_vault.current_share_price,
                  ),
                ),
                18,
              ),
            )
          : 0

      return total + vaultValue + counterVaultValue
    }, 0)

    return totalPositions > 0 ? totalPositions.toString() : '0.001'
  })

  // Calculate initial slider values
  const initialSliderValues = (() => {
    if (!triplesData?.triples) return {}

    const totalEth = Number(ethAmount)
    if (totalEth === 0) return {}

    return triplesData.triples.reduce(
      (values, triple) => {
        const typedTriple = triple as unknown as TripleWithVaults
        const userVaultPosition = typedTriple.vault?.positions?.[0]
        const userCounterVaultPosition =
          typedTriple.counter_vault?.positions?.[0]

        // Calculer la valeur en ETH pour la position FOR
        const vaultValue =
          userVaultPosition && typedTriple.vault?.current_share_price
            ? Number(
                formatUnits(
                  BigInt(
                    calculateStakeValue(
                      userVaultPosition.shares,
                      typedTriple.vault.current_share_price,
                    ),
                  ),
                  18,
                ),
              )
            : 0

        // Calculer la valeur en ETH pour la position AGAINST
        const counterVaultValue =
          userCounterVaultPosition &&
          typedTriple.counter_vault?.current_share_price
            ? Number(
                formatUnits(
                  BigInt(
                    calculateStakeValue(
                      userCounterVaultPosition.shares,
                      typedTriple.counter_vault.current_share_price,
                    ),
                  ),
                  18,
                ),
              )
            : 0

        if (vaultValue > 0) {
          values[typedTriple.id] = (vaultValue / totalEth) * 100
        } else if (counterVaultValue > 0) {
          values[typedTriple.id] = -(counterVaultValue / totalEth) * 100
        }

        return values
      },
      {} as { [key: string]: number },
    )
  })()

  const [sliderValues, setSliderValues] = useState(initialSliderValues)
  const [debouncedSliderValues, setDebouncedSliderValues] =
    useState(initialSliderValues)

  const [displayAmount, setDisplayAmount] = useState(ethAmount)
  const [ethPrice, setEthPrice] = useState('0')

  // État pour les valeurs des sliders
  const [sortedItemIds, setSortedItemIds] = useState<string[]>([])

  // Create a subject for slider changes
  const sliderSubject = useRef(new Subject<{ id: string; value: number }>())

  // Fetch ETH price
  const ethPriceFetcher = useFetcher<EthPriceResponse>()

  useEffect(() => {
    // Initial fetch only
    ethPriceFetcher.load('/resources/eth-price')
  }, [])

  useEffect(() => {
    if (ethPriceFetcher.data?.price) {
      setEthPrice(ethPriceFetcher.data.price)
    }
  }, [ethPriceFetcher.data])
  const convertValue = (
    value: string,
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency,
  ): string => {
    if (!value) return '0'
    if (fromCurrency === toCurrency) return value
    const numValue = Number(value)

    if (fromCurrency === 'ETH' && toCurrency === '$') {
      const result = numValue * Number(ethPrice)
      return isNaN(result) ? '0' : result.toString()
    } else {
      const result = numValue / Number(ethPrice)
      return isNaN(result) ? '0' : result.toString()
    }
  }

  // Transform the GraphQL data into our VoteItem format
  const data: VoteItem[] = useMemo(() => {
    if (!triplesData?.triples) return []

    let filteredTriples = triplesData.triples

    return filteredTriples.map((triple: any) => {
      const typedTriple = triple as unknown as TripleWithVaults
      const userVaultPosition = typedTriple.vault?.positions?.[0]
      const userCounterVaultPosition = typedTriple.counter_vault?.positions?.[0]

      const totalShares = (
        Number(typedTriple.vault?.total_shares ?? 0) +
        Number(typedTriple.counter_vault?.total_shares ?? 0)
      ).toString()
      const vaultShares = typedTriple.vault?.total_shares ?? '0'
      const counterVaultShares = typedTriple.counter_vault?.total_shares ?? '0'

      // Récupérer les positions de l'utilisateur sans valeur par défaut
      const userVaultShares = userVaultPosition?.shares
      const userCounterVaultShares = userCounterVaultPosition?.shares

      // Déterminer la direction et le montant de la position seulement si on a des shares
      let positionDirection
      let userPosition
      let sliderInitialValue = 0

      if (userCounterVaultShares && BigInt(userCounterVaultShares) > 0n) {
        positionDirection = ClaimPosition.claimAgainst
        userPosition = userCounterVaultShares
        if (Number(ethAmount) > 0) {
          const counterVaultAmount = Number(
            formatUnits(BigInt(userCounterVaultShares), 18),
          )
          sliderInitialValue = -((counterVaultAmount / Number(ethAmount)) * 100)
        }
      } else if (userVaultShares && BigInt(userVaultShares) > 0n) {
        positionDirection = ClaimPosition.claimFor
        userPosition = userVaultShares
        if (Number(ethAmount) > 0) {
          const vaultAmount = Number(formatUnits(BigInt(userVaultShares), 18))
          sliderInitialValue = (vaultAmount / Number(ethAmount)) * 100
        }
      }

      return {
        id: typedTriple.id,
        numPositionsFor: typedTriple.vault?.position_count ?? 0,
        numPositionsAgainst: typedTriple.counter_vault?.position_count ?? 0,
        totalTVL: totalShares,
        tvlFor: vaultShares,
        tvlAgainst: counterVaultShares,
        currency: currency,
        subject: typedTriple.subject?.label ?? '',
        predicate: typedTriple.predicate?.label ?? '',
        object: typedTriple.object?.label ?? '',
        votesCount:
          (typedTriple.vault?.position_count ?? 0) +
          (typedTriple.counter_vault?.position_count ?? 0),
        totalEth: Number(totalShares),
        userPosition,
        positionDirection,
        vault: {
          current_share_price: typedTriple.vault?.current_share_price ?? '0',
        },
        counter_vault: {
          current_share_price:
            typedTriple.counter_vault?.current_share_price ?? '0',
        },
      }
    })
  }, [triplesData, currency, ethPrice, ethAmount])

  // Set up the subscription when the component mounts
  useEffect(() => {
    const subscription = sliderSubject.current
      .pipe(
        distinctUntilChanged(
          (prev, curr) => prev.id === curr.id && prev.value === curr.value,
        ),
      )
      .subscribe(({ id, value }) => {
        setDebouncedSliderValues((prev) => ({
          ...prev,
          [id]: value,
        }))
      })

    return () => subscription.unsubscribe()
  }, [])

  // Effect to sort items when debounced values change
  useEffect(() => {
    const sortedItems = sortItems(data, debouncedSliderValues)
    const sortedIds = sortedItems.map((item) => item.id)
    setSortedItemIds(sortedIds)
  }, [debouncedSliderValues, data])

  // Use sorted IDs to maintain order
  const sortedItems = useMemo(() => {
    return sortedItemIds
      .map((id) => data.find((item) => item.id === id))
      .filter(Boolean) as VoteItem[]
  }, [data, sortedItemIds])

  // Appliquer la pagination sur les données triées
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return sortedItems.slice(startIndex, endIndex)
  }, [sortedItems, currentPage, rowsPerPage])

  // Calculer le nombre total de pages basé sur les items triés
  const totalPages = useMemo(
    () => Math.ceil(sortedItems.length / rowsPerPage),
    [sortedItems.length, rowsPerPage],
  )

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'voting', label: 'Voting' },
    { value: 'results', label: 'Results' },
  ]

  const { batchDepositTriple, isPending } = useBatchDepositTriple()
  const { verifyAndApproveAttestor, isCheckingApproval, approvalError } =
    useVerifyAttestor()

  // Update display amount when currency changes
  useEffect(() => {
    setDisplayAmount(convertValue(ethAmount, 'ETH', currency))
  }, [currency, ethAmount])

  // Calculate minimum amount from user positions
  const minimumAmount = useMemo(() => {
    if (!triplesData?.triples) return 0

    return triplesData.triples.reduce((total, triple) => {
      const typedTriple = triple as unknown as TripleWithVaults
      const userVaultPosition = typedTriple.vault?.positions?.[0]
      const userCounterVaultPosition = typedTriple.counter_vault?.positions?.[0]
      const vaultAmount = userVaultPosition
        ? Number(formatUnits(BigInt(userVaultPosition.shares), 18))
        : 0
      const counterVaultAmount = userCounterVaultPosition
        ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18))
        : 0
      return total + vaultAmount + counterVaultAmount
    }, 0)
  }, [triplesData])

  // Handle input amount change
  const handleAmountChange = (value: string) => {
    const newAmount =
      currency === 'ETH' ? value : convertValue(value, '$', 'ETH')
    const newAmountNum = Number(newAmount)

    // Don't allow amount below minimum
    if (newAmountNum < minimumAmount) {
      const minAmountStr = minimumAmount.toString()
      if (currency === 'ETH') {
        setEthAmount(minAmountStr)
        setDisplayAmount(minAmountStr)
      } else {
        setDisplayAmount(convertValue(minAmountStr, 'ETH', '$'))
        setEthAmount(minAmountStr)
      }
      return
    }

    const oldAmount = ethAmount

    // Update the amounts
    if (currency === 'ETH') {
      setEthAmount(value)
      setDisplayAmount(value)
    } else {
      setDisplayAmount(value)
      setEthAmount(newAmount)
    }

    // If we have existing positions, adjust their percentages proportionally
    if (Object.keys(sliderValues).length > 0) {
      const ratio = Number(oldAmount) / newAmountNum
      const newSliderValues = Object.entries(sliderValues).reduce(
        (acc, [id, value]) => {
          // Adjust each percentage proportionally
          const newValue = Math.round(value * ratio * 100) / 100
          acc[id] = newValue
          return acc
        },
        {} as { [key: string]: number },
      )

      setSliderValues(newSliderValues)
      setDebouncedSliderValues(newSliderValues)
    }
  }

  // Calculate total based on immediate values for UI feedback
  const totalAbsoluteValue = useMemo(() => {
    const total = Object.values(sliderValues).reduce(
      (sum, value) => sum + Math.abs(value),
      0,
    )
    return Math.round(total * 100) / 100
  }, [sliderValues])

  // Check if total is exactly 100
  const canSubmit = totalAbsoluteValue === 100

  const toggleCurrency = () => {
    setCurrency((prev) => {
      const newCurrency = prev === 'ETH' ? '$' : 'ETH'
      setDisplayAmount(convertValue(ethAmount, 'ETH', newCurrency))
      return newCurrency
    })
  }

  // Handle submit function
  const handleSubmit = async () => {
    if (!userAddress || !ethAmount || !triplesData?.triples) return

    try {
      // Vérifier d'abord l'approbation de l'attestor
      console.log('Verifying attestor approval...')
      const isAttestorApproved = await verifyAndApproveAttestor()
      if (!isAttestorApproved) {
        console.error('Attestor approval failed:', approvalError)
        return
      }
      console.log('Attestor approved, proceeding with deposit...')

      // Calculer le montant total initial
      const initialTotal = triplesData.triples.reduce((total, triple) => {
        const typedTriple = triple as unknown as TripleWithVaults
        const userVaultPosition = typedTriple.vault?.positions?.[0]
        const userCounterVaultPosition =
          typedTriple.counter_vault?.positions?.[0]
        const vaultAmount = userVaultPosition
          ? Number(formatUnits(BigInt(userVaultPosition.shares), 18))
          : 0
        const counterVaultAmount = userCounterVaultPosition
          ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18))
          : 0
        return total + vaultAmount + counterVaultAmount
      }, 0)

      // Calculer le montant à répartir (différence entre nouvel input et input initial)
      const amountToDistribute = Number(ethAmount) - initialTotal

      // Calculer le pourcentage total initial
      const totalInitialPercentage = triplesData.triples.reduce(
        (total, triple) => {
          const typedTriple = triple as unknown as TripleWithVaults
          const userVaultPosition = typedTriple.vault?.positions?.[0]
          const userCounterVaultPosition =
            typedTriple.counter_vault?.positions?.[0]
          const vaultAmount = userVaultPosition
            ? Number(formatUnits(BigInt(userVaultPosition.shares), 18))
            : 0
          const counterVaultAmount = userCounterVaultPosition
            ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18))
            : 0
          const totalAmount = vaultAmount + counterVaultAmount
          return (
            total +
            (totalAmount > 0 ? (totalAmount / Number(ethAmount)) * 100 : 0)
          )
        },
        0,
      )

      // Calculer le pourcentage restant disponible
      const remainingPercentage = 100 - totalInitialPercentage

      // Transform triples to include percentage from sliderValues and calculate exact amounts
      const triplesWithPercentages = triplesData.triples
        .map((triple) => {
          const typedTriple = triple as unknown as TripleWithVaults
          const userVaultPosition = typedTriple.vault?.positions?.[0]
          const userCounterVaultPosition =
            typedTriple.counter_vault?.positions?.[0]

          const sliderValue = sliderValues[typedTriple.id] || 0
          const truncatedPercentage = Math.floor(Math.abs(sliderValue))

          // Calculer le pourcentage initial de ce claim
          const vaultAmount = userVaultPosition
            ? Number(formatUnits(BigInt(userVaultPosition.shares), 18))
            : 0
          const counterVaultAmount = userCounterVaultPosition
            ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18))
            : 0
          const totalAmount = vaultAmount + counterVaultAmount
          const initialPercentage =
            totalAmount > 0 ? (totalAmount / Number(ethAmount)) * 100 : 0

          // Si le pourcentage a changé, calculer le montant à ajouter
          if (truncatedPercentage > initialPercentage) {
            // Calculer quelle part du pourcentage restant ce claim prend
            const percentageOfRemaining =
              (truncatedPercentage - initialPercentage) / remainingPercentage
            // Calculer le montant à ajouter basé sur cette part
            const amountToAdd = amountToDistribute * percentageOfRemaining

            return {
              id: typedTriple.id,
              vault_id: typedTriple.vault_id,
              counter_vault_id: typedTriple.counter_vault_id,
              percentage:
                sliderValue > 0 ? truncatedPercentage : -truncatedPercentage,
              amountToAdd: parseEther(amountToAdd.toFixed(18)),
            } as const
          }
          return null
        })
        .filter(
          (triple): triple is NonNullable<typeof triple> => triple !== null,
        )

      // Pas besoin de calculateStakes puisqu'on a déjà les montants exacts
      const stakes = {
        ids: triplesWithPercentages.map((t) =>
          BigInt(t.percentage > 0 ? t.vault_id : t.counter_vault_id),
        ),
        values: triplesWithPercentages.map((t) => t.amountToAdd),
      }

      // Calculate the total value to send (sum of stakes)
      const totalValueToSend = stakes.values.reduce(
        (sum, value) => sum + value,
        0n,
      )

      // Use hardcoded attestor address
      const attestorAddress = '0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36'

      // Submit all stakes in one transaction
      if (stakes.ids.length > 0) {
        await batchDepositTriple(
          {
            receiver: userAddress as `0x${string}`,
            ids: stakes.ids,
            values: stakes.values,
            attestorAddress: attestorAddress as `0x${string}`,
          },
          { value: totalValueToSend },
        )
      }

      // Handle success (e.g., show notification, reset form, etc.)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  const handleResetSlider = (id: string) => {
    resetSingleSliderWithValidation(id, setSliderValues)
    // Déclencher le tri comme pour les changements de slider
    sliderSubject.current.next({ id, value: 0 })
  }

  const [searchValues, setSearchValues] = useState<{
    subject: string | null
    predicate: string | null
    object: string | null
  }>({
    subject: null,
    predicate: null,
    object: null,
  })

  const handleSearch = (values: {
    subject: string | null
    predicate: string | null
    object: string | null
  }) => {
    setSearchValues(values)
    onSearch(values)
  }

  return (
    <VotingPageView
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      tabs={tabs}
      ethAmount={displayAmount}
      setEthAmount={handleAmountChange}
      totalAbsoluteValue={totalAbsoluteValue}
      resetAllSliders={() => resetAllSlidersWithValidation(setSliderValues)}
      sortedItems={paginatedItems}
      sliderValues={sliderValues}
      resetSingleSlider={handleResetSlider}
      handleSliderChange={(id, value) =>
        handleSliderChangeWithValidation(
          id,
          value,
          sliderValues,
          setSliderValues,
        )
      }
      handleSliderCommit={(id, value) => {
        handleSliderChangeWithValidation(
          id,
          value,
          sliderValues,
          setSliderValues,
        )
        sliderSubject.current.next({ id, value })
      }}
      canSubmit={canSubmit}
      handleSubmit={handleSubmit}
      currentPage={currentPage}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage.toString()}
      setRowsPerPage={(value: string) => setRowsPerPage(Number(value))}
      setCurrentPage={setCurrentPage}
      data={data}
      currency={currency}
      onCurrencyToggle={toggleCurrency}
      setDebouncedSliderValues={setDebouncedSliderValues}
      userAddress={userAddress || ''}
      triplesData={triplesData as any}
      ethPrice={ethPrice}
      onSearch={onSearch}
      searchValues={currentSearch}
    />
  )
}
