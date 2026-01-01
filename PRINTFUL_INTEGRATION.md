# Printful Integration Guide

## Overview

This NFT Streetwear platform integrates with Printful to automate the entire order fulfillment process. When a customer purchases a product, three automated actions occur:

1. **NFT QR Code Minting** - A unique NFT is minted on the Ripple (XRP) network
2. **Customer Email** - NFT information and QR code are sent via email
3. **Printful Order** - QR code is added to left sleeve and order is sent to Printful for production

---

## Prerequisites

Before setting up the integration, you need:

1. **Printful Account** - Sign up at [printful.com](https://www.printful.com)
2. **Printful Store** - Create an API store in your Printful dashboard
3. **Email Service** - Gmail account with App Password or SMTP server
4. **Ripple Wallet** - Already configured in your app

---

## Setup Instructions

### 1. Get Your Printful API Key

1. Log in to [Printful Dashboard](https://www.printful.com/dashboard)
2. Go to **Settings** → **API**
3. Create a new **Private App** or **API Key**
4. Copy your API key

### 2. Configure Product Variants

1. Browse the [Printful Catalog](https://www.printful.com/catalog)
2. Find the products you want to sell (e.g., Unisex T-Shirt)
3. Use the [Printful API Documentation](https://developers.printful.com/docs/) to find variant IDs
4. Common variants:
   - Bella + Canvas 3001 T-Shirt (S): `4012`
   - Bella + Canvas 3001 T-Shirt (M): `4013`
   - Bella + Canvas 3001 T-Shirt (L): `4014`
   - Gildan 18500 Hoodie (M): `4322`

### 3. Set Up Email Service

#### Option A: Gmail

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use this app password in your `.env` file

#### Option B: Custom SMTP

Use your own SMTP server credentials

### 4. Configure Environment Variables

Update your `.env` file with the following:

```env
# Printful Integration
PRINTFUL_API_KEY=your_actual_printful_api_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Printful Product Variant IDs
PRINTFUL_TSHIRT_VARIANT_ID=4012
```

---

## How It Works

### Purchase Flow

When a customer completes a purchase:

```
1. Customer submits order →
2. NFT is minted on Ripple →
3. QR code is generated with NFT details →
4. QR code image uploaded to Printful →
5. Printful order created with QR on left sleeve →
6. Email sent to customer with NFT info →
7. Transaction updated with Printful order ID
```

### Technical Details

#### 1. QR Code Generation

- Contains: NFT Token ID, Issuer Address, Wallet Address, Network Info
- Format: 512x512 PNG with high error correction
- Encoded: JSON payload for easy scanning

#### 2. Image Composition

- QR code sized to 400x400 pixels for print
- Positioned on left sleeve (15% from left, 25% from top)
- Uploaded to Printful file library

#### 3. Printful Order

- Uses Catalog API variant ID
- Files attached with position coordinates
- Set to draft mode by default (`confirm: false`)
- Admin can manually confirm in Printful dashboard

#### 4. Customer Email

- HTML formatted with NFT details
- Includes QR code image
- Instructions for adding NFT to wallet
- Responsive design for mobile

---

## Database Schema

New fields added to `transactions` table:

```typescript
printfulOrderId: number | null        // Printful order ID
printfulStatus: string | null         // Order status from Printful
printfulFileId: number | null         // Uploaded QR code file ID
emailSent: timestamp | null           // When NFT email was sent
```

New table `shippingAddresses`:

```typescript
id: string
customerId: string
name: string
address1: string
address2: string | null
city: string
stateCode: string | null
countryCode: string
zip: string
phone: string | null
isDefault: timestamp | null
createdAt: timestamp
```

---

## Testing

### Test the Integration

1. Start the server: `npm run dev`
2. Register a customer account
3. Add a test shipping address (currently hardcoded in routes.ts)
4. Purchase a product
5. Check console logs for:
   ```
   Starting Printful integration for transaction: <id>
   File uploaded to Printful: ID <file_id>
   Printful order created: ID <order_id>
   NFT email sent successfully to <email>
   Printful integration completed successfully
   ```

### Verify in Printful Dashboard

1. Log in to [Printful Dashboard](https://www.printful.com/dashboard)
2. Go to **Orders** → **All Orders**
3. Find your draft order
4. Review the mockup with QR code on left sleeve
5. Manually confirm for production or edit as needed

### Check Customer Email

- Email should arrive within seconds
- Contains NFT Token ID, Issuer, Wallet Address
- Includes scannable QR code image
- Has instructions for adding to XRP wallet

---

## Troubleshooting

### Printful API Errors

**Error: "Printful API key not configured"**
- Check `.env` file has `PRINTFUL_API_KEY` set
- Restart server after updating `.env`

**Error: "Printful API error: 401"**
- API key is invalid or expired
- Generate new key in Printful dashboard

**Error: "Printful API error: 400"**
- Invalid variant ID
- Check product catalog for correct variant
- Update `PRINTFUL_TSHIRT_VARIANT_ID` in `.env`

### Email Errors

**Error: "Email service not configured"**
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Restart server after updating

**Error: "Failed to send NFT email"**
- Check Gmail App Password is correct
- Ensure 2FA is enabled on Gmail
- Check SMTP settings for custom servers

### QR Code Issues

**QR code not visible on mockup**
- Check file upload success in console
- Verify position coordinates in code
- Review print file in Printful dashboard

---

## Production Checklist

Before going live:

- [ ] Set `confirm: true` in Printful order creation (routes.ts line 251)
- [ ] Replace hardcoded shipping address with real customer data
- [ ] Implement shipping address collection in checkout flow
- [ ] Add error notifications for failed Printful orders
- [ ] Set up Printful webhook for order status updates
- [ ] Test with real Printful production store
- [ ] Configure professional email domain
- [ ] Add retry logic for failed API calls
- [ ] Implement Printful order tracking for customers
- [ ] Add admin panel for manual Printful order management

---

## Advanced Features

### Shipping Address Collection

To collect shipping addresses from customers, implement:

1. Add checkout form with address fields
2. Save to `shippingAddresses` table
3. Pass to Printful order in purchase route

Example storage methods needed:

```typescript
// Add to IStorage interface
async createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress>;
async getDefaultShippingAddress(customerId: string): Promise<ShippingAddress | undefined>;
```

### Printful Webhooks

Set up webhooks to receive order status updates:

```typescript
app.post("/webhooks/printful", async (req, res) => {
  const { type, data } = req.body;

  if (type === "order_updated") {
    await storage.updateTransaction(data.external_id, {
      printfulStatus: data.status,
    });
  }

  res.json({ success: true });
});
```

### Multiple Product Types

Support different products (hoodies, hats, etc.):

1. Add `printfulVariantId` field to products table
2. Set variant ID when creating product
3. Use product's variant ID in Printful order:

```typescript
const printfulVariantId = parseInt(product.printfulVariantId || process.env.PRINTFUL_TSHIRT_VARIANT_ID);
```

---

## API Reference

### Printful Client Methods

```typescript
// Upload file to Printful
printfulClient.uploadFile(buffer: Buffer, filename: string): Promise<number>

// Create order
printfulClient.createOrder(orderData: PrintfulOrderRequest): Promise<PrintfulOrderResponse>

// Confirm order for production
printfulClient.confirmOrder(orderId: number): Promise<void>

// Get order status
printfulClient.getOrderStatus(orderId: number): Promise<any>
```

### QR Code Generator

```typescript
// Generate QR code as data URL
qrCodeGenerator.generateNFTQRCode(data: NFTQRData): Promise<string>

// Generate QR code as buffer
qrCodeGenerator.generateNFTQRCodeBuffer(data: NFTQRData): Promise<Buffer>
```

### Email Service

```typescript
// Send NFT email to customer
emailService.sendNFTEmail(data: NFTEmailData): Promise<boolean>
```

### Image Composer

```typescript
// Add QR code to product image
imageComposer.addQRCodeToImage(options: ImageCompositionOptions): Promise<Buffer>

// Create standalone QR print file
imageComposer.createQRPrintFile(qrCodeBuffer: Buffer, size?: number): Promise<Buffer>
```

---

## Support

For issues or questions:

- **Printful API**: https://developers.printful.com/docs/
- **Printful Support**: https://www.printful.com/contact
- **Ripple (XRP)**: https://xrpl.org/docs.html
- **Nodemailer**: https://nodemailer.com/about/

---

## Sources

- [Printful API Documentation](https://developers.printful.com/docs/)
- [Printful Catalog](https://www.printful.com/catalog)
- [XRP Ledger Docs](https://xrpl.org/)
- [Nodemailer Documentation](https://nodemailer.com/)
