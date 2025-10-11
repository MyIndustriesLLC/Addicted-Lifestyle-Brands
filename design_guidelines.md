# Design Guidelines: Ripple NFT T-Shirt Marketplace

## Design Approach

**Selected Approach:** Reference-Based with Web3 Enhancement
- **Primary References:** Shopify (e-commerce structure) + OpenSea (NFT marketplace aesthetics) + Stripe (clean checkout flows)
- **Design Philosophy:** Blend streetwear e-commerce sophistication with blockchain transparency and trust indicators

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: 222 15% 8% (deep charcoal)
- Surface: 222 12% 12% (elevated cards)
- Primary Brand: 210 100% 60% (Ripple blue - vibrant, trustworthy)
- Accent: 280 70% 65% (purple for NFT elements)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Success (blockchain confirmed): 142 76% 45%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 100% 50%
- Text: 222 20% 15%

### B. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - clean, modern sans-serif for UI
- Display: 'Space Grotesk' (Google Fonts) - bold headers and product titles
- Mono: 'JetBrains Mono' - wallet addresses, transaction IDs

**Scale:**
- Hero/Display: text-6xl to text-7xl (60-72px), font-bold
- Product Titles: text-2xl to text-3xl, font-semibold
- Body: text-base to text-lg
- Captions/Metadata: text-sm, font-medium

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing: p-2, gap-2 (buttons, inline elements)
- Component spacing: p-4, p-6 (cards, sections)
- Section spacing: py-12, py-16, py-20 (vertical rhythm)
- Container max-width: max-w-7xl for content areas

### D. Component Library

**Navigation:**
- Sticky header with wallet connection status indicator
- Primary CTA: "Connect Wallet" with Ripple logo icon
- Cart icon with NFT count badge
- Search bar with blockchain transaction search capability

**Product Display:**
- Grid Layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Product Cards: Rounded-xl, hover elevation with subtle scale transform
- NFT Badge: Visible indicator showing blockchain status (Minted/Available/Sold)
- Barcode Preview: Integrated within product image gallery

**Admin Upload Interface:**
- Drag-and-drop zone for product images
- Real-time barcode generation preview
- Ripple network status indicator
- Form sections: Product Details, Pricing, NFT Metadata (with fields for barcode data, collection info)

**Checkout Flow:**
- Two-step process: Traditional Payment → NFT Minting Confirmation
- Wallet integration panel showing XRP balance
- Transaction progress tracker with blockchain confirmation states
- Success screen displaying NFT details with shareable link

**Data Displays:**
- NFT Gallery: Masonry grid showing owned NFTs with barcode visualization
- Transaction History: Table with expandable rows for blockchain explorer links
- Wallet Overview: Dashboard cards showing owned NFTs, XRP balance, recent activity

**Trust Indicators:**
- Blockchain verification badges (green checkmarks)
- Transaction confirmations counter
- "Verified on Ripple" banners
- Real-time network status (green dot = connected)

### E. Animations

**Minimal & Purposeful:**
- Wallet connect: Gentle fade + slide-up modal
- NFT minting: Subtle pulse on blockchain confirmation
- Product hover: Slight scale (scale-105) and shadow elevation
- Page transitions: Simple fade, no complex animations

## Page Structure

**Homepage/Marketplace:**
- Hero: Full-width banner showcasing featured T-shirt collection with "Shop NFT-Backed Streetwear" headline
- Live Mint Counter: Real-time stats of total NFTs minted
- Product Grid: All available T-shirts with NFT status badges
- Trust Section: "Every Purchase = Unique NFT Ownership" with visual explanation

**Product Detail Page:**
- Split layout: Left (image gallery with barcode), Right (details + buy button)
- NFT Information Panel: Blockchain address, metadata, rarity indicators
- Purchase button transforms to "Mint NFT" after payment

**Admin Dashboard:**
- Clean sidebar navigation
- Upload zone prominently featured
- Active listings management table
- Ripple network connection status at top

**User Profile/Wallet:**
- NFT collection display (owned barcodes)
- Transfer/sell functionality
- Transaction history with Ripple explorer links

## Images

**Hero Section:** Full-width lifestyle image of person wearing T-shirt with visible barcode design (1920x800px), dark overlay for text contrast

**Product Images:** High-quality T-shirt mockups with clear barcode visibility (800x1000px), white/transparent backgrounds

**NFT Visualizations:** Abstract geometric patterns representing blockchain data, Ripple logo integration in corners

**Trust Badges:** Ripple logo, "Blockchain Verified" icons, security shield graphics

## Key Differentiators

- **Web3 Aesthetic:** Incorporate subtle grid patterns, hexagonal elements reminiscent of blockchain networks
- **Transparency:** Always show blockchain transaction states visually (pending/confirmed)
- **Dual Identity:** Balance streetwear cool with technical blockchain credibility
- **Mobile-First:** Wallet interactions optimized for mobile crypto wallets