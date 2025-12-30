import type { Customer } from "@shared/schema";

export type AuthStatusResponse = {
  authenticated: boolean;
};

export type CustomerAuthResponse = AuthStatusResponse & {
  customer?: {
    id: string;
    email: string;
    name: string;
    totalPurchases: string;
    totalSpent: string;
    walletAddress: string | null;
  };
};

export type AdminCustomer = Omit<Customer, "password"> & {
  walletAddress: string | null;
};
