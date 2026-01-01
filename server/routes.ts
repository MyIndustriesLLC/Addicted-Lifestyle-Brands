import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import bcrypt from "bcrypt";
import session from "express-session";
import { storage } from "./storage";
import { rippleService } from "./ripple-service";
import {
  insertProductSchema,
  insertTransactionSchema,
  insertCustomerSchema,
  insertEmployeeSchema,
} from "../shared/schema";
import { z } from "zod";
import { requireAdminAuth, verifyAdminPassword } from "./admin-auth";
import { qrCodeGenerator } from "./services/qrcode-generator";
import { imageComposer } from "./services/image-composer";
import { printfulClient } from "./services/printful-client";
import { emailService } from "./services/email";

declare module "express-session" {
  interface SessionData {
    customerId?: string;
    isAdminAuthenticated?: boolean;
  }
}

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create product (admin)
  app.post("/api/products", requireAdminAuth, upload.single("image"), async (req, res) => {
    try {
      const data = JSON.parse(req.body.data || "{}");
      
      const validated = insertProductSchema.parse({
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        barcodeId: data.barcodeId,
        nftStatus: "available",
        levelRequired: data.levelRequired || null
      });

      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Purchase product and mint NFT
  app.post("/api/products/:id/purchase", async (req, res) => {
    try {
      const { buyerWallet } = req.body;

      if (!buyerWallet) {
        return res.status(400).json({ error: "Buyer wallet address required" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check level requirement if product has one
      if (product.levelRequired && req.session.customerId) {
        const customer = await storage.getCustomer(req.session.customerId);
        if (customer) {
          const customerLevel = parseInt(customer.level);
          const requiredLevel = parseInt(product.levelRequired);
          if (customerLevel < requiredLevel) {
            return res.status(403).json({
              error: `This product requires Level ${requiredLevel}. You are Level ${customerLevel}.`,
            });
          }
        }
      }

      // Check inventory availability
      const isAvailable = await storage.checkInventoryAvailable(product.id);
      if (!isAvailable) {
        return res.status(400).json({ error: "Product sold out - inventory limit reached" });
      }

      // Generate unique barcode for this purchase
      const uniqueBarcodeId = Math.random().toString(36).substring(2, 12).toUpperCase();
      
      // Increment sales count and get purchase number
      const purchaseNumber = await storage.incrementProductSales(product.id);

      // Create transaction with unique barcode
      const transaction = await storage.createTransaction({
        productId: product.id,
        buyerWallet,
        amount: product.price,
        status: "pending",
        uniqueBarcodeId,
        purchaseNumber: purchaseNumber.toString()
      });

      // Create NFT record
      const nft = await storage.createNFT({
        productId: product.id,
        status: "pending"
      });

      // Get customer details for NFT metadata
      const customer = req.session.customerId
        ? await storage.getCustomer(req.session.customerId)
        : null;

      // Get current sales count for this product
      const currentSalesCount = parseInt(product.salesCount) || 0;

      // Mint NFT on Ripple with enhanced metadata
      const mintResult = await rippleService.mintNFT({
        barcodeId: uniqueBarcodeId,
        productName: product.name,
        productId: product.id,
        purchaseNumber,
        totalSold: currentSalesCount + 1,
        collectionName: "NFT Streetwear Collection",
        customerName: customer?.name || "Anonymous",
        customerWallet: buyerWallet,
      });

      if (mintResult.success) {
        // Update NFT with blockchain data
        await storage.updateNFT(nft.id, {
          tokenId: mintResult.tokenId,
          ownerWallet: buyerWallet,
          transactionHash: mintResult.transactionHash,
          status: "minted",
          mintedAt: new Date()
        });

        // Update transaction
        await storage.updateTransaction(transaction.id, {
          nftId: nft.id,
          txHash: mintResult.transactionHash,
          status: "completed"
        });

        // Award 25 points for purchase if customer is authenticated
        if (req.session.customerId) {
          await storage.addPoints(req.session.customerId, 25);
          await storage.updateCustomerLevel(req.session.customerId);

          // Check for level 100 reward
          const customer = await storage.getCustomer(req.session.customerId);
          if (customer && parseInt(customer.level) >= 100 && !customer.level100RewardClaimed) {
            await storage.updateCustomer(req.session.customerId, {
              level100RewardClaimed: new Date(),
            });
            // TODO: Flag for admin to fulfill free custom T-shirt
          }

          // PRINTFUL INTEGRATION FLOW
          if (customer) {
            try {
              console.log("Starting Printful integration for transaction:", transaction.id);

              // Step 1: Generate QR code for NFT
              const qrCodeBuffer = await qrCodeGenerator.generateNFTQRCodeBuffer({
                tokenId: mintResult.tokenId || "",
                issuer: rippleService.getIssuerAddress(),
                walletAddress: buyerWallet,
              });

              // Generate data URL for email
              const qrCodeDataUrl = await qrCodeGenerator.generateNFTQRCode({
                tokenId: mintResult.tokenId || "",
                issuer: rippleService.getIssuerAddress(),
                walletAddress: buyerWallet,
              });

              // Step 2: Create print file with QR code
              const printFile = await imageComposer.createQRPrintFile(qrCodeBuffer, 1000);

              // Step 3: Upload QR code file to Printful
              const printfulFileId = await printfulClient.uploadFile(
                printFile,
                `nft_qr_${uniqueBarcodeId}.png`
              );

              // Step 4: Create Printful order
              // Note: You'll need to implement a way to collect shipping address from customer
              // For now, using a placeholder - in production, get from customer profile/checkout
              const printfulVariantId = parseInt(process.env.PRINTFUL_TSHIRT_VARIANT_ID || "4012");

              const printfulOrder = await printfulClient.createOrder({
                recipient: {
                  name: customer.name,
                  address1: "123 Main St", // TODO: Get from shipping address
                  city: "San Francisco",
                  state_code: "CA",
                  country_code: "US",
                  zip: "94102",
                  email: customer.email,
                },
                items: [
                  {
                    variant_id: printfulVariantId,
                    quantity: 1,
                    files: [
                      {
                        url: `https://www.printful.com/files/${printfulFileId}`,
                        position: {
                          area_width: 1800,
                          area_height: 2400,
                          width: 400,
                          height: 400,
                          top: 200,
                          left: 100,
                        },
                      },
                    ],
                    retail_price: product.price,
                    name: product.name,
                  },
                ],
                confirm: false, // Set to true in production to auto-submit for fulfillment
              });

              // Step 5: Send NFT email to customer
              await emailService.sendNFTEmail({
                recipientEmail: customer.email,
                recipientName: customer.name,
                nftTokenId: mintResult.tokenId || "",
                nftIssuer: rippleService.getIssuerAddress(),
                walletAddress: buyerWallet,
                productName: product.name,
                qrCodeDataUrl,
              });

              // Step 6: Update transaction with Printful order details
              await storage.updateTransaction(transaction.id, {
                printfulOrderId: printfulOrder.result.id.toString(),
                printfulStatus: printfulOrder.result.status,
                printfulFileId: printfulFileId.toString(),
                emailSent: new Date(),
              });

              console.log("Printful integration completed successfully");
              console.log(`- Printful Order ID: ${printfulOrder.result.id}`);
              console.log(`- Email sent to: ${customer.email}`);
            } catch (printfulError) {
              console.error("Printful integration error:", printfulError);
              // Don't fail the entire transaction if Printful fails
              // Log error and continue - admin can manually create order
              console.error("Transaction succeeded but Printful order failed - requires manual processing");
            }
          }
        }

        res.json({
          success: true,
          transaction: {
            ...transaction,
            nftId: nft.id,
            txHash: mintResult.transactionHash,
            status: "completed"
          },
          nft: {
            ...nft,
            tokenId: mintResult.tokenId,
            transactionHash: mintResult.transactionHash,
            status: "minted"
          },
          uniqueBarcodeId,
          purchaseNumber
        });
      } else {
        // Rollback on failure - decrement sales count
        const product = await storage.getProduct(req.params.id);
        if (product) {
          const currentSales = parseInt(product.salesCount);
          product.salesCount = Math.max(0, currentSales - 1).toString();
        }
        
        await storage.updateNFT(nft.id, { status: "failed" });
        await storage.updateTransaction(transaction.id, { status: "failed" });

        res.status(500).json({ 
          success: false, 
          error: mintResult.error || "NFT minting failed" 
        });
      }
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(500).json({ error: "Purchase failed" });
    }
  });

  // Get all transactions (admin)
  app.get("/api/transactions", requireAdminAuth, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Check network status
  app.get("/api/network/status", async (req, res) => {
    try {
      const isConnected = await rippleService.getNetworkStatus();
      res.json({ connected: isConnected });
    } catch (error) {
      res.json({ connected: false });
    }
  });

  // NFT Verification - Public endpoint
  app.get("/api/nft/verify/:tokenId", async (req, res) => {
    try {
      const { tokenId } = req.params;

      if (!tokenId) {
        return res.status(400).json({ error: "Token ID required" });
      }

      // Get NFT details from Ripple network
      const nftDetails = await rippleService.getNFTDetails(tokenId);

      if (!nftDetails.success) {
        return res.status(404).json({
          error: "NFT not found or invalid Token ID",
          details: nftDetails.error
        });
      }

      // Get product and transaction info from database
      const nft = await storage.getNFTByTokenId(tokenId);
      let productInfo = null;
      let transactionInfo = null;

      if (nft) {
        const product = await storage.getProduct(nft.productId);
        const transactions = await storage.getAllTransactions();
        const transaction = transactions.find(t => t.nftId === nft.id);

        productInfo = product ? {
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
        } : null;

        transactionInfo = transaction ? {
          purchaseDate: transaction.createdAt,
          amount: transaction.amount,
          status: transaction.status,
        } : null;
      }

      res.json({
        success: true,
        verified: true,
        nft: {
          tokenId: nftDetails.tokenId,
          issuer: nftDetails.issuer,
          currentOwner: nftDetails.owner,
          metadata: nftDetails.metadata,
          sequence: nftDetails.sequence,
          isTransferable: (nftDetails.flags & 8) !== 0,
        },
        product: productInfo,
        transaction: transactionInfo,
        verifiedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("NFT verification error:", error);
      res.status(500).json({
        error: "Verification failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate barcode ID (admin only)
  app.post("/api/barcode/generate", requireAdminAuth, (req, res) => {
    const randomId = Math.random().toString(36).substring(2, 12).toUpperCase();
    res.json({ barcodeId: randomId });
  });

  // Admin authentication
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    if (verifyAdminPassword(password)) {
      req.session.isAdminAuthenticated = true;
      return res.json({ success: true });
    }

    res.status(401).json({ error: "Invalid password" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.isAdminAuthenticated = false;
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/check", (req, res) => {
    res.json({ authenticated: !!req.session.isAdminAuthenticated });
  });

  // Admin engagement stats
  app.get("/api/admin/engagement/stats", requireAdminAuth, async (_req, res) => {
    try {
      const posts = await storage.getAllPosts(1000);
      const customers = await storage.getAllCustomers();

      const totalLikes = posts.reduce((sum, post) => sum + parseInt(post.likesCount || "0"), 0);
      const totalComments = posts.reduce((sum, post) => sum + parseInt(post.commentsCount || "0"), 0);
      const totalEngagement = totalLikes + totalComments;

      const level100Customers = customers.filter(c => parseInt(c.level) >= 100);
      const level100Pending = level100Customers.filter(c => !c.level100RewardClaimed);

      res.json({
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalEngagement,
        level100Count: level100Customers.length,
        level100Pending: level100Pending.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch engagement stats" });
    }
  });

  app.get("/api/admin/engagement/top-contributors", requireAdminAuth, async (_req, res) => {
    try {
      const customers = await storage.getAllCustomers();

      const topContributors = await Promise.all(
        customers.map(async (customer) => {
          const posts = await storage.getPostsByCustomerId(customer.id);
          const totalLikes = posts.reduce((sum, post) => sum + parseInt(post.likesCount || "0"), 0);
          const totalComments = posts.reduce((sum, post) => sum + parseInt(post.commentsCount || "0"), 0);

          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            level: customer.level,
            points: customer.points,
            postsCount: posts.length,
            totalLikes,
            totalComments,
            engagement: totalLikes + totalComments,
          };
        })
      );

      topContributors.sort((a, b) => parseInt(b.points) - parseInt(a.points));
      res.json(topContributors.slice(0, 10));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top contributors" });
    }
  });

  app.get("/api/admin/engagement/level100", requireAdminAuth, async (_req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      const level100Customers = customers
        .filter(c => parseInt(c.level) >= 100 && !c.level100RewardClaimed)
        .map(({ password: _pw, ...customer }) => customer);

      res.json(level100Customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch level 100 customers" });
    }
  });

  app.post("/api/admin/engagement/claim-reward/:customerId", requireAdminAuth, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (parseInt(customer.level) < 100) {
        return res.status(400).json({ error: "Customer has not reached level 100" });
      }

      await storage.updateCustomer(req.params.customerId, {
        level100RewardClaimed: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to claim reward" });
    }
  });

  // Customer routes (admin only)
  app.get("/api/customers", requireAdminAuth, async (_req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      const enrichedCustomers = await Promise.all(
        customers.map(async (customer) => {
          const wallet = await storage.getWalletByCustomerId(customer.id);
          const { password: _pw, ...safeCustomer } = customer;
          return {
            ...safeCustomer,
            walletAddress: wallet?.xrpAddress ?? null,
          };
        })
      );
      res.json(enrichedCustomers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", requireAdminAuth, async (req, res) => {
    try {
      const validated = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validated);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.updateCustomer(req.params.id, req.body);
      const customer = await storage.getCustomer(req.params.id);
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Employee routes (admin only)
  app.get("/api/employees", requireAdminAuth, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", requireAdminAuth, async (req, res) => {
    try {
      const validated = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validated);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.updateEmployee(req.params.id, req.body);
      const employee = await storage.getEmployee(req.params.id);
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteEmployee(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Product management (admin only)
  app.patch("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.updateProduct(req.params.id, req.body);
      const product = await storage.getProduct(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Customer authentication
  app.post("/api/customer/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name required" });
      }

      // Check if customer already exists
      const existing = await storage.getCustomerByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create customer
      const customer = await storage.createCustomer({
        email,
        password: hashedPassword,
        name,
      });

      // Generate XRP wallet
      const { WalletService } = await import("./wallet-service.js");
      const generatedWallet = WalletService.generateWallet();

      // Store wallet
      const wallet = await storage.createWallet({
        customerId: customer.id,
        xrpAddress: generatedWallet.xrpAddress,
        encryptedSeedPhrase: generatedWallet.encryptedSeedPhrase,
      });

      // Store customer ID in session
      req.session.customerId = customer.id;

      // Return customer data with wallet and seed phrase (ONLY TIME WE SHOW SEED PHRASE)
      const { password: _, ...customerData } = customer;
      res.json({
        ...customerData,
        wallet: {
          xrpAddress: wallet.xrpAddress,
          seedPhrase: generatedWallet.seedPhrase, // Show only once!
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/customer/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const customer = await storage.getCustomerByEmail(email);
      if (!customer || !customer.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, customer.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.customerId = customer.id;

      const { password: _, ...customerData } = customer;
      res.json(customerData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/customer/me", async (req, res) => {
    try {
      if (!req.session.customerId) {
        return res.json({ authenticated: false });
      }

      const customer = await storage.getCustomer(req.session.customerId);
      if (!customer) {
        return res.json({ authenticated: false });
      }

      // Get customer's wallet
      const wallet = await storage.getWalletByCustomerId(customer.id);

      const { password: _, ...customerData } = customer;
      res.json({ 
        authenticated: true, 
        customer: {
          ...customerData,
          walletAddress: wallet?.xrpAddress ?? null,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get customer data" });
    }
  });

  app.post("/api/customer/logout", (req, res) => {
    req.session.customerId = undefined;
    res.json({ success: true });
  });

  // Get public customer profiles (for displaying post authors)
  app.get("/api/customers/public", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      // Only return public profile data - no email, address, or private info
      const publicProfiles = customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        level: customer.level,
        points: customer.points,
        followersCount: customer.followersCount,
        followingCount: customer.followingCount,
      }));
      res.json(publicProfiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer profiles" });
    }
  });

  // ============================================
  // ENGAGEMENT SYSTEM ROUTES
  // ============================================

  // Create post
  app.post("/api/posts", async (req, res) => {
    if (!req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { imageUrl, caption } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL required" });
      }

      const post = await storage.createPost({
        customerId: req.session.customerId,
        imageUrl,
        caption: caption || "",
      });

      // Award 10 points for posting
      await storage.addPoints(req.session.customerId, 10);
      await storage.updateCustomerLevel(req.session.customerId);

      res.json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Get all posts (community feed)
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getAllPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get following feed
  app.get("/api/posts/following", async (req, res) => {
    if (!req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getFollowingFeed(req.session.customerId, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following feed" });
    }
  });

  // Get posts by customer
  app.get("/api/posts/customer/:customerId", async (req, res) => {
    try {
      const posts = await storage.getPostsByCustomerId(req.params.customerId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer posts" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Only post owner can delete
      if (post.customerId !== req.session.customerId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deletePost(req.params.id);

      // Deduct 10 points for deleted post
      await storage.addPoints(req.session.customerId, -10);
      await storage.updateCustomerLevel(req.session.customerId);

      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Toggle like on post
  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const alreadyLiked = await storage.getPostLike(
        req.params.id,
        req.session.customerId
      );

      if (alreadyLiked) {
        await storage.deletePostLike(req.params.id, req.session.customerId);
        await storage.decrementPostLikes(req.params.id);
      } else {
        await storage.createPostLike(req.params.id, req.session.customerId);
        await storage.incrementPostLikes(req.params.id);
      }

      const post = await storage.getPost(req.params.id);
      res.json({ liked: !alreadyLiked, likesCount: post?.likesCount });
    } catch (error) {
      console.error("Like toggle error:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Get comments for post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Add comment to post
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comment content required" });
      }

      const comment = await storage.createComment({
        postId: req.params.id,
        customerId: req.session.customerId,
        content: content.trim(),
      });

      await storage.incrementPostComments(req.params.id);
      res.json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Toggle follow
  app.post("/api/customers/:id/follow", async (req, res) => {
    if (!req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Prevent self-following
      if (req.params.id === req.session.customerId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }

      const isFollowing = await storage.isFollowing(
        req.session.customerId,
        req.params.id
      );

      if (isFollowing) {
        await storage.deleteFollow(req.session.customerId, req.params.id);
      } else {
        await storage.createFollow(req.session.customerId, req.params.id);
      }

      res.json({ following: !isFollowing });
    } catch (error) {
      console.error("Follow toggle error:", error);
      res.status(500).json({ error: "Failed to toggle follow" });
    }
  });

  // Get customer followers
  app.get("/api/customers/:id/followers", async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.id);
      // Remove passwords from response
      const sanitized = followers.map(({ password, ...rest }) => rest);
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });

  // Get customer following
  app.get("/api/customers/:id/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.id);
      // Remove passwords from response
      const sanitized = following.map(({ password, ...rest }) => rest);
      res.json(sanitized);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
