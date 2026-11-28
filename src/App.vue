<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import HomeView from './components/HomeView.vue'
import InspireWellnessLibraryView from './components/InspireWellnessLibraryView.vue'
import InspireWellnessDetailView from './components/InspireWellnessDetailView.vue'
import { useAppRouter } from './composables/useAppRouter'

const { currentRoute } = useAppRouter()
</script>

<template>
  <a class="skip-link" href="#main-content">Chuyển tới nội dung chính</a>
  <SiteHeader />

  <InspireWellnessLibraryView v-if="currentRoute.name === 'inspire-wellness-library'" />
  <InspireWellnessDetailView
    v-else-if="currentRoute.name === 'inspire-wellness-detail'"
    :slug="currentRoute.slug"
  />
  <HomeView v-else />

  <SiteFooter />
</template>
