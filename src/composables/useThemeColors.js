// src/composables/useThemeColors.js

import { computed } from 'vue'
import { colorTokens } from '@/theme/colorTokens.js'

/**
 * Returns color classes and style values based on the provided theme type
 * Falls back to 'neutral' if type is invalid
 *
 * @param {string} type - The theme type (e.g., 'success', 'error', 'primary')
 * @returns {Object} - { bg, text, border, ring, hoverText, hoverBg, backdrop }
 */
export function useThemeColors(type = 'neutral') {
  const theme = computed(() => colorTokens[type] || colorTokens.neutral)

  const hoverText = computed(() => `hover:${theme.value.text || 'text-gray-700'}`)
  const hoverBg = computed(() => colorTokens?.buttonHoverBg || 'hover:bg-gray-200')
  const backdrop = computed(() => colorTokens.backdropGradient?.[type] || 'linear-gradient(to right, #f8fafc, #e2e8f0)')

  return {
    bg: theme.value.bg,
    text: theme.value.text,
    border: theme.value.border,
    ring: theme.value.ring,
    hoverText,
    hoverBg,
    backdrop
  }
}
