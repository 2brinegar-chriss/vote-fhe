import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // 如果启用代理，设置环境变量
  if (env.VITE_PROXY_ENABLED === 'true') {
    process.env.HTTP_PROXY = env.VITE_HTTP_PROXY
    process.env.HTTPS_PROXY = env.VITE_HTTPS_PROXY
    console.log('🔧 HTTP 代理已启用:', env.VITE_HTTP_PROXY)
  }

  return {
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // 添加 CORS headers 支持 SharedArrayBuffer (FHEVM 需要)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    // HTTP 代理配置
    proxy: {
      // 代理 Infura API 请求
      '/api/infura': {
        target: 'https://sepolia.infura.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/infura/, ''),
        configure: (proxy, options) => {
          // 添加自定义请求头
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'PlatformVoting/1.0');
          });
        },
      },
      // 代理 Zama Gateway 请求
      '/api/gateway': {
        target: 'https://gateway.sepolia.zama.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gateway/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'PlatformVoting/1.0');
          });
        },
      },
      // 代理 KMS 请求
      '/api/kms': {
        target: 'https://kms.sepolia.zama.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kms/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['fhevmjs'], // 排除 FHEVM 相关包的优化
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  }
})

