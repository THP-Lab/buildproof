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
        projectName: 'w3up python',
        votesCount: 0,
        totalEth: 0,
        value: values.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'NexusPay',
        votesCount: 0,
        totalEth: 0,
        value: values.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Credit Market',
        votesCount: 0,
        totalEth: 0,
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
        projectName: 'w3up python',
        votesCount: 0,
        totalEth: 0,
        value: values.claim1,
        onChange: handleChange('claim1'),
      },
      {
        id: 'claim2',
        projectName: 'NexusPay',
        votesCount: 0,
        totalEth: 0,
        value: values.claim2,
        onChange: handleChange('claim2'),
      },
      {
        id: 'claim3',
        projectName: 'Credit Market',
        votesCount: 0,
        totalEth: 0,
        value: values.claim3,
        onChange: handleChange('claim3'),
      },
      {
        id: 'claim4',
        projectName: 'NeonDotFun',
        votesCount: 0,
        totalEth: 0,
        value: values.claim4,
        onChange: handleChange('claim4'),
      },
      {
        id: 'claim5',
        projectName: 'pomodoro slasher',
        votesCount: 0,
        totalEth: 0,
        value: values.claim5,
        onChange: handleChange('claim5'),
      },
      {
        id: 'claim6',
        projectName: 'Degents',
        votesCount: 0,
        totalEth: 0,
        value: values.claim6,
        onChange: handleChange('claim6'),
      },
      {
        id: 'claim7',
        projectName: 'Risk Analyzer Hook',
        votesCount: 0,
        totalEth: 0,
        value: values.claim7,
        onChange: handleChange('claim7'),
      },
      {
        id: 'claim8',
        projectName: 'LibreNews',
        votesCount: 0,
        totalEth: 0,
        value: values.claim8,
        onChange: handleChange('claim8'),
      },
      {
        id: 'claim9',
        projectName: 'AssetWand',
        votesCount: 0,
        totalEth: 0,
        value: values.claim9,
        onChange: handleChange('claim9'),
      },
      {
        id: 'claim10',
        projectName: 'Assisted buy',
        votesCount: 0,
        totalEth: 0,
        value: values.claim10,
        onChange: handleChange('claim10'),
      },
    ]

    return <MultiSlider sliders={sliders} className="w-[800px]" />
  },
} 