import React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../styles'

interface SliderItem {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
}

interface MultiSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  sliders: SliderItem[]
}

const MultiSlider = ({ sliders, className, ...props }: MultiSliderProps) => {
  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      {sliders.map((slider) => (
        <div key={slider.id} className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-sm text-secondary/70">{slider.label}</span>
            <span className="text-sm font-medium">
              {slider.value > 0 ? '+' : ''}
              {slider.value}%
            </span>
          </div>
          <SliderPrimitive.Root
            className="relative flex items-center w-full h-5 touch-none"
            value={[slider.value]}
            max={100}
            min={-100}
            step={1}
            onValueChange={(value: number[]) => slider.onChange(value[0])}
          >
            <SliderPrimitive.Track className="relative h-[6px] grow rounded-full">
              <div className="absolute w-full h-full rounded-full bg-border/20" />
              <SliderPrimitive.Range
                className={cn(
                  'absolute h-full rounded-full',
                  slider.value >= 0 ? 'bg-for' : 'bg-against'
                )}
                style={{
                  left: slider.value < 0 ? `${50 + slider.value / 2}%` : '50%',
                  right: slider.value > 0 ? `${50 - slider.value / 2}%` : '50%',
                }}
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className={cn(
                'block h-4 w-4 rounded-full border-2 bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50',
                slider.value >= 0 ? 'border-for' : 'border-against'
              )}
            />
          </SliderPrimitive.Root>
        </div>
      ))}
    </div>
  )
}

export { MultiSlider }
export type { MultiSliderProps, SliderItem } 