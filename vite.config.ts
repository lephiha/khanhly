import fs from 'node:fs'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { INSPIRE_WELLNESS_ROUTE_META } from './src/config/inspireWellnessRoutes.ts'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildRouteHtml(baseHtml: string, title: string, description: string): string {
  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(description)}" />`
    )
}

/**
 * Xuất sẵn file HTML vật lý cho `/inspire-wellness/index.html` và tất cả các trang
 * `/inspire-wellness/<slug>/index.html` từ nguồn dữ liệu dùng chung để khi deploy tĩnh,
 * mở link trực tiếp hoặc F5 tải lại trang đều trả HTTP 200 (không bị 404).
 */
function inspireWellnessStaticPagesPlugin(): Plugin {
  let outDir = 'dist'

  return {
    name: 'inspire-wellness-static-pages',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const rootIndexPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(rootIndexPath)) return

      const baseHtml = fs.readFileSync(rootIndexPath, 'utf-8')
      const libraryDescription =
        'Video ngắn từ Khánh Ly về dinh dưỡng và chăm sóc sức khỏe chủ động.'

      // 1. Trang thư viện: /inspire-wellness/index.html
      const libraryDir = path.join(outDir, 'inspire-wellness')
      fs.mkdirSync(libraryDir, { recursive: true })
      fs.writeFileSync(
        path.join(libraryDir, 'index.html'),
        buildRouteHtml(baseHtml, 'Inspire Wellness — Nguyễn Khánh Ly', libraryDescription),
        'utf-8'
      )

      // 2. Cả 7 trang chi tiết: /inspire-wellness/<slug>/index.html
      for (const ep of INSPIRE_WELLNESS_ROUTE_META) {
        const epDir = path.join(libraryDir, ep.slug)
        fs.mkdirSync(epDir, { recursive: true })
        fs.writeFileSync(
          path.join(epDir, 'index.html'),
          buildRouteHtml(
            baseHtml,
            `${ep.title} — Inspire Wellness | Nguyễn Khánh Ly`,
            `${ep.title} — Inspire Wellness cùng Nguyễn Khánh Ly.`
          ),
          'utf-8'
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue(), inspireWellnessStaticPagesPlugin()],
})
