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
      slider1: 25,
      slider2: -50,
      slider3: 75,
    })

    const handleChange = (id: string) => (value: number) => {
      setValues((prev) => ({ ...prev, [id]: value }))
    }

    const sliders = [
      {
        id: 'slider1',
        label: 'Confiance',
        value: values.slider1,
        onChange: handleChange('slider1'),
      },
      {
        id: 'slider2',
        label: 'Crédibilité',
        value: values.slider2,
        onChange: handleChange('slider2'),
      },
      {
        id: 'slider3',
        label: 'Fiabilité',
        value: values.slider3,
        onChange: handleChange('slider3'),
      },
    ]

    return <MultiSlider sliders={sliders} className="w-[400px]" />
  },
} 