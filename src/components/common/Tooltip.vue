<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createPopper, type Instance, type Placement } from '@popperjs/core';

const props = defineProps({
  placement: {
    type: String as () => Placement,
    default: 'top',
    validator: (value: string) => [
      'top', 'top-start', 'top-end', 
      'bottom', 'bottom-start', 'bottom-end', 
      'right', 'right-start', 'right-end', 
      'left', 'left-start', 'left-end'
    ].includes(value)
  },
  offsetSkid: {
    type: Number,
    default: 0
  },
  offsetDistance: {
    type: Number,
    default: 8
  },
  zIndex: {
    type: Number,
    default: 9999
  }
});

const tooltipTrigger = ref<HTMLElement | null>(null);
const tooltipContent = ref<HTMLElement | null>(null);
let popperInstance: Instance | null = null;
const showTooltip = ref(false);

function createPopperInstance() {
  if (!tooltipTrigger.value || !tooltipContent.value) return;
  
  popperInstance = createPopper(tooltipTrigger.value, tooltipContent.value, {
    placement: props.placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [props.offsetSkid, props.offsetDistance],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top', 'bottom', 'right', 'left'],
        },
      },
      {
        name: 'arrow',
        options: {
          element: '[data-popper-arrow]',
          padding: 5, // Évite que la flèche soit trop près du bord
        },
      }
    ],
  });
}

function destroyPopperInstance() {
  if (popperInstance) {
    popperInstance.destroy();
    popperInstance = null;
  }
}

function onMouseEnter() {
  showTooltip.value = true;
  // Force update de Popper après un court délai pour s'assurer que le tooltip est rendu
  setTimeout(() => {
    if (popperInstance) {
      popperInstance.update();
    }
  }, 10);
}

function onMouseLeave() {
  showTooltip.value = false;
}

watch(showTooltip, () => {
  // Si le tooltip est affiché, mettre à jour sa position
  if (showTooltip.value && popperInstance) {
    popperInstance.update();
  }
});

onMounted(() => {
  createPopperInstance();
});

onUnmounted(() => {
  destroyPopperInstance();
});
</script>

<template>
  <div class="tooltip-container">
    <div
      ref="tooltipTrigger"
      class="tooltip-trigger"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @focus="onMouseEnter"
      @blur="onMouseLeave"
    >
      <!-- Élément déclencheur (slot par défaut) -->
      <slot></slot>
    </div>

    <div
      ref="tooltipContent"
      class="tooltip-content"
      :class="{ 'is-visible': showTooltip }"
      :style="{ zIndex: zIndex }"
      v-show="showTooltip"
    >
      <!-- Contenu du tooltip -->
      <div class="tooltip-arrow" data-popper-arrow></div>
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped>
.tooltip-container {
  display: inline-block;
  position: relative;
}

.tooltip-content {
  position: absolute;
  background-color: #1f2937; /* gray-800 */
  color: white;
  border-radius: 0.25rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.tooltip-content.is-visible {
  opacity: 1;
  visibility: visible;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  background: transparent;
  z-index: 1;
  visibility: visible;
}

/* Styles spécifiques pour l'arrow selon la position */
.tooltip-content[data-popper-placement^='top'] .tooltip-arrow {
  bottom: -6px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1f2937;
}

.tooltip-content[data-popper-placement^='bottom'] .tooltip-arrow {
  top: -6px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #1f2937;
}

.tooltip-content[data-popper-placement^='left'] .tooltip-arrow {
  right: -6px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #1f2937;
}

.tooltip-content[data-popper-placement^='right'] .tooltip-arrow {
  left: -6px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #1f2937;
}
</style>