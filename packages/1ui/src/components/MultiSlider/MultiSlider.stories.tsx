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

    const handleChange = (id: string) => (value: number) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    const sliders = [
      {
        id: 'claim1',
        projectName: 'Project 1',
        votesCount: 25,
        totalEth: 1.5,
        value: values.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'Project 2',
        votesCount: 45,
        totalEth: 2.8,
        value: values.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Project 3',
        votesCount: 30,
        totalEth: 1.7,
        value: values.claim3,
        onChange: handleChange('claim3'),
      },
    ]

    return <MultiSlider sliders={sliders} className="w-[800px]" />
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

    const handleChange = (id: string) => (value: number) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    const sliders = [
      {
        id: 'claim1',
        projectName: 'Project 1',
        votesCount: 150,
        totalEth: 3.5,
        value: values.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'Project 2',
        votesCount: 120,
        totalEth: 2.8,
        value: values.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Project 3',
        votesCount: 100,
        totalEth: 1.9,
        value: values.claim3,
        onChange: handleChange('claim3'),
      },
      {
        id: 'claim4',
        projectName: 'Project 4',
        votesCount: 80,
        totalEth: 1.5,
        value: values.claim4,
        onChange: handleChange('claim4'),
      },
      {
        id: 'claim5',
        projectName: 'Project 5',
        votesCount: 150,
        totalEth: 2.2,
        value: values.claim5,
        onChange: handleChange('claim5'),
      },
      {
        id: 'claim6',
        projectName: 'Project 6',
        votesCount: 100,
        totalEth: 1.8,
        value: values.claim6,
        onChange: handleChange('claim6'),
      },
      {
        id: 'claim7',
        projectName: 'Project 7',
        votesCount: 80,
        totalEth: 1.4,
        value: values.claim7,
        onChange: handleChange('claim7'),
      },
      {
        id: 'claim8',
        projectName: 'Project 8',
        votesCount: 120,
        totalEth: 2.1,
        value: values.claim8,
        onChange: handleChange('claim8'),
      },
      {
        id: 'claim9',
        projectName: 'Project 9',
        votesCount: 50,
        totalEth: 0.9,
        value: values.claim9,
        onChange: handleChange('claim9'),
      },
      {
        id: 'claim10',
        projectName: 'Project 10',
        votesCount: 50,
        totalEth: 0.8,
        value: values.claim10,
        onChange: handleChange('claim10'),
      },
    ]

    return <MultiSlider sliders={sliders} className="w-[800px]" />
  },
} 