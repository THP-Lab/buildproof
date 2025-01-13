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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [values, setValues] = useState({
      claim1: 0,
      claim2: 0,
      claim3: 0,
    })

    const handleChange = (id: string) => (value: number) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    const sliders = [
      {
        id: 'claim1',
        projectName: 'Project 1',
        votesCount: 0,
        totalEth: 0,
        value: values.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'Project 2',
        votesCount: 0,
        totalEth: 0,
        value: values.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Project 3',
        votesCount: 0,
        totalEth: 0,
        value: values.claim3,
        onChange: handleChange('claim3'),
      },
    ]

    return <MultiSlider sliders={sliders} className="w-[800px]" />
  },
} 