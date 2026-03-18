import { defineConfig } from 'vitepress'

import fs from 'fs'
import path from 'path'

function getSidebar(dir: string, basePath = '') {
  const items = fs.readdirSync(dir)

  return items.map((item) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      return {
        text: item,
        items: getSidebar(fullPath, `${basePath}/${item}`)
      }
    }

    if (item.endsWith('.md') && item !== 'index.md') {
      return {
        text: item.replace('.md', ''),
        link: `${basePath}/${item.replace('.md', '')}`
      }
    }
  }).filter(Boolean)
}



function watchDocsPlugin() {
  return {
    name: 'watch-docs-folder',
    configureServer(server) {
      const docsPath = path.resolve(__dirname, '..')

      server.watcher.add(docsPath)

      server.watcher.on('add', () => {
        console.log('📄 File added → reload')
        server.ws.send({ type: 'full-reload' })
      })

      server.watcher.on('unlink', () => {
        console.log('🗑 File removed → reload')
        server.ws.send({ type: 'full-reload' })
      })

      server.watcher.on('addDir', () => {
        console.log('📁 Folder added → reload')
        server.ws.send({ type: 'full-reload' })
      })

      server.watcher.on('unlinkDir', () => {
        console.log('📁 Folder removed → reload')
        server.ws.send({ type: 'full-reload' })
      })
    }
  }
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Phone a Vet",
  description: "A VitePress Site",
  vite: {
    plugins: [watchDocsPlugin()]
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      ...getSidebar(path.join(__dirname, '../src'), '/src'),

    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
