# 🐱⚡ Hypercatz - Premier NFT Utility Hub

The ultimate minting and utility DApp for the Hypercatz NFT collection on HyperEVM (Hyperliquid's Layer 1). A next-generation, interactive, high-utility platform that merges aesthetics, game mechanics, and holder value.

![Hypercatz Banner](./public/images/banner.png)

## 🌟 Features

### 🧱 Core Modules

- **🌐 Landing Page** - Hero banner with glitch animations, lightning FX, and subtle audio
- **🧾 Minting Module** - Dynamic mint UI with phases (free/WL/public) and NFT reveal
- **✅ Whitelist Checker** - Wallet verification with Merkle-based whitelist
- **💰 Staking Dashboard** - Stake NFTs/HYPE tokens with tier multipliers
- **🎮 On-Chain Games** - Flip, TicTacToe, Reaction Race with HYPE wagers
- **🔄 Integrated Swap** - Token swapping with NFT holder benefits
- **🛍️ Reward Store** - Redeem points for WL spots, merch, roles, NFTs
- **🏅 Badge System** - Earnable achievements with social sharing
- **👥 Community Hub** - Referral system and holder leaderboards
- **📦 Inventory Panel** - NFT management with staking integration
- **🛠️ Admin Controls** - Complete admin dashboard for management

### 🎨 Design & UX

- **Cyberpunk Neon Aesthetic** - Electric blues, hot pinks, acid greens
- **Glitch Effects** - Dynamic animations and visual effects
- **Sound Engine** - Interactive audio feedback (toggleable)
- **Responsive Design** - Mobile-first, game-friendly layout
- **Smooth Animations** - Framer Motion powered transitions

## 🚀 Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling with custom theme
- **Framer Motion** - Smooth animations and transitions
- **Howler.js** - Audio engine for sound effects

### Blockchain
- **Viem** - TypeScript Ethereum library
- **Wagmi v2** - React hooks for Ethereum
- **RainbowKit** - Wallet connection with custom theming
- **HyperEVM** - Hyperliquid's EVM (Chain ID: 999)

### Backend/Data
- **Supabase** - Authentication, referrals, points, metadata
- **Edge Functions** - Serverless backend logic

## 📁 Project Structure

```
hypercatz/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── mint/              # Minting interface
│   │   ├── whitelist/         # Whitelist checker
│   │   ├── stake/             # Staking dashboard
│   │   ├── games/             # Game lobby
│   │   ├── swap/              # Token swapping
│   │   ├── store/             # Reward store
│   │   ├── community/         # Community hub
│   │   ├── inventory/         # User inventory
│   │   └── admin/             # Admin panel
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Configuration & utilities
│   │   ├── constants.ts      # App constants
│   │   └── wagmi.ts          # Blockchain config
│   ├── utils/                # Helper functions
│   │   ├── sound.ts          # Sound engine
│   │   └── cn.ts             # Class name utility
│   ├── types/                # TypeScript definitions
│   ├── hooks/                # Custom React hooks
│   ├── contracts/            # Smart contract ABIs
│   └── supabase/             # Database schema
├── public/                   # Static assets
├── .env.example             # Environment variables template
└── README.md               # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/hypercatz/hypercatz-dapp.git
cd hypercatz-dapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Blockchain Configuration
NEXT_PUBLIC_HYPEREVM_RPC_URL=https://api.hyperliquid-testnet.xyz/evm
NEXT_PUBLIC_HYPEREVM_CHAIN_ID=999

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Contract Addresses (update when deployed)
NEXT_PUBLIC_HYPERCATZ_NFT_ADDRESS=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=0x...
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎮 Usage Guide

### For Users

1. **Connect Wallet** - Use RainbowKit to connect your wallet
2. **Check Whitelist** - Verify your eligibility for mint phases
3. **Mint NFTs** - Participate in free, whitelist, or public mint
4. **Stake Assets** - Earn rewards by staking NFTs or HYPE tokens
5. **Play Games** - Compete in on-chain games for prizes
6. **Earn Rewards** - Accumulate points through various activities
7. **Redeem Items** - Use points in the reward store
8. **Build Community** - Refer friends and climb leaderboards

### For Developers

#### Adding New Components
```typescript
// src/components/ui/NewComponent.tsx
import { motion } from 'framer-motion';
import { useSoundEngine } from '@/utils/sound';

export const NewComponent = () => {
  const { playClick } = useSoundEngine();
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="cyber-card p-6"
      onClick={playClick}
    >
      {/* Component content */}
    </motion.div>
  );
};
```

#### Custom Animations
```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};
```

#### Sound Integration
```typescript
const { playSuccess, playError, setEnabled } = useSoundEngine();

// Play success sound
playSuccess();

// Toggle sound system
setEnabled(false);
```

## 🎨 Theming & Customization

### Color Palette
```css
/* Neon Colors */
--neon-pink: #ff0080
--neon-cyan: #00ffff
--neon-green: #39ff14
--neon-purple: #8a2be2
--neon-orange: #ff6600
--neon-yellow: #ffff00
--neon-blue: #0080ff

/* Dark Theme */
--dark-bg: #0a0a0a
--dark-surface: #1a1a1a
--dark-card: #2a2a2a
--dark-border: #3a3a3a
```

### Custom Utilities
```css
.cyber-text { /* Gradient text effect */ }
.cyber-card { /* Glowing card style */ }
.cyber-border { /* Animated border */ }
.neon-button { /* Interactive button */ }
.glitch-text { /* Glitch animation */ }
```

## 🔧 Configuration

### Mint Phases
```typescript
// src/lib/constants.ts
export const MINT_CONFIG = {
  MAX_SUPPLY: 10000,
  PHASES: {
    FREE: { price: '0', maxPerWallet: 1 },
    WHITELIST: { price: '0.01', maxPerWallet: 3 },
    PUBLIC: { price: '0.02', maxPerWallet: 5 },
  },
};
```

### Staking Rewards
```typescript
export const STAKING_CONFIG = {
  BASE_REWARD_RATE: '100', // points per day
  TIER_MULTIPLIERS: {
    COMMON: 1,
    RARE: 1.5,
    EPIC: 2,
    LEGENDARY: 3,
  },
};
```

### Game Settings
```typescript
export const GAME_CONFIG = {
  ENTRY_FEES: {
    NFT_HOLDER: '0',
    NON_HOLDER: '2000000000000000000', // 2 HYPE
  },
};
```

## 🚀 Deployment

The Hypercatz DApp is production-ready and optimized for deployment on Vercel with comprehensive configuration.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hypercatz)

### Environment Variables

Set up the following environment variables in your Vercel dashboard:

```bash
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain Configuration
NEXT_PUBLIC_HYPERLIQUID_RPC=https://api.hyperliquid-testnet.xyz/evm
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=0x...
```

### Deployment Features

- ✅ **Vercel Configuration**: Pre-configured `vercel.json` with optimized settings
- ✅ **Security Headers**: CORS, XSS protection, and content security policies
- ✅ **Performance Optimization**: Caching, compression, and asset optimization
- ✅ **Error Handling**: Comprehensive error boundaries and fallbacks
- ✅ **Loading States**: Smooth loading indicators across all interactions
- ✅ **Mobile Optimization**: Fully responsive design for all devices
- ✅ **SEO Ready**: Meta tags, structured data, and performance optimization

### Detailed Deployment Guide

For comprehensive deployment instructions, troubleshooting, and production considerations, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Production Checklist

- [ ] Environment variables configured
- [ ] Domain name set up (optional)
- [ ] SSL certificate enabled
- [ ] Analytics and monitoring configured
- [ ] Error tracking implemented
- [ ] Performance monitoring active
- [ ] Security headers verified

### Build Commands
```bash
# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Deploy to Vercel
vercel --prod
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] Wallet connection works
- [ ] All navigation links functional
- [ ] Mint interface responsive
- [ ] Sound toggle works
- [ ] Animations smooth
- [ ] Mobile layout correct

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions
- Add sound effects to interactive elements
- Ensure mobile responsiveness
- Test wallet integration thoroughly

## 📝 Smart Contracts

### Contract Addresses (HyperEVM Testnet)
```
Hypercatz NFT: 0x... (TBD)
Staking Contract: 0x... (TBD)
Game Contract: 0x... (TBD)
Reward Store: 0x... (TBD)
```

### Key Functions
- `mint(uint256 amount)` - Mint NFTs
- `stake(uint256[] tokenIds)` - Stake NFTs
- `claimRewards()` - Claim staking rewards
- `createGame(GameType gameType)` - Create new game
- `joinGame(uint256 gameId)` - Join existing game

## 🔒 Security

- All smart contracts audited
- Frontend sanitizes user inputs
- Rate limiting on API endpoints
- Secure environment variable handling
- HTTPS enforced in production

## 📊 Analytics & Monitoring

- Google Analytics integration
- Error tracking with Sentry
- Performance monitoring
- User behavior analytics
- Smart contract event tracking

## 🎵 Audio Assets

Place sound files in `public/sounds/`:
- `click.mp3` - UI interactions
- `success.mp3` - Successful actions
- `error.mp3` - Error states
- `mint.mp3` - NFT minting
- `win.mp3` - Game victories
- `lose.mp3` - Game defeats

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interactions
- Mobile wallet integration
- Optimized animations for mobile
- Progressive Web App features

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## 📞 Support

- Discord: [discord.gg/hypercatz](https://discord.gg/hypercatz)
- Twitter: [@hypercatz](https://twitter.com/hypercatz)
- Email: support@hypercatz.com
- Documentation: [docs.hypercatz.com](https://docs.hypercatz.com)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hyperliquid team for HyperEVM
- RainbowKit for wallet integration
- Framer Motion for animations
- TailwindCSS for styling system
- Next.js team for the framework

---

**Built with ⚡ by the Hypercatz team**

*Ready to mint, stake, play, and earn? Welcome to the future of NFT utility! 🐱*
