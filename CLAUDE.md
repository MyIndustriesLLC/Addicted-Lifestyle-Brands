# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Ripple blockchain-based NFT marketplace for streetwear T-shirts. Each physical product purchase generates a unique NFT barcode minted on the XRPL (Ripple) network, providing blockchain-verified proof of authenticity and ownership. The application is a full-stack TypeScript monorepo combining traditional e-commerce with Web3 technology.

## Build & Development Commands

```bash
# Development
npm install              # Install all dependencies
npm run dev             # Start development server (Express + Vite HMR)
npm run check           # Type-check with tsc (required before commits)

# Building
npm run build           # Build client (Vite) and server (esbuild) to dist/
npm start              # Run production build from dist/index.js

# Database
npm run db:push         # Push schema.ts changes to PostgreSQL via Drizzle

# Testing
npm test               # Run all Vitest tests
npm run test:files     # Run tests per file via tsx script
```

## Architecture Overview

### Monorepo Structure

```
client/src/          # React 18 + Vite frontend
  components/        # Reusable UI components (atoms)
  hooks/             # Custom React hooks
  lib/               # Utility functions
  pages/             # Route-level page components
  types/             # Frontend TypeScript types
server/              # Express.js backend
  routes.ts          # HTTP endpoint definitions
  *-service.ts       # Business logic modules
  storage.ts         # Data persistence interface/implementation
  admin-auth.ts      # Admin authentication middleware
shared/
  schema.ts          # Drizzle ORM schema (single source of truth)
```

### Import Aliases

- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

Use these instead of relative paths for cleaner imports.

### Data Flow Architecture

1. **Schema Definition**: All database tables defined in `shared/schema.ts` using Drizzle ORM
2. **Storage Layer**: `server/storage.ts` provides `IStorage` interface with two implementations:
   - `MemStorage`: In-memory maps for development/testing
   - Database implementation: PostgreSQL via Drizzle (toggle in server/index.ts)
3. **Service Layer**: Business logic in `*-service.ts` files:
   - `ripple-service.ts`: XRPL blockchain operations (NFT minting, wallet creation)
   - `wallet-service.ts`: BIP39 mnemonic generation, XRP wallet derivation, encryption
4. **Routes Layer**: `routes.ts` handles HTTP requests, validates input with Zod, calls services

### Key Blockchain Workflows

**NFT Purchase Flow**:
1. Customer authenticates (session-based auth with bcrypt-hashed passwords)
2. Product selected → inventory check (salesCount vs inventoryLimit)
3. Unique 10-character barcodeId generated for this specific purchase
4. Transaction record created with purchaseNumber (1-500)
5. `rippleService.mintNFT()` mints NFT on XRPL with metadata:
   ```json
   {
     "name": "Product Name",
     "barcode": "UNIQUE10CH",
     "productId": "uuid",
     "purchaseNumber": 42
   }
   ```
6. Product salesCount incremented atomically
7. NFT tokenId and transactionHash stored in database

**Wallet Generation** (BIP39-based):
- 24-word mnemonic generated via bip39 library
- Entropy derived to create XRP seed using ripple-keypairs
- Seed phrase encrypted with AES (WALLET_ENCRYPTION_KEY env var)
- Both encrypted seed and XRP address stored in database
- Customer shown mnemonic once (tracked via seedPhraseShown timestamp)

### Database Schema Highlights

**Critical Tables**:
- `products`: Base product catalog with barcodeId, inventoryLimit, salesCount
- `transactions`: Each purchase generates unique uniqueBarcodeId and purchaseNumber
- `nfts`: Stores tokenId, transactionHash, ownerWallet from blockchain
- `customers`: User accounts with bcrypt password hashing
- `wallets`: Auto-generated XRP wallets with encrypted seed phrases
- `linkedWallets`: Multi-currency wallet addresses customers can link
- `conversionTransactions`: Cross-currency conversion tracking
- `employees`: Staff management (future payroll integration)

**Inventory System**:
- Each product has default inventoryLimit of 500
- salesCount increments with each successful NFT mint
- Frontend disables purchase when salesCount >= inventoryLimit

### Frontend Architecture

**State Management**:
- TanStack Query for API state (staleTime: Infinity for aggressive caching)
- React Context for theme (dark mode default)
- React Hook Form + Zod for form validation
- Session cookies for auth state (httpOnly, 7-day expiration)

**Routing**: Wouter (lightweight, not React Router)

**UI Component System**:
- Shadcn/ui (New York variant) built on Radix UI primitives
- Tailwind CSS with custom design tokens from design_guidelines.md
- Dark mode: background 222 15% 8%, primary Ripple blue 210 100% 60%
- Typography: Inter (UI), Space Grotesk (headers), JetBrains Mono (blockchain data)

### Environment Variables (Required)

**Database**:
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless) - REQUIRED for Drizzle

**Security**:
- `SESSION_SECRET`: Express session encryption key (defaults to insecure fallback)
- `ADMIN_PASSWORD`: Admin dashboard password (no default)
- `WALLET_ENCRYPTION_KEY`: AES key for encrypting seed phrases (defaults to insecure fallback)

**Server**:
- `PORT`: Server port (defaults to 5000)
- `NODE_ENV`: Set to "production" for production builds

⚠️ Never commit .env files. All encryption keys must be set in production environments.

## Development Guidelines

### Ripple Network Configuration

Currently connected to **Ripple Testnet** (`wss://s.altnet.rippletest.net:51233`) in `server/ripple-service.ts:24`.

**For production deployment**:
1. Change Client URL to mainnet: `wss://xrplcluster.com` or `wss://s1.ripple.com`
2. Replace `fundWallet()` calls (testnet-only) with proper wallet funding logic
3. Update environment configuration for mainnet credentials

### File Upload Strategy

Currently using **in-memory storage** via Multer (`multer.memoryStorage()`).

**Before production**:
- Integrate cloud storage (AWS S3, Cloudinary, or similar)
- Update `routes.ts` multer configuration
- Modify product creation logic to save to cloud and store URLs

### Testing Approach

- Type checking with `npm run check` is the primary gate (treat type errors as blockers)
- Test files use `.test.tsx` (client) or `.test.ts` (server) convention
- Framework: Vitest + React Testing Library (client), Vitest + Supertest (server)
- `tsconfig.json` excludes `**/*.test.ts` from builds
- Focus test coverage on: mnemonic generation, wallet conversions, NFT minting, inventory management

### Code Style

- **Strict TypeScript**: 2-space indentation, no `any` types
- **Naming**: PascalCase for components, useFoo for hooks, camelCase elsewhere, UPPERCASE for env vars
- **Components**: Functional, Tailwind-first with tokens in `client/src/index.css`
- **Server**: Thin routing layer, business logic in service modules
- **Formatting**: Keep server route handlers focused and delegate to services

### Authentication System

**Admin Auth**:
- Password-based verification via `verifyAdminPassword()` in admin-auth.ts
- Session flag `isAdminAuthenticated` for protecting admin routes
- Middleware: `requireAdminAuth` wraps protected endpoints

**Customer Auth**:
- Registration: POST `/api/customer/register` (email uniqueness enforced)
- Login: POST `/api/customer/login`
- Session: GET `/api/customer/me` (excludes password field)
- Logout: POST `/api/customer/logout`
- All requests require `credentials: 'include'` for cookie persistence
- Passwords hashed with bcrypt (10 salt rounds)

### Migration Workflow

When modifying `shared/schema.ts`:
1. Update table definitions
2. Run `npm run db:push` to sync PostgreSQL
3. Commit both schema changes and generated migrations/ files
4. Document breaking changes in PR (especially new required env vars)

### Design System Reference

See `design_guidelines.md` for:
- Color palette (dark/light mode tokens)
- Typography scale and font families
- Layout spacing primitives
- Component patterns (product cards, NFT badges, wallet integration)
- Blockchain trust indicators (verification badges, transaction status)
- Animation guidelines (minimal, purposeful only)

## Key Technical Decisions

1. **ESM Throughout**: Uses ES modules (`"type": "module"` in package.json), not CommonJS
2. **Drizzle ORM**: Chosen for type-safe queries and automatic schema inference
3. **Session-Based Auth**: Express sessions over JWT (simpler for server-rendered hybrid)
4. **MemStorage Interface**: Allows easy swap between in-memory and database persistence
5. **Ripple Testnet**: Development default, requires explicit mainnet migration
6. **BIP39 Mnemonics**: User-friendly 24-word phrases instead of raw hex seeds
7. **Purchase-Specific Barcodes**: Each sale generates unique NFT (not reusing product barcode)
8. **Inventory Limits**: Hard cap of 500 sales per product (configurable in schema)

## Important Gotchas

- **Never log seed phrases** or encryption keys (security violation)
- **Schema changes require db:push** before testing backend
- **Ripple connection must be active** before minting NFTs (service maintains persistent connection)
- **Session cookie must be httpOnly** in production (XSS protection)
- **Product salesCount is atomic** (prevent race conditions during concurrent purchases)
- **Transaction rollback needed** if NFT minting fails after creating database records

## Related Documentation

- See `AGENTS.md` for original repository guidelines (build commands, commit style)
- See `design_guidelines.md` for UI/UX specifications
- See `replit.md` for Replit-specific deployment context
