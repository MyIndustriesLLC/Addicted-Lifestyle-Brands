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
  buyerWallet: text("buyer_wallet").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  txHash: text("tx_hash"),
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

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  xrpAddress: text("xrp_address").notNull().unique(),
  encryptedSeedPhrase: text("encrypted_seed_phrase").notNull(),
  seedPhraseShown: timestamp("seed_phrase_shown"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const linkedWallets = pgTable("linked_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  currency: text("currency").notNull(),
  address: text("address").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversionTransactions = pgTable("conversion_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  rate: numeric("rate", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull().default("pending"),
  externalTxId: text("external_tx_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  seedPhraseShown: true,
});

export const insertLinkedWalletSchema = createInsertSchema(linkedWallets).omit({
  id: true,
  createdAt: true,
});

export const insertConversionTransactionSchema = createInsertSchema(conversionTransactions).omit({
  id: true,
  createdAt: true,
});

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

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNftSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type LinkedWallet = typeof linkedWallets.$inferSelect;
export type InsertLinkedWallet = z.infer<typeof insertLinkedWalletSchema>;

export type ConversionTransaction = typeof conversionTransactions.$inferSelect;
export type InsertConversionTransaction = z.infer<typeof insertConversionTransactionSchema>;

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
