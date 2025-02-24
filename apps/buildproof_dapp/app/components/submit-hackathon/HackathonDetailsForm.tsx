import React from 'react'

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@0xintuition/buildproof_ui'

import { ipfsToHttpUrl, isIpfsUrl, uploadToPinata } from '@lib/utils/pinata'
import {
  formatDateForInput,
  getTomorrowDate,
} from '@routes/app+/submit-hackathon/utils/formatters'
import type { Domain, Fund } from '@routes/app+/submit-hackathon/utils/types'

interface HackathonDetailsFormProps {
  formState: {
    partnerName: string
    hackathonTitle: string
    description: string
    startDate: string
    endDate: string
    totalCashPrize: number
    selectedDomain: number | null
    selectedTicker: string
    image: string
  }
  setters: {
    setPartnerName: (value: string) => void
    setHackathonTitle: (value: string) => void
    setDescription: (value: string) => void
    setStartDate: (value: string) => void
    setEndDate: (value: string) => void
    setTotalCashPrize: (value: number) => void
    setSelectedDomain: (value: number | null) => void
    setSelectedTicker: (value: string) => void
    setImage: (value: string) => void
  }
  userAdminDomains: Domain[]
  maxAmount: number
}

export const HackathonDetailsForm: React.FC<HackathonDetailsFormProps> = ({
  formState,
  setters,
  userAdminDomains,
  maxAmount,
}) => {
  const tomorrow = getTomorrowDate(new Date())
  const minEndDate = formState.startDate
    ? new Date(
        new Date(formState.startDate).getTime() + 7 * 24 * 60 * 60 * 1000,
      )
    : tomorrow

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const ipfsUrl = await uploadToPinata(file)
        setters.setImage(ipfsUrl)
      } catch (error) {
        console.error('Erreur lors du téléversement:', error)
        alert("Erreur lors du téléversement de l'image")
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Submit a New Hackathon</h1>

      <Input
        startAdornment="Partner Name"
        value={formState.partnerName}
        onChange={(e) => setters.setPartnerName(e.target.value)}
        required
      />

      <Input
        startAdornment="Hackathon Title"
        value={formState.hackathonTitle}
        onChange={(e) => setters.setHackathonTitle(e.target.value)}
        required
      />

      <div className="flex flex-col">
        <label className="mb-1">Description</label>
        <Textarea
          value={formState.description}
          onChange={(e) => setters.setDescription(e.target.value)}
          placeholder="Enter a brief description of the hackathon"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1">Hackathon Image (optional)</label>
        <Input type="file" accept="image/*" onChange={handleImageChange} />
        {formState.image && (
          <img
            src={
              isIpfsUrl(formState.image)
                ? ipfsToHttpUrl(formState.image)
                : formState.image
            }
            alt="Hackathon preview"
            className="mt-2 max-w-xs rounded-lg"
          />
        )}
      </div>

      <Input
        type="date"
        startAdornment="Start Date"
        value={formState.startDate}
        onChange={(e) => setters.setStartDate(e.target.value)}
        required
        min={formatDateForInput(tomorrow)}
      />

      <Input
        type="date"
        startAdornment="End Date"
        value={formState.endDate}
        onChange={(e) => setters.setEndDate(e.target.value)}
        required
        min={formatDateForInput(minEndDate)}
        disabled={!formState.startDate}
      />

      <Select
        value={formState.selectedDomain?.toString()}
        onValueChange={(value) => {
          setters.setSelectedDomain(parseInt(value))
          setters.setSelectedTicker('')
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Domain" />
        </SelectTrigger>
        <SelectContent>
          {userAdminDomains.length > 0 ? (
            userAdminDomains.map((domain) => (
              <SelectItem
                key={domain.domainId}
                value={domain.domainId.toString()}
              >
                {domain.domainName}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-domains" disabled>
              No domains available
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {formState.selectedDomain && (
        <Select
          value={formState.selectedTicker}
          onValueChange={setters.setSelectedTicker}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Currency" />
          </SelectTrigger>
          <SelectContent>
            {userAdminDomains
              .find((d) => d.domainId === formState.selectedDomain)
              ?.funds.filter((f: Fund) => parseFloat(f.amount) > 0)
              .map((fund: Fund) => (
                <SelectItem key={fund.ticker} value={fund.ticker}>
                  {fund.ticker}
                </SelectItem>
              )) || (
              <SelectItem value="no-currencies" disabled>
                No currencies available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}

      <Input
        startAdornment="Total Cash Prize"
        type="number"
        value={formState.totalCashPrize.toString()}
        onChange={(e) =>
          setters.setTotalCashPrize(
            Math.min(parseFloat(e.target.value), maxAmount),
          )
        }
        placeholder="Enter total cash prize amount"
        required
        endAdornment={formState.selectedTicker}
        max={maxAmount}
        disabled={!formState.selectedDomain || !formState.selectedTicker}
      />
    </div>
  )
}
