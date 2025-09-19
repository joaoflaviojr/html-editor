# Railway Environment Variables

## Required Environment Variables for Railway Deployment

Configure these environment variables in your Railway project settings:

### 🔐 **Authentication (NextAuth.js)**
```
NEXTAUTH_SECRET=iPZtkE3lRvQPymT1cBPsPA90CaONdxKIZBnBYnBMur0=
NEXTAUTH_URL=https://your-railway-app.railway.app
```

### 🗄️ **Database (PostgreSQL)**
```
DATABASE_URL=postgresql://username:password@host:port/database
```
*Railway will automatically provide this when you add a PostgreSQL service*

### 🔑 **Google OAuth (Required for Authentication)**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 💳 **PayPal (Required for Subscriptions)**
```
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENV=sandbox
PAYPAL_WEBHOOK_ID=your-webhook-id
PAYPAL_PLAN_ID_PRO=your-pro-plan-id
```

### 🌐 **Public Environment Variables**
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO=your-pro-plan-id
```

### ⚙️ **Railway Specific**
```
PORT=3000
```

## 📋 **Setup Steps for Railway:**

1. **Create Railway Project** from GitHub repository
2. **Add PostgreSQL Service** to your project
3. **Configure Environment Variables** in Railway dashboard
4. **Run Database Migration**: `npx prisma migrate deploy`
5. **Deploy** your application

## 🔍 **Verification:**
- Check that all environment variables are set in Railway dashboard
- Ensure NEXTAUTH_URL matches your Railway app URL
- Verify Google OAuth redirect URIs include your Railway domain