# HTML Editor Pro

A professional online HTML editor with WYSIWYG editing, PayPal subscriptions, and advanced features built with Next.js 15, GrapesJS, and Monaco Editor.

## Project Overview

**HTML Editor Pro** is a full-stack web application that provides users with a powerful online HTML editing experience. The application features:

- **WYSIWYG Editor**: Visual editing with GrapesJS
- **Source Code Editor**: Monaco Editor with syntax highlighting and validation
- **Subscription System**: PayPal integration for Pro features
- **User Authentication**: Google OAuth via NextAuth
- **Advanced Features**: DOM tree editing, diff view, inline CSS export (Pro only)

## URLs

- **Production**: To be deployed on Railway
- **GitHub**: https://github.com/joaoflaviojr/html-editor.git

## 🚀 Railway Deployment

### Environment Setup
See [RAILWAY_ENV.md](./RAILWAY_ENV.md) for complete environment variable configuration.

**Critical:** The `NEXTAUTH_SECRET` must be set in Railway environment variables for authentication to work.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Editor**: GrapesJS (WYSIWYG), Monaco Editor (source code)
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: PayPal Subscriptions API
- **Deployment**: Railway with Docker
- **CI/CD**: GitHub Actions

## Data Architecture

### Data Models
- **User**: Authentication and profile information
- **Subscription**: PayPal subscription tracking and Pro features access
- **Usage**: Daily limits tracking for free users
- **AuditLog**: Action logging for analytics and support

### Storage Services
- **PostgreSQL**: Primary database for user data, subscriptions, and usage tracking
- **PayPal API**: External subscription management and payment processing

### Data Flow
1. **User Authentication**: Google OAuth → NextAuth → Database
2. **Subscription Management**: PayPal → Webhooks → Database updates
3. **HTML Processing**: Client → DOMPurify sanitization → GrapesJS/Monaco
4. **Usage Tracking**: Actions → API endpoints → Database logging

## Features

### ✅ Currently Completed Features

#### Core Functionality
- ✅ **WYSIWYG HTML Editor** with GrapesJS
- ✅ **Monaco Source Editor** with HTML syntax highlighting
- ✅ **Bi-directional Sync** between visual and source modes
- ✅ **HTML Import/Export** with DOMPurify sanitization
- ✅ **File Upload/Download** with size limits
- ✅ **Template System** with default HTML5 template

#### Authentication & User Management
- ✅ **Google OAuth Integration** via NextAuth
- ✅ **User Sessions** and authentication state
- ✅ **User Profile** and account management

#### Subscription System
- ✅ **PayPal Subscriptions** integration
- ✅ **Webhook Handling** for subscription events
- ✅ **Pro Feature Gating** based on subscription status
- ✅ **Usage Limits** enforcement for free users
- ✅ **Subscription Status API** endpoints

#### User Interface
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **Text-only Menus** (File, Edit, View)
- ✅ **Modal Dialogs** for import/upgrade prompts
- ✅ **Paywall Components** for Pro features
- ✅ **Usage Warnings** for approaching limits

#### Deployment Ready
- ✅ **Railway Configuration** with Dockerfile
- ✅ **GitHub Actions CI/CD** pipeline
- ✅ **Environment Management** with secure secrets
- ✅ **Database Migrations** with Prisma

### 🚧 Features Not Yet Implemented

#### Editor Enhancements
- ⏳ **Find/Replace** functionality in Monaco editor
- ⏳ **Keyboard Shortcuts** for common actions
- ⏳ **Auto-save** functionality
- ⏳ **Recent Files** management
- ⏳ **Export Formats** (PDF, Markdown)

#### Pro Features (Partially Complete)
- ⏳ **Inline CSS Export** (backend ready, UI toggle needed)
- ⏳ **Advanced Diff View** (basic implementation done)
- ⏳ **Custom Components** library for GrapesJS
- ⏳ **Advanced Sanitization** options panel

#### Analytics & Monitoring
- ⏳ **Usage Analytics** dashboard
- ⏳ **Performance Monitoring** 
- ⏳ **Error Tracking** integration
- ⏳ **A/B Testing** for features

#### Additional Features
- ⏳ **Email Notifications** for subscriptions
- ⏳ **Team Collaboration** features
- ⏳ **API Access** for Pro users
- ⏳ **Custom Themes** for editor

## Functional Entry URIs

### Public Pages
- **`/`** - Main HTML editor interface (requires authentication)
- **`/pricing`** - Subscription plans comparison
- **`/upgrade`** - PayPal subscription checkout
- **`/account`** - User account and subscription management
- **`/auth/signin`** - Google OAuth signin page

### API Endpoints
- **`GET /api/auth/[...nextauth]`** - NextAuth authentication
- **`POST /api/webhooks/paypal`** - PayPal webhook handler
- **`POST /api/subscription/verify`** - Verify PayPal subscription
- **`GET /api/subscription/status`** - Get user subscription status
- **`POST /api/usage/log`** - Log user actions (import, download)
- **`GET /api/usage/check-download`** - Check daily download limits
- **`GET /api/health`** - Health check endpoint

## User Guide

### Getting Started
1. **Sign In**: Click "Sign In with Google" to authenticate
2. **Start Editing**: Use the visual editor or switch to source mode
3. **Import Content**: Upload HTML files or paste content
4. **Edit & Style**: Use the toolbar and panels for editing
5. **Download**: Export your HTML when finished

### Free vs Pro
- **Free Users**: 100KB file limit, 2 downloads/day, basic editing
- **Pro Users**: 5MB files, unlimited downloads, advanced features

### Subscription Management
1. Visit `/upgrade` to subscribe via PayPal
2. Manage billing through your PayPal account
3. Check status and limits on `/account` page

## Installation & Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- PayPal Developer Account
- Google OAuth credentials

### Setup
```bash
# Clone repository
git clone https://github.com/joaoflaviojr/html-editor.git
cd html-editor

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma generate
npx prisma migrate dev

# Run development server
npm run dev
```

### Environment Variables
See `.env.example` for required variables:
- Database connection
- NextAuth configuration
- Google OAuth credentials
- PayPal API credentials

## Deployment Status

- **Platform**: Railway
- **Status**: ✅ Ready for deployment
- **Database**: PostgreSQL via Railway
- **CI/CD**: ✅ GitHub Actions configured
- **Domain**: To be configured

## Recommended Next Steps

1. **Deploy to Railway**: Set up production environment
2. **Configure PayPal Plans**: Create Pro subscription plans
3. **Set up Google OAuth**: Configure production OAuth app
4. **Add Tests**: Implement unit and integration tests
5. **Performance**: Optimize bundle size and loading
6. **Monitoring**: Add error tracking and analytics
7. **Documentation**: Create user guides and API docs
8. **Marketing**: Landing page and feature announcements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For technical support or subscription issues:
- Create a GitHub issue
- Contact via the account page
- PayPal subscription management