<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'
import { FOOTER_CONTENT } from '../config/siteContent'
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p class="site-footer__credit">
        <strong class="site-footer__brand">{{ FOOTER_CONTENT.brand }}</strong>
        <span class="site-footer__sep" aria-hidden="true">·</span>
        <span>{{ FOOTER_CONTENT.summary }}</span>
      </p>

      <a class="site-footer__top-link" :href="FOOTER_CONTENT.backToTopHref">
        <span>{{ FOOTER_CONTENT.backToTopLabel }}</span>
        <ArrowUp :size="14" :stroke-width="2" aria-hidden="true" />
      </a>
    </div>
  </footer>
</template>

<style scoped>
/* Hallmark Ft2 · Inline-rule single line */
.site-footer {
  background: var(--color-paper);
  border-top: var(--rule-hairline);
  padding-block: var(--space-lg);
}

.site-footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm) var(--space-lg);
}

.site-footer__credit {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3xs);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--color-muted);
}

.site-footer__brand {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-ink);
}

.site-footer__sep {
  display: none;
  color: var(--color-rule);
}

@media (min-width: 40rem) {
  .site-footer__credit {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-xs);
  }

  .site-footer__sep {
    display: inline;
  }
}

.site-footer__top-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  min-height: 44px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  color: var(--color-ink-2);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--dur-micro) var(--ease-out);
}

.site-footer__top-link:hover {
  color: var(--color-ink);
}
</style>
