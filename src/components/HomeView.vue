<script setup lang="ts">
import { ref } from 'vue'
import HeroSection from './HeroSection.vue'
import VideoSeriesSection from './VideoSeriesSection.vue'
import OnStageSection from './OnStageSection.vue'
import TalksSection from './TalksSection.vue'
import FeaturedEventsSection from './FeaturedEventsSection.vue'
import MediaNetworkSection from './MediaNetworkSection.vue'
import ContactSection from './ContactSection.vue'
import { useHeroVideoHandoff } from '../composables/useHeroVideoHandoff'

const mainRef = ref<HTMLElement | null>(null)
useHeroVideoHandoff(mainRef)
</script>

<template>
  <main id="main-content" ref="mainRef">
    <HeroSection />
    <VideoSeriesSection />
    <OnStageSection />
    <TalksSection />
    <FeaturedEventsSection />
    <MediaNetworkSection />
    <ContactSection />
  </main>
</template>

