import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ServerOptions as HttpsServerOptions } from 'node:https'

const loadHttpsConfig = (): HttpsServerOptions | undefined => {
  const keyPath = process.env.VITE_DEV_SSL_KEY ?? resolve(process.cwd(), 'certs', 'localhost-key.pem')
  const certPath = process.env.VITE_DEV_SSL_CERT ?? resolve(process.cwd(), 'certs', 'localhost.pem')

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    return undefined
  }

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
  }
}

const httpsConfig = loadHttpsConfig()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    https: httpsConfig,
  },
})
