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
NEXT_PUBLIC_HYPERCATZ_NFT_ADDRESS=0xa98F3CC961505CCcFB58AC58BC949a59dbdBe325
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x5b1F4087e322415489bFd41495aF32157bEC8f38
NEXT_PUBLIC_HYPE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_REWARD_STORE_ADDRESS=0x...

# Staking Configuration
NEXT_PUBLIC_STAKING_ENABLED=true
NEXT_PUBLIC_STAKING_MAX_NFTS_PER_TX=50
NEXT_PUBLIC_STAKING_MIN_LOCK_PERIOD=604800
NEXT_PUBLIC_STAKING_MAX_LOCK_PERIOD=31536000
NEXT_PUBLIC_STAKING_ANALYTICS_ENABLED=true

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

## Staking System Deployment

### Prerequisites for Staking

Before deploying the staking functionality, ensure:

1. **Smart Contracts Deployed**:
   - Hypercatz NFT contract (already deployed)
   - Staking contract with proper pool configurations
   - HYPE token contract
   - All contracts verified on block explorer

2. **Contract Integration**:
   - Update contract addresses in environment variables
   - Verify ABI compatibility
   - Test contract interactions on testnet

### Staking-Specific Environment Variables

```bash
# Staking Contract Configuration
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_HYPE_TOKEN_ADDRESS=0x...

# Staking Feature Flags
NEXT_PUBLIC_STAKING_ENABLED=true
NEXT_PUBLIC_STAKING_ANALYTICS_ENABLED=true

# Staking Limits and Security
NEXT_PUBLIC_STAKING_MAX_NFTS_PER_TX=50
NEXT_PUBLIC_STAKING_MIN_LOCK_PERIOD=604800
NEXT_PUBLIC_STAKING_MAX_LOCK_PERIOD=31536000

# Pool Configuration (if needed for frontend validation)
NEXT_PUBLIC_STAKING_POOLS_COUNT=4
NEXT_PUBLIC_STAKING_MAX_APY=200
```

### Staking Deployment Checklist

#### Pre-Deployment
- [ ] Smart contracts deployed and verified
- [ ] Contract addresses updated in environment variables
- [ ] Staking pools configured with correct parameters
- [ ] Security validations tested
- [ ] Rate limiting configured
- [ ] Analytics endpoints set up

#### Testing
- [ ] Stake NFTs functionality tested
- [ ] Unstake NFTs functionality tested
- [ ] Claim rewards functionality tested
- [ ] Pool switching tested
- [ ] Error handling tested
- [ ] Security validations tested
- [ ] Transaction history tested
- [ ] Analytics dashboard tested

#### Production Deployment
- [ ] Environment variables set in Netlify
- [ ] Contract addresses verified
- [ ] Staking enabled in production
- [ ] Monitoring and alerts configured
- [ ] User documentation updated

### Staking Security Considerations

1. **Contract Security**:
   - Ensure staking contracts are audited
   - Verify contract addresses match expected values
   - Implement proper access controls

2. **Frontend Security**:
   - Validate all user inputs
   - Implement rate limiting
   - Check for phishing attempts
   - Validate transaction parameters

3. **User Protection**:
   - Clear warnings about lock periods
   - Transaction confirmation dialogs
   - Gas estimation and warnings
   - Slippage protection where applicable

### Monitoring Staking Operations

1. **Key Metrics to Monitor**:
   - Total Value Locked (TVL)
   - Number of active stakers
   - Reward distribution rates
   - Transaction success rates
   - Gas usage patterns

2. **Alerts to Set Up**:
   - Contract interaction failures
   - Unusual staking patterns
   - High gas price warnings
   - Security validation failures

3. **Analytics Integration**:
   - Track staking adoption
   - Monitor pool utilization
   - Measure user engagement
   - Analyze reward claim patterns

### Troubleshooting Staking Issues

#### Common Issues

1. **Contract Not Deployed Error**:
   - Verify contract addresses in environment variables
   - Check if contracts are deployed on correct network
   - Ensure ABI files are up to date

2. **Transaction Failures**:
   - Check gas limits and prices
   - Verify user has sufficient balance
   - Ensure NFTs are not already staked elsewhere

3. **Reward Calculation Issues**:
   - Verify pool parameters are correct
   - Check reward distribution logic
   - Ensure timestamp calculations are accurate

4. **Security Validation Failures**:
   - Review security check implementations
   - Verify contract address validations
   - Check rate limiting configurations

### Rollback Procedures

If issues arise with staking functionality:

1. **Immediate Actions**:
   - Set `NEXT_PUBLIC_STAKING_ENABLED=false`
   - Deploy updated configuration
   - Monitor for any ongoing transactions

2. **Investigation**:
   - Check contract events and logs
   - Review transaction history
   - Analyze error patterns

3. **Resolution**:
   - Fix identified issues
   - Test thoroughly on staging
   - Gradually re-enable functionality

## Version History

- v1.0.0 - Initial deployment configuration
- v1.1.0 - Added comprehensive Supabase integration
- v1.2.0 - Enhanced security headers and caching
- v1.3.0 - Mobile optimization and loading states
- v1.4.0 - Production-ready staking system implementation