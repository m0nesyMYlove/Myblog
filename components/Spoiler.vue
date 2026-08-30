<template>
  <span
    class="spoiler-advanced"
    :class="{
      'is-revealed': isRevealed,
      'is-hovering': isHovering,
      'permanent-reveal': isPermanentReveal
    }"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :title="tooltipText"
  >
    <span class="spoiler-content">
      <slot />
    </span>
    <span v-if="!isPermanentReveal" class="spoiler-overlay">
      <span class="overlay-text">•••</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const isRevealed = ref(false)
const isHovering = ref(false)
const isPermanentReveal = ref(false)

interface Props {
  revealOn?: 'click' | 'hover' | 'both'
  blurIntensity?: number
  animationDuration?: number
  permanentAfterClick?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  revealOn: 'both',
  blurIntensity: 4,
  animationDuration: 0.3,
  permanentAfterClick: true,
  tooltip: '点击或悬停查看'
})

const tooltipText = computed(() => {
  if (props.tooltip) return props.tooltip
  return props.revealOn === 'both'
    ? '点击或悬停查看'
    : props.revealOn === 'click'
      ? '点击查看'
      : '悬停查看'
})

const shouldReveal = computed(() => {
  if (isPermanentReveal.value) return true
  if (props.revealOn === 'both') return isRevealed.value || isHovering.value
  if (props.revealOn === 'click') return isRevealed.value
  if (props.revealOn === 'hover') return isHovering.value
  return false
})

watch(shouldReveal, (newVal) => {
  isRevealed.value = newVal
})

const handleClick = () => {
  if (props.revealOn === 'click' || props.revealOn === 'both') {
    if (props.permanentAfterClick) {
      isPermanentReveal.value = true
    } else {
      isRevealed.value = !isRevealed.value
    }
  }
}

const handleMouseEnter = () => {
  if (props.revealOn === 'hover' || props.revealOn === 'both') {
    isHovering.value = true
  }
}

const handleMouseLeave = () => {
  if (props.revealOn === 'hover' || props.revealOn === 'both') {
    isHovering.value = false
    if (!isPermanentReveal.value) {
      isRevealed.value = false
    }
  }
}

defineExpose({
  reveal: () => { isRevealed.value = true; isPermanentReveal.value = true },
  hide: () => { isRevealed.value = false; isPermanentReveal.value = false },
  toggle: () => {
    isPermanentReveal.value = !isPermanentReveal.value
    isRevealed.value = isPermanentReveal.value
  }
})
</script>

<style scoped>
.spoiler-advanced {
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin: 0 2px;
  border-radius: 4px;
  transition: all v-bind(animationDuration + 's') ease;
  overflow: hidden;
}

.spoiler-content {
  display: inline-block;
  padding: 2px 4px;
  transition: all v-bind(animationDuration + 's') ease;
}

.spoiler-advanced:not(.is-revealed) .spoiler-content {
  filter: blur(v-bind(blurIntensity + 'px'));
  opacity: 0.7;
  color: transparent;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
}

.spoiler-advanced.is-revealed .spoiler-content {
  filter: blur(0);
  opacity: 1;
  color: inherit;
  text-shadow: none;
}

.spoiler-advanced.is-hovering:not(.permanent-reveal) .spoiler-content {
  filter: blur(calc(v-bind(blurIntensity + 'px') / 2));
  opacity: 0.85;
}

.spoiler-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
  border-radius: 4px;
  transition: all v-bind(animationDuration + 's') ease;
  opacity: 1;
  pointer-events: none;
}

.spoiler-advanced.is-revealed .spoiler-overlay,
.spoiler-advanced.permanent-reveal .spoiler-overlay {
  opacity: 0;
  transform: scale(0.8);
}

.overlay-text {
  font-size: 0.7em;
  color: rgba(0, 0, 0, 0.6);
  font-weight: bold;
  letter-spacing: 1px;
}

.spoiler-advanced.is-hovering:not(.permanent-reveal) .spoiler-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.15));
}

.spoiler-advanced:active .spoiler-overlay {
  transform: scale(0.95);
  transition-duration: 0.1s;
}

.spoiler-advanced.permanent-reveal {
  cursor: default;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 1px 3px;
}
</style>
