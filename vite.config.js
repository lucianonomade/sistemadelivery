import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true // Garante que funcione dentro do Docker/EasyPanel no modo dev
  },
  // Configuração para resolver o erro "Blocked request" no EasyPanel
  preview: {
    allowedHosts: true, // Libera qualquer domínio (incluindo o do EasyPanel)
    host: true,         // Ouve em todos os endereços de rede (0.0.0.0)
    port: 4173          // Porta padrão do comando 'npm run preview'
  }
})