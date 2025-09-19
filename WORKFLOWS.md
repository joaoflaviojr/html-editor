# GitHub Actions Workflows

Para configurar CI/CD no seu repositório, você pode criar estes arquivos manualmente:

## 1. `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Generate Prisma Client
      run: npx prisma generate

    - name: Run ESLint
      run: npm run lint

    - name: Run TypeScript type check
      run: npx tsc --noEmit

  build:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Generate Prisma Client
      run: npx prisma generate

    - name: Build application
      run: npm run build
      env:
        NEXTAUTH_SECRET: "test-secret"
        DATABASE_URL: "postgresql://test:test@localhost:5432/test"
```

## 2. `.github/workflows/deploy-railway.yml` (Opcional)

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Generate Prisma Client
      run: npx prisma generate

    - name: Run linting
      run: npm run lint

    - name: Build application
      run: npm run build
      env:
        NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        DATABASE_URL: ${{ secrets.DATABASE_URL }}

    - name: Install Railway CLI
      run: npm install -g @railway/cli

    - name: Deploy to Railway
      run: railway up --service=${{ secrets.RAILWAY_SERVICE_ID }}
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

    - name: Run database migrations
      run: railway run npx prisma migrate deploy
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Como Adicionar

1. No GitHub, vá para o seu repositório
2. Crie a pasta `.github/workflows/`
3. Adicione os arquivos acima
4. Configure os secrets no GitHub (se usar o deploy workflow)