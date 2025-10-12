import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { rippleService } from "./ripple-service";
import { insertProductSchema, insertTransactionSchema, insertCustomerSchema, insertEmployeeSchema } from "@shared/schema";
import { z } from "zod";
import { requireAdminAuth, verifyAdminPassword } from "./admin-auth";

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

  // Customer routes (admin only)
  app.get("/api/customers", requireAdminAuth, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
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

  const httpServer = createServer(app);
  return httpServer;
}
