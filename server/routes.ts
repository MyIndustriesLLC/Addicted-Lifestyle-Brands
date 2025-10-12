import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { rippleService } from "./ripple-service";
import { insertProductSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
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
  app.post("/api/products", upload.single("image"), async (req, res) => {
    try {
      const data = JSON.parse(req.body.data || "{}");
      
      const validated = insertProductSchema.parse({
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        barcodeId: data.barcodeId,
        nftStatus: "available"
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

      // Mint NFT on Ripple with unique barcode
      const mintResult = await rippleService.mintNFT({
        barcodeId: uniqueBarcodeId,
        productName: product.name,
        productId: product.id,
        purchaseNumber
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
  app.get("/api/transactions", async (req, res) => {
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

  // Generate barcode ID
  app.post("/api/barcode/generate", (req, res) => {
    const randomId = Math.random().toString(36).substring(2, 12).toUpperCase();
    res.json({ barcodeId: randomId });
  });

  const httpServer = createServer(app);
  return httpServer;
}
