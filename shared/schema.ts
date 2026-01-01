import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  barcodeId: text("barcode_id").notNull().unique(),
  nftStatus: text("nft_status").notNull().default("available"),
  salesCount: numeric("sales_count", { precision: 10, scale: 0 }).notNull().default("0"),
  inventoryLimit: numeric("inventory_limit", { precision: 10, scale: 0 }).notNull().default("500"),
  levelRequired: numeric("level_required", { precision: 10, scale: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfts = pgTable("nfts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  tokenId: text("token_id"),
  ownerWallet: text("owner_wallet"),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"),
  mintedAt: timestamp("minted_at"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  nftId: varchar("nft_id").references(() => nfts.id),

  // DEPRECATED: Keep for historical records (XRP wallet address)
  buyerWallet: text("buyer_wallet"),

  // PayPal payment fields
  paypalOrderId: text("paypal_order_id"),
  paypalTransactionId: text("paypal_transaction_id"),
  paypalPayerEmail: text("paypal_payer_email"),
  paypalPayerName: text("paypal_payer_name"),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // USD (previously XRP)
  currency: text("currency").notNull().default("USD"),
  paymentProvider: text("payment_provider").notNull().default("paypal"),
  txHash: text("tx_hash"), // DEPRECATED: XRP transaction hash
  status: text("status").notNull().default("pending"),
  uniqueBarcodeId: text("unique_barcode_id").notNull(),
  purchaseNumber: numeric("purchase_number", { precision: 10, scale: 0 }),
  printfulOrderId: numeric("printful_order_id", { precision: 20, scale: 0 }),
  printfulStatus: text("printful_status"),
  printfulFileId: numeric("printful_file_id", { precision: 20, scale: 0 }),
  emailSent: timestamp("email_sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  totalPurchases: numeric("total_purchases", { precision: 10, scale: 0 }).notNull().default("0"),
  totalSpent: numeric("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  points: numeric("points", { precision: 10, scale: 0 }).notNull().default("0"),
  level: numeric("level", { precision: 10, scale: 0 }).notNull().default("1"),
  followersCount: numeric("followers_count", { precision: 10, scale: 0 }).notNull().default("0"),
  followingCount: numeric("following_count", { precision: 10, scale: 0 }).notNull().default("0"),
  level100RewardClaimed: timestamp("level_100_reward_claimed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// REMOVED: Wallet-related tables (wallets, linkedWallets, conversionTransactions)
// Customers no longer need XRP wallets for payments (using PayPal instead)
// NFTs are minted to company wallet and customers can import them to their own wallets

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department"),
  hiredAt: timestamp("hired_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  likesCount: numeric("likes_count", { precision: 10, scale: 0 }).notNull().default("0"),
  commentsCount: numeric("comments_count", { precision: 10, scale: 0 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniquePostCustomer: unique().on(table.postId, table.customerId),
}));

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => customers.id),
  followingId: varchar("following_id").notNull().references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueFollowerFollowing: unique().on(table.followerId, table.followingId),
}));

export const shippingAddresses = pgTable("shipping_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  name: text("name").notNull(),
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  stateCode: text("state_code"),
  countryCode: text("country_code").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone"),
  isDefault: timestamp("is_default"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull().default("1"),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => ({
  uniqueCustomerProduct: unique().on(table.customerId, table.productId),
}));

export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchaseAmount: numeric("min_purchase_amount", { precision: 10, scale: 2 }),
  maxUses: numeric("max_uses", { precision: 10, scale: 0 }),
  usedCount: numeric("used_count", { precision: 10, scale: 0 }).notNull().default("0"),
  expiresAt: timestamp("expires_at"),
  active: timestamp("active"), // null = inactive, timestamp = active since
  createdAt: timestamp("created_at").defaultNow(),
});

export const couponUsage = pgTable("coupon_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").notNull().references(() => coupons.id),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow(),
}, (table) => ({
  uniqueCouponCustomerTransaction: unique().on(table.couponId, table.customerId, table.transactionId),
}));

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertNftSchema = createInsertSchema(nfts).omit({
  id: true,
  mintedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  totalPurchases: true,
  totalSpent: true,
});

// REMOVED: Wallet insert schemas (insertWalletSchema, insertLinkedWalletSchema, insertConversionTransactionSchema)

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  hiredAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  commentsCount: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usedCount: true,
});

export const insertCouponUsageSchema = createInsertSchema(couponUsage).omit({
  id: true,
  usedAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNftSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// REMOVED: Wallet type exports (Wallet, InsertWallet, LinkedWallet, InsertLinkedWallet, ConversionTransaction, InsertConversionTransaction)

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

export type CouponUsage = typeof couponUsage.$inferSelect;
export type InsertCouponUsage = z.infer<typeof insertCouponUsageSchema>;
