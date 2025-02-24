import { useEffect, useState } from 'react'

import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@remix-run/react'
import type { Domain, Fund } from 'app/utils/submit-hackathon/types'
import { isFormValid } from 'app/utils/submit-hackathon/validation'

export const useHackathonForm = () => {
  const navigate = useNavigate()
  const { authenticated, ready, user, login } = usePrivy()

  // Form states
  const [partnerName, setPartnerName] = useState('')
  const [hackathonTitle, setHackathonTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalCashPrize, setTotalCashPrize] = useState(0)
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null)
  const [selectedTicker, setSelectedTicker] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [image, setImage] = useState<string>('')

  // Authentication check
  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/login?redirectTo=/app/submit-hackathon')
    }
  }, [ready, authenticated, navigate])

  const handleTotalCashPrizeChange = (value: number, maxAmount: number) => {
    setTotalCashPrize(Math.min(value, maxAmount))
  }

  const getMaxAmount = (userAdminDomains: Domain[]) => {
    if (!selectedDomain || !selectedTicker) return 0
    const domain = userAdminDomains.find((d) => d.domainId === selectedDomain)
    const fund = domain?.funds.find((f: Fund) => f.ticker === selectedTicker)
    return fund ? parseFloat(fund.amount) : 0
  }

  const validateForm = (totalPrizeAmount: number) => {
    return isFormValid(
      partnerName,
      hackathonTitle,
      description,
      startDate,
      endDate,
      totalCashPrize,
      totalPrizeAmount,
    )
  }

  return {
    formState: {
      partnerName,
      hackathonTitle,
      description,
      startDate,
      endDate,
      totalCashPrize,
      selectedDomain,
      selectedTicker,
      showConfirmation,
      image,
    },
    setters: {
      setPartnerName,
      setHackathonTitle,
      setDescription,
      setStartDate,
      setEndDate,
      setTotalCashPrize,
      setSelectedDomain,
      setSelectedTicker,
      setShowConfirmation,
      setImage,
    },
    auth: {
      authenticated,
      ready,
      user,
      login,
    },
    handlers: {
      handleTotalCashPrizeChange,
      getMaxAmount,
      validateForm,
    },
  }
}
