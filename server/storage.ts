import {
  type Product,
  type InsertProduct,
  type NFT,
  type InsertNFT,
  type Transaction,
  type InsertTransaction,
  type Customer,
  type InsertCustomer,
  type Wallet,
  type InsertWallet,
  type LinkedWallet,
  type InsertLinkedWallet,
  type ConversionTransaction,
  type InsertConversionTransaction,
  type Employee,
  type InsertEmployee,
  type Post,
  type InsertPost,
  type PostLike,
  type InsertPostLike,
  type Comment,
  type InsertComment,
  type Follow,
  type InsertFollow,
} from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  updateProduct(id: string, updates: Partial<Product>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  updateProductNftStatus(id: string, status: string): Promise<void>;
  incrementProductSales(id: string): Promise<number>;
  checkInventoryAvailable(id: string): Promise<boolean>;

  // NFT operations
  createNFT(nft: InsertNFT): Promise<NFT>;
  getNFT(id: string): Promise<NFT | undefined>;
  getNFTByProductId(productId: string): Promise<NFT | undefined>;
  getNFTByTokenId(tokenId: string): Promise<NFT | undefined>;
  updateNFT(id: string, updates: Partial<NFT>): Promise<void>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;

  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<void>;
  deleteCustomer(id: string): Promise<void>;

  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByCustomerId(customerId: string): Promise<Wallet | undefined>;
  getWalletByXrpAddress(xrpAddress: string): Promise<Wallet | undefined>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<void>;
  markSeedPhraseShown(id: string): Promise<void>;

  // Linked Wallet operations
  createLinkedWallet(wallet: InsertLinkedWallet): Promise<LinkedWallet>;
  getLinkedWallet(id: string): Promise<LinkedWallet | undefined>;
  getLinkedWalletsByCustomerId(customerId: string): Promise<LinkedWallet[]>;
  deleteLinkedWallet(id: string): Promise<void>;

  // Conversion Transaction operations
  createConversionTransaction(transaction: InsertConversionTransaction): Promise<ConversionTransaction>;
  getConversionTransaction(id: string): Promise<ConversionTransaction | undefined>;
  getConversionTransactionsByCustomerId(customerId: string): Promise<ConversionTransaction[]>;
  updateConversionTransaction(id: string, updates: Partial<ConversionTransaction>): Promise<void>;

  // Employee operations
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<void>;
  deleteEmployee(id: string): Promise<void>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getAllPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByCustomerId(customerId: string): Promise<Post[]>;
  getFollowingFeed(customerId: string, limit?: number): Promise<Post[]>;
  deletePost(id: string): Promise<void>;
  incrementPostLikes(id: string): Promise<void>;
  decrementPostLikes(id: string): Promise<void>;
  incrementPostComments(id: string): Promise<void>;

  // Post Like operations
  createPostLike(postId: string, customerId: string): Promise<void>;
  deletePostLike(postId: string, customerId: string): Promise<void>;
  getPostLike(postId: string, customerId: string): Promise<boolean>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  deleteComment(id: string): Promise<void>;

  // Follow operations
  createFollow(followerId: string, followingId: string): Promise<void>;
  deleteFollow(followerId: string, followingId: string): Promise<void>;
  getFollowers(customerId: string): Promise<Customer[]>;
  getFollowing(customerId: string): Promise<Customer[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // Points & Level operations
  addPoints(customerId: string, points: number): Promise<void>;
  calculateLevel(points: number): number;
  updateCustomerLevel(customerId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private nfts: Map<string, NFT>;
  private transactions: Map<string, Transaction>;
  private customers: Map<string, Customer>;
  private wallets: Map<string, Wallet>;
  private linkedWallets: Map<string, LinkedWallet>;
  private conversionTransactions: Map<string, ConversionTransaction>;
  private employees: Map<string, Employee>;
  private posts: Map<string, Post>;
  private postLikes: Map<string, { postId: string; customerId: string }>;
  private comments: Map<string, Comment>;
  private follows: Map<string, { followerId: string; followingId: string }>;

  constructor() {
    this.products = new Map();
    this.nfts = new Map();
    this.transactions = new Map();
    this.customers = new Map();
    this.wallets = new Map();
    this.linkedWallets = new Map();
    this.conversionTransactions = new Map();
    this.employees = new Map();
    this.posts = new Map();
    this.postLikes = new Map();
    this.comments = new Map();
    this.follows = new Map();
  }

  reset(): void {
    this.products.clear();
    this.nfts.clear();
    this.transactions.clear();
    this.customers.clear();
    this.wallets.clear();
    this.linkedWallets.clear();
    this.conversionTransactions.clear();
    this.employees.clear();
    this.posts.clear();
    this.postLikes.clear();
    this.comments.clear();
    this.follows.clear();
  }

  // Product operations
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      description: insertProduct.description ?? null,
      nftStatus: insertProduct.nftStatus ?? "available",
      salesCount: insertProduct.salesCount ?? "0",
      inventoryLimit: insertProduct.inventoryLimit ?? "500",
      levelRequired: insertProduct.levelRequired ?? null,
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      Object.assign(product, updates);
      this.products.set(id, product);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async updateProductNftStatus(id: string, status: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.nftStatus = status;
      this.products.set(id, product);
    }
  }

  async incrementProductSales(id: string): Promise<number> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error("Product not found");
    }
    const currentSales = parseInt(product.salesCount);
    const newSalesCount = currentSales + 1;
    product.salesCount = newSalesCount.toString();
    this.products.set(id, product);
    return newSalesCount;
  }

  async checkInventoryAvailable(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) {
      return false;
    }
    const salesCount = parseInt(product.salesCount);
    const inventoryLimit = parseInt(product.inventoryLimit);
    return salesCount < inventoryLimit;
  }

  // NFT operations
  async createNFT(insertNft: InsertNFT): Promise<NFT> {
    const id = randomUUID();
    const nft: NFT = { 
      ...insertNft,
      status: insertNft.status ?? "pending",
      tokenId: insertNft.tokenId ?? null,
      ownerWallet: insertNft.ownerWallet ?? null,
      transactionHash: insertNft.transactionHash ?? null,
      id,
      mintedAt: null
    };
    this.nfts.set(id, nft);
    return nft;
  }

  async getNFT(id: string): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }

  async getNFTByProductId(productId: string): Promise<NFT | undefined> {
    return Array.from(this.nfts.values()).find(
      (nft) => nft.productId === productId
    );
  }

  async getNFTByTokenId(tokenId: string): Promise<NFT | undefined> {
    return Array.from(this.nfts.values()).find(
      (nft) => nft.tokenId === tokenId
    );
  }

  async updateNFT(id: string, updates: Partial<NFT>): Promise<void> {
    const nft = this.nfts.get(id);
    if (nft) {
      Object.assign(nft, updates);
      this.nfts.set(id, nft);
    }
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      status: insertTransaction.status ?? "pending",
      nftId: insertTransaction.nftId ?? null,
      txHash: insertTransaction.txHash ?? null,
      purchaseNumber: insertTransaction.purchaseNumber ?? null,
      printfulOrderId: null,
      printfulStatus: null,
      printfulFileId: null,
      emailSent: null,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      Object.assign(transaction, updates);
      this.transactions.set(id, transaction);
    }
  }

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      totalPurchases: "0",
      totalSpent: "0",
      points: "0",
      level: "1",
      followersCount: "0",
      followingCount: "0",
      level100RewardClaimed: null,
      id,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.email === email
    );
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    const customer = this.customers.get(id);
    if (customer) {
      Object.assign(customer, updates);
      this.customers.set(id, customer);
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    this.customers.delete(id);
  }

  // Wallet operations
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      ...insertWallet,
      seedPhraseShown: null,
      id,
      createdAt: new Date()
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByCustomerId(customerId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.customerId === customerId
    );
  }

  async getWalletByXrpAddress(xrpAddress: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.xrpAddress === xrpAddress
    );
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    const wallet = this.wallets.get(id);
    if (wallet) {
      Object.assign(wallet, updates);
      this.wallets.set(id, wallet);
    }
  }

  async markSeedPhraseShown(id: string): Promise<void> {
    const wallet = this.wallets.get(id);
    if (wallet) {
      wallet.seedPhraseShown = new Date();
      this.wallets.set(id, wallet);
    }
  }

  // Linked Wallet operations
  async createLinkedWallet(insertLinkedWallet: InsertLinkedWallet): Promise<LinkedWallet> {
    const id = randomUUID();
    const linkedWallet: LinkedWallet = {
      ...insertLinkedWallet,
      label: insertLinkedWallet.label ?? null,
      id,
      createdAt: new Date()
    };
    this.linkedWallets.set(id, linkedWallet);
    return linkedWallet;
  }

  async getLinkedWallet(id: string): Promise<LinkedWallet | undefined> {
    return this.linkedWallets.get(id);
  }

  async getLinkedWalletsByCustomerId(customerId: string): Promise<LinkedWallet[]> {
    return Array.from(this.linkedWallets.values()).filter(
      (wallet) => wallet.customerId === customerId
    );
  }

  async deleteLinkedWallet(id: string): Promise<void> {
    this.linkedWallets.delete(id);
  }

  // Conversion Transaction operations
  async createConversionTransaction(insertConversion: InsertConversionTransaction): Promise<ConversionTransaction> {
    const id = randomUUID();
    const conversion: ConversionTransaction = {
      ...insertConversion,
      status: insertConversion.status ?? "pending",
      externalTxId: insertConversion.externalTxId ?? null,
      id,
      createdAt: new Date()
    };
    this.conversionTransactions.set(id, conversion);
    return conversion;
  }

  async getConversionTransaction(id: string): Promise<ConversionTransaction | undefined> {
    return this.conversionTransactions.get(id);
  }

  async getConversionTransactionsByCustomerId(customerId: string): Promise<ConversionTransaction[]> {
    return Array.from(this.conversionTransactions.values()).filter(
      (tx) => tx.customerId === customerId
    );
  }

  async updateConversionTransaction(id: string, updates: Partial<ConversionTransaction>): Promise<void> {
    const conversion = this.conversionTransactions.get(id);
    if (conversion) {
      Object.assign(conversion, updates);
      this.conversionTransactions.set(id, conversion);
    }
  }

  // Employee operations
  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      department: insertEmployee.department ?? null,
      id,
      hiredAt: new Date(),
      createdAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
    const employee = this.employees.get(id);
    if (employee) {
      Object.assign(employee, updates);
      this.employees.set(id, employee);
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    this.employees.delete(id);
  }

  // Post operations
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      caption: insertPost.caption ?? null,
      likesCount: "0",
      commentsCount: "0",
      id,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getAllPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values());
    // Sort by createdAt descending (most recent first)
    allPosts.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });
    return allPosts.slice(offset, offset + limit);
  }

  async getPostsByCustomerId(customerId: string): Promise<Post[]> {
    const posts = Array.from(this.posts.values()).filter(
      (post) => post.customerId === customerId
    );
    // Sort by createdAt descending
    posts.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });
    return posts;
  }

  async getFollowingFeed(customerId: string, limit: number = 20): Promise<Post[]> {
    // Get all users this customer is following
    const following = Array.from(this.follows.values())
      .filter((follow) => follow.followerId === customerId)
      .map((follow) => follow.followingId);

    // Get posts from followed users
    const posts = Array.from(this.posts.values()).filter((post) =>
      following.includes(post.customerId)
    );

    // Sort by createdAt descending
    posts.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });

    return posts.slice(0, limit);
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
    // Also delete associated likes and comments
    Array.from(this.postLikes.entries()).forEach(([likeId, like]) => {
      if (like.postId === id) {
        this.postLikes.delete(likeId);
      }
    });
    Array.from(this.comments.values()).forEach((comment) => {
      if (comment.postId === id) {
        this.comments.delete(comment.id);
      }
    });
  }

  async incrementPostLikes(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      const currentLikes = parseInt(post.likesCount);
      post.likesCount = (currentLikes + 1).toString();
      this.posts.set(id, post);
    }
  }

  async decrementPostLikes(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      const currentLikes = parseInt(post.likesCount);
      post.likesCount = Math.max(0, currentLikes - 1).toString();
      this.posts.set(id, post);
    }
  }

  async incrementPostComments(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      const currentComments = parseInt(post.commentsCount);
      post.commentsCount = (currentComments + 1).toString();
      this.posts.set(id, post);
    }
  }

  // Post Like operations
  async createPostLike(postId: string, customerId: string): Promise<void> {
    const id = randomUUID();
    this.postLikes.set(id, { postId, customerId });
  }

  async deletePostLike(postId: string, customerId: string): Promise<void> {
    Array.from(this.postLikes.entries()).forEach(([id, like]) => {
      if (like.postId === postId && like.customerId === customerId) {
        this.postLikes.delete(id);
      }
    });
  }

  async getPostLike(postId: string, customerId: string): Promise<boolean> {
    return Array.from(this.postLikes.values()).some(
      (like) => like.postId === postId && like.customerId === customerId
    );
  }

  // Comment operations
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const comments = Array.from(this.comments.values()).filter(
      (comment) => comment.postId === postId
    );
    // Sort by createdAt ascending (oldest first)
    comments.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateA - dateB;
    });
    return comments;
  }

  async deleteComment(id: string): Promise<void> {
    this.comments.delete(id);
  }

  // Follow operations
  async createFollow(followerId: string, followingId: string): Promise<void> {
    const id = randomUUID();
    this.follows.set(id, { followerId, followingId });

    // Update follower/following counts
    const follower = await this.getCustomer(followerId);
    const following = await this.getCustomer(followingId);

    if (follower) {
      const currentFollowing = parseInt(follower.followingCount);
      await this.updateCustomer(followerId, {
        followingCount: (currentFollowing + 1).toString()
      });
    }

    if (following) {
      const currentFollowers = parseInt(following.followersCount);
      await this.updateCustomer(followingId, {
        followersCount: (currentFollowers + 1).toString()
      });
    }
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    Array.from(this.follows.entries()).forEach(([id, follow]) => {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        this.follows.delete(id);
      }
    });

    // Update follower/following counts
    const follower = await this.getCustomer(followerId);
    const following = await this.getCustomer(followingId);

    if (follower) {
      const currentFollowing = parseInt(follower.followingCount);
      await this.updateCustomer(followerId, {
        followingCount: Math.max(0, currentFollowing - 1).toString()
      });
    }

    if (following) {
      const currentFollowers = parseInt(following.followersCount);
      await this.updateCustomer(followingId, {
        followersCount: Math.max(0, currentFollowers - 1).toString()
      });
    }
  }

  async getFollowers(customerId: string): Promise<Customer[]> {
    const followerIds = Array.from(this.follows.values())
      .filter((follow) => follow.followingId === customerId)
      .map((follow) => follow.followerId);

    const followers: Customer[] = [];
    for (const id of followerIds) {
      const customer = await this.getCustomer(id);
      if (customer) {
        followers.push(customer);
      }
    }
    return followers;
  }

  async getFollowing(customerId: string): Promise<Customer[]> {
    const followingIds = Array.from(this.follows.values())
      .filter((follow) => follow.followerId === customerId)
      .map((follow) => follow.followingId);

    const following: Customer[] = [];
    for (const id of followingIds) {
      const customer = await this.getCustomer(id);
      if (customer) {
        following.push(customer);
      }
    }
    return following;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      (follow) => follow.followerId === followerId && follow.followingId === followingId
    );
  }

  // Points & Level operations
  calculateLevel(points: number): number {
    return Math.floor(points / 10) + 1; // 10 points per level
  }

  async addPoints(customerId: string, points: number): Promise<void> {
    const customer = await this.getCustomer(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const currentPoints = parseInt(customer.points);
    const newPoints = Math.max(0, currentPoints + points); // Don't allow negative points

    await this.updateCustomer(customerId, {
      points: newPoints.toString()
    });
  }

  async updateCustomerLevel(customerId: string): Promise<void> {
    const customer = await this.getCustomer(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const points = parseInt(customer.points);
    const newLevel = this.calculateLevel(points);

    await this.updateCustomer(customerId, {
      level: newLevel.toString()
    });
  }
}

export const storage = new MemStorage();
