<script setup lang="ts">
import { ref } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/HeroSection.vue'
import VideoSeriesSection from './components/VideoSeriesSection.vue'
import OnStageSection from './components/OnStageSection.vue'
import TalksSection from './components/TalksSection.vue'
import FeaturedEventsSection from './components/FeaturedEventsSection.vue'
import MediaNetworkSection from './components/MediaNetworkSection.vue'
import ContactSection from './components/ContactSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useHeroVideoHandoff } from './composables/useHeroVideoHandoff'

const mainRef = ref<HTMLElement | null>(null)
useHeroVideoHandoff(mainRef)
</script>

<template>
  <a class="skip-link" href="#hero">Chuyển tới nội dung chính</a>
  <SiteHeader />
  <main ref="mainRef">
    <HeroSection />
    <VideoSeriesSection />
    <OnStageSection />
    <TalksSection />
    <FeaturedEventsSection />
    <MediaNetworkSection />
    <ContactSection />
  </main>
  <SiteFooter />
</template>
