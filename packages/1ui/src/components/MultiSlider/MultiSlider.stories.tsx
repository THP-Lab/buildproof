import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { MultiSlider } from './MultiSlider'

const meta: Meta = {
  title: 'Components/MultiSlider',
  component: MultiSlider,
}

export default meta

type Story = StoryObj<typeof MultiSlider>

export const BasicUsage: Story = {
  render: () => {
    const [values, setValues] = useState({
      claim1: 0,
      claim2: 0,
      claim3: 0,
    })
    const [validatedValues, setValidatedValues] = useState({
      claim1: 0,
      claim2: 0,
      claim3: 0,
    })

    const handleChange = (id: string) => (value: number) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    const handleValidate = () => {
      setValidatedValues(values)
    }

    const unsortedSliders = [
      {
        id: 'claim1',
        projectName: 'Ethereum Foundation',
        votesCount: 25,
        totalEth: 1.5,
        value: values.claim1,
        validatedValue: validatedValues.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'Uniswap',
        votesCount: 45,
        totalEth: 2.8,
        value: values.claim2,
        validatedValue: validatedValues.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Chainlink',
        votesCount: 30,
        totalEth: 1.7,
        value: values.claim3,
        validatedValue: validatedValues.claim3,
        onChange: handleChange('claim3'),
      },
    ]

    const sliders = [...unsortedSliders].sort((a, b) => b.validatedValue - a.validatedValue)

    return (
      <div>
        <MultiSlider sliders={sliders} className="w-[800px]" />
        <button 
          onClick={handleValidate}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Valider les votes
        </button>
      </div>
    )
  },
}

export const TenProjects: Story = {
  render: () => {
    const [values, setValues] = useState({
      claim1: 0,
      claim2: 0,
      claim3: 0,
      claim4: 0,
      claim5: 0,
      claim6: 0,
      claim7: 0,
      claim8: 0,
      claim9: 0,
      claim10: 0,
    })
    const [validatedValues, setValidatedValues] = useState({
      claim1: 0,
      claim2: 0,
      claim3: 0,
      claim4: 0,
      claim5: 0,
      claim6: 0,
      claim7: 0,
      claim8: 0,
      claim9: 0,
      claim10: 0,
    })

    const handleChange = (id: string) => (value: number) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    const handleValidate = () => {
      setValidatedValues(values)
    }

    const unsortedSliders = [
      {
        id: 'claim1',
        projectName: 'Ethereum Foundation',
        votesCount: 150,
        totalEth: 3.5,
        value: values.claim1,
        validatedValue: validatedValues.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'Uniswap',
        votesCount: 120,
        totalEth: 2.8,
        value: values.claim2,
        validatedValue: validatedValues.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Chainlink',
        votesCount: 100,
        totalEth: 1.9,
        value: values.claim3,
        validatedValue: validatedValues.claim3,
        onChange: handleChange('claim3'),
      },
      {
        id: 'claim4',
        projectName: 'Aave',
        votesCount: 80,
        totalEth: 1.5,
        value: values.claim4,
        validatedValue: validatedValues.claim4,
        onChange: handleChange('claim4'),
      },
      {
        id: 'claim5',
        projectName: 'MakerDAO',
        votesCount: 150,
        totalEth: 2.2,
        value: values.claim5,
        validatedValue: validatedValues.claim5,
        onChange: handleChange('claim5'),
      },
      {
        id: 'claim6',
        projectName: 'Compound',
        votesCount: 100,
        totalEth: 1.8,
        value: values.claim6,
        validatedValue: validatedValues.claim6,
        onChange: handleChange('claim6'),
      },
      {
        id: 'claim7',
        projectName: 'OpenSea',
        votesCount: 80,
        totalEth: 1.4,
        value: values.claim7,
        validatedValue: validatedValues.claim7,
        onChange: handleChange('claim7'),
      },
      {
        id: 'claim8',
        projectName: 'dYdX',
        votesCount: 120,
        totalEth: 2.1,
        value: values.claim8,
        validatedValue: validatedValues.claim8,
        onChange: handleChange('claim8'),
      },
      {
        id: 'claim9',
        projectName: 'Curve',
        votesCount: 50,
        totalEth: 0.9,
        value: values.claim9,
        validatedValue: validatedValues.claim9,
        onChange: handleChange('claim9'),
      },
      {
        id: 'claim10',
        projectName: 'Lido',
        votesCount: 50,
        totalEth: 0.8,
        value: values.claim10,
        validatedValue: validatedValues.claim10,
        onChange: handleChange('claim10'),
      },
    ]

    const sliders = [...unsortedSliders].sort((a, b) => b.validatedValue - a.validatedValue)

    return (
      <div>
        <MultiSlider sliders={sliders} className="w-[800px]" />
        <button 
          onClick={handleValidate}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Valider les votes
        </button>
      </div>
    )
  },
} 