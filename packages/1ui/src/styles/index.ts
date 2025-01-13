// export theme-plugin , theme-preset, hexToHSL, themes

export * from './theme-plugin'
export * from './utils'
export * from './palette'
export { default as themePreset } from './theme-preset'

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
