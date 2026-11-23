import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // Lê o .env e dá prioridade para variáveis reais do ambiente (Docker Compose / shell).
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

  // VITE_PROXY_TARGET é o nome usado no .env/docker-compose;
  // VITE_API_PROXY_TARGET é usado pela suíte de testes E2E (Playwright).
  const proxyTarget =
    env.VITE_PROXY_TARGET || env.VITE_API_PROXY_TARGET || 'http://localhost:18080'
  const allowedHosts = (
    env.VITE_ALLOWED_HOSTS ||
    'localhost,127.0.0.1,.luiz-antonio.site,.trycloudflare.com'
  )
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
  const hmrHost = env.VITE_HMR_HOST

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      // HMR através do Cloudflare Tunnel: defina VITE_HMR_HOST=orbytum.luiz-antonio.site no .env.
      // Sem essa variável o HMR continua funcionando normalmente em localhost:5173.
      hmr: hmrHost
        ? {
            host: hmrHost,
            protocol: env.VITE_HMR_PROTOCOL || 'wss',
            clientPort: Number(env.VITE_HMR_CLIENT_PORT || 443),
          }
        : undefined,
      // Necessário apenas em Docker Desktop (Mac/Windows): VITE_USE_POLLING=true
      watch: env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
    },

    preview: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts,
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
