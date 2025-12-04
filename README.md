# CimentoTrack 🚚

Sistema SaaS de rastreamento de entregas de cimento com integração Mapbox e Supabase.

## 🚀 Tecnologias

- **Frontend**: Vite + React + React Router
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Mapas**: Mapbox GL JS
- **Styling**: Vanilla CSS com design system moderno
- **Deploy**: EasyPanel

## 📋 Pré-requisitos

1. **Node.js** (v18 ou superior)
2. **Conta Supabase** (gratuita) - [supabase.com](https://supabase.com)
3. **Conta Mapbox** (gratuita) - [mapbox.com](https://mapbox.com)

## ⚙️ Configuração

### 1. Clone e Instale Dependências

```bash
cd cimentotrack
npm install
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde a criação do projeto (pode levar alguns minutos)
3. Vá para **Settings** > **API** e copie:
   - `Project URL`
   - `anon public` key

4. No Supabase, vá para **SQL Editor** e execute o arquivo:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   Isso criará todas as tabelas, índices e políticas de segurança.

5. Crie um usuário admin em **Authentication** > **Users** > **Add User**:
   - Email: seu@email.com
   - Password: sua-senha-segura
   - Marque "Auto Confirm User"

### 3. Configure o Mapbox

1. Acesse [mapbox.com](https://mapbox.com) e crie uma conta
2. Vá para **Account** > **Access Tokens**
3. Copie seu **Default Public Token** ou crie um novo

### 4. Configure Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
VITE_MAPBOX_TOKEN=seu-mapbox-token
```

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 📱 Usando o Sistema

### Painel Administrativo

1. Acesse `http://localhost:3000/admin/login`
2. Faça login com o usuário criado no Supabase
3. No Dashboard você pode:
   - Ver estatísticas de entregas
   - Criar novas entregas
   - Gerenciar entregas existentes
   - Copiar links de rastreamento

### Rastreamento Público

Os clientes acessam suas entregas via link único:
```
http://localhost:3000/rastrear/CODIGO-TRACKING
```

Não é necessário login para visualizar o rastreamento.

## 🗂️ Estrutura do Projeto

```
cimentotrack/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes reutilizáveis
│   │   └── layout/          # Layouts (Sidebar, AdminLayout)
│   ├── pages/
│   │   ├── admin/           # Páginas administrativas
│   │   └── public/          # Páginas públicas
│   ├── services/            # Integrações (Supabase, Mapbox)
│   ├── styles/              # Estilos globais
│   ├── App.jsx              # Rotas principais
│   └── main.jsx             # Entry point
├── supabase/
│   └── migrations/          # Migrations do banco
├── .env.example             # Template de variáveis
└── package.json
```

## 🎨 Funcionalidades

### Implementadas

- ✅ Sistema de autenticação para atendentes
- ✅ Dashboard com estatísticas
- ✅ Listagem de entregas com filtros
- ✅ Rastreamento público via link único
- ✅ Design system completo
- ✅ Integração Supabase (banco + auth + realtime)
- ✅ Estrutura para integração Mapbox

### Em Desenvolvimento

- 🚧 Formulário de criação de entregas
- 🚧 Página de detalhes da entrega
- 🚧 Componente de mapa com Mapbox
- 🚧 Atualização de localização em tempo real
- 🚧 Cálculo de ETA
- 🚧 Notificações

## 🚀 Deploy no EasyPanel

1. Conecte seu repositório Git ao EasyPanel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MAPBOX_TOKEN`
3. Configure o build:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy!

## 📝 Próximos Passos

1. Implementar formulário completo de criação de entregas
2. Adicionar componente de mapa com Mapbox
3. Implementar atualização de localização em tempo real
4. Adicionar sistema de notificações
5. Implementar gestão de clientes
6. Adicionar relatórios e analytics

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme que o schema do Supabase foi executado corretamente
3. Verifique o console do navegador para erros

## 📄 Licença

Este projeto é privado e proprietário.
