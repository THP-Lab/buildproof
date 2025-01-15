import React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../styles'

interface SliderItem {
  id: string
  projectName: string
  votesCount: number
  totalEth: number
  value: number
  onChange: (value: number) => void
}

interface MultiSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  sliders: SliderItem[]
}

const MultiSlider = ({ sliders, className, ...props }: MultiSliderProps) => {
  const handleValueChange = (onChange: (value: number) => void, currentId: string) => (value: number[]) => {
    const newValue = value[0]
    
    // Calculer la somme des valeurs absolues des autres sliders
    const otherValuesSum = sliders
      .filter(slider => slider.id !== currentId)
      .reduce((sum, slider) => sum + Math.abs(slider.value), 0)
    
    // Vérifier si la nouvelle valeur ferait dépasser 100% au total
    if (Math.abs(newValue) + otherValuesSum > 100) {
      // Si on dépasse, on limite la valeur tout en gardant le signe
      const maxAllowedValue = 100 - otherValuesSum
      const clampedValue = newValue > 0 ? maxAllowedValue : -maxAllowedValue
      onChange(clampedValue)
    } else {
      onChange(newValue)
    }
  }

  const formatEth = (eth: number) => eth.toFixed(3)

  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      {sliders.map((slider) => (
        <div key={slider.id} className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-sm font-medium">{slider.projectName}</span>
          </div>
          
          <div className="flex items-center gap-2 min-w-[100px]">
            <span className="text-sm text-secondary/70">{slider.votesCount} signals</span>
          </div>
          
          <div className="flex items-center gap-2 min-w-[80px]">
            <span className="text-sm text-secondary/70">{formatEth(slider.totalEth)} ETH</span>
          </div>

          <div className="flex-1 relative">
            <div className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-border/20" />
            <SliderPrimitive.Root
              className="relative flex items-center w-full h-5 touch-none"
              value={[slider.value]}
              max={100}
              min={-100}
              step={1}
              onValueChange={(value: number[]) => handleValueChange(slider.onChange, slider.id)(value)}
            >
              <SliderPrimitive.Track className="relative h-[6px] grow rounded-full">
                <div className="absolute w-full h-full rounded-full bg-border/20" />
                <SliderPrimitive.Range
                  className={cn(
                    'absolute h-full rounded-full transition-colors duration-200',
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
                  'block h-4 w-4 rounded-full border-2 bg-background transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  'hover:cursor-grab active:cursor-grabbing',
                  slider.value >= 0 ? 'border-for' : 'border-against'
                )}
              />
            </SliderPrimitive.Root>
          </div>

          <div className="min-w-[50px] text-right">
            <span className="text-sm font-medium">
              {slider.value > 0 ? '+' : ''}{slider.value}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export { MultiSlider }
export type { MultiSliderProps, SliderItem } 