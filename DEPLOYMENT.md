# Hypercatz DApp Deployment Guide

## Overview

This guide covers deploying the Hypercatz NFT DApp to Netlify with Supabase backend integration. The application is configured for static export to ensure optimal performance and compatibility with Netlify's hosting platform.

## Prerequisites

- Node.js 18+ installed
- Netlify account
- Supabase account
- Git repository connected to Netlify

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

### 2. Set Up Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL script to create all tables, indexes, and policies

### 3. Configure Row Level Security

The schema includes RLS policies that are automatically applied. Key security features:

- Users can only access their own data
- Admin operations require proper permissions
- Public read access for certain data (leaderboards, games)
- Secure point transactions and staking operations

### 4. Get Supabase Credentials

From your Supabase project settings:
- **Project URL**: Found in Settings > API
- **Anon Key**: Found in Settings > API (public key)
- **Service Role Key**: Found in Settings > API (secret key - keep secure)

## Netlify Deployment

### 1. Connect Repository

1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your Git provider and select the repository
4. Choose the branch to deploy (usually `main` or `master`)

### 2. Build Settings

Netlify will automatically detect the Next.js project. Verify these settings:

- **Build command**: `npm run netlify-build`
- **Publish directory**: `out`
- **Node version**: 18 or higher

### 3. Environment Variables

In Netlify dashboard, go to Site settings > Environment variables and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=999
NEXT_PUBLIC_RPC_URL=https://api.hyperliquid-testnet.xyz/evm
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://hyperliquid-testnet.blockscout.com

# Contract Addresses (Update with actual deployed contracts)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS=0x...

# Application Configuration
NEXT_PUBLIC_APP_NAME=Hypercatz
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_SUPPORT_EMAIL=support@hypercatz.com

# Feature Flags
NEXT_PUBLIC_ENABLE_GAMES=true
NEXT_PUBLIC_ENABLE_STAKING=true
NEXT_PUBLIC_ENABLE_REWARDS=true
NEXT_PUBLIC_ENABLE_REFERRALS=true
```

### 4. Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at `https://your-site-name.netlify.app`

## Configuration Files

### netlify.toml

The project includes a comprehensive Netlify configuration:

- **Build settings**: Optimized for Next.js static export
- **Redirects**: SPA routing support with fallback to index.html
- **Headers**: Security headers including CSP, HSTS, and CORS
- **Caching**: Optimized caching for static assets and API responses
- **Edge Functions**: Supabase integration for server-side operations

### next.config.mjs

Configured for static export:

- `output: 'export'` - Enables static site generation
- `trailingSlash: true` - Ensures proper routing on static hosts
- `images.unoptimized: true` - Disables Next.js image optimization for static export
- `distDir: 'out'` - Output directory for static files

## Post-Deployment Setup

### 1. Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Enable HTTPS (automatic with Let's Encrypt)

### 2. Form Handling (If needed)

For contact forms or other form submissions:

1. Enable Netlify Forms in Site settings
2. Add `netlify` attribute to HTML forms
3. Configure form notifications and spam filtering

### 3. Analytics (Optional)

Enable Netlify Analytics or integrate Google Analytics:

```bash
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

## Monitoring and Maintenance

### 1. Build Logs

Monitor build logs in Netlify dashboard:
- Check for build errors or warnings
- Monitor build times and optimization opportunities
- Review deploy previews for pull requests

### 2. Performance Monitoring

- Use Netlify Analytics for traffic insights
- Monitor Core Web Vitals in browser dev tools
- Check Lighthouse scores regularly

### 3. Database Monitoring

In Supabase dashboard:
- Monitor database usage and performance
- Check API usage and rate limits
- Review logs for errors or unusual activity

## Troubleshooting

### Common Build Issues

1. **Node version mismatch**
   - Set Node version in Netlify: Site settings > Environment variables
   - Add `NODE_VERSION=18` or higher

2. **Missing environment variables**
   - Verify all required variables are set in Netlify
   - Check variable names match exactly (case-sensitive)

3. **Static export issues**
   - Ensure no server-side only features are used
   - Check that all images use `unoptimized` prop if needed
   - Verify API routes are not used (use Supabase instead)

### Runtime Issues

1. **Supabase connection errors**
   - Verify Supabase URL and keys are correct
   - Check RLS policies allow required operations
   - Ensure database schema is properly set up

2. **Wallet connection issues**
   - Verify RPC URL is accessible
   - Check chain ID matches HyperEVM (999)
   - Ensure WalletConnect project ID is valid

3. **CORS errors**
   - Check Netlify headers configuration
   - Verify Supabase CORS settings
   - Ensure API endpoints allow cross-origin requests

## Security Considerations

### 1. Environment Variables

- Never commit sensitive keys to version control
- Use Supabase service role key only for server-side operations
- Rotate keys regularly

### 2. Database Security

- RLS policies are enforced automatically
- Regular security audits of database access
- Monitor for unusual query patterns

### 3. Content Security Policy

The netlify.toml includes a strict CSP header:
- Only allows resources from trusted domains
- Prevents XSS attacks
- Blocks inline scripts and styles (except where necessary)

## Performance Optimization

### 1. Static Assets

- Images are optimized during build
- CSS and JS are minified automatically
- Gzip compression enabled via headers

### 2. Caching Strategy

- Static assets cached for 1 year
- HTML files cached for 1 hour
- API responses cached for 5 minutes

### 3. Bundle Optimization

- Tree shaking removes unused code
- Dynamic imports for code splitting
- Optimized dependencies and polyfills

## Support

For deployment issues:
- Check Netlify build logs
- Review Supabase logs and metrics
- Consult Next.js static export documentation
- Contact support at the configured support email

## Version History

- v1.0.0 - Initial deployment configuration
- v1.1.0 - Added comprehensive Supabase integration
- v1.2.0 - Enhanced security headers and caching
- v1.3.0 - Mobile optimization and loading states