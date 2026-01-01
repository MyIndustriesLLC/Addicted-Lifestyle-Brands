import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Mail, ExternalLink, Package2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transaction, Product } from "@shared/schema";
import type { AdminCustomer } from "@/types/api";

interface OrderDetails extends Transaction {
  product?: Product;
  customer?: AdminCustomer;
}

export function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<AdminCustomer[]>({
    queryKey: ["/api/customers"],
  });

  const resendEmailMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest("POST", `/api/orders/${orderId}/resend-email`);
    },
    onSuccess: () => {
      toast({ title: "Email resent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to resend email", variant: "destructive" });
    },
  });

  // Filter and search transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesSearch =
      transaction.uniqueBarcodeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.buyerWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (transaction: Transaction) => {
    const product = products.find(p => p.id === transaction.productId);
    const customer = customers.find(c => c.walletAddress === transaction.buyerWallet);

    setSelectedOrder({
      ...transaction,
      product,
      customer,
    });
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPrintfulStatusBadge = (order: OrderDetails) => {
    if (!order.printfulOrderId) {
      return <Badge variant="outline">No Printful Order</Badge>;
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Package2 className="h-3 w-3" />
        Order #{order.printfulOrderId}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and manage all customer orders and transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredTransactions.length} orders
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by barcode, wallet, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Printful</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const product = products.find(p => p.id === transaction.productId);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-xs">
                          {transaction.uniqueBarcodeId || transaction.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {product?.name || "Unknown Product"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {transaction.buyerWallet.slice(0, 10)}...
                        </TableCell>
                        <TableCell>${parseFloat(transaction.amount).toFixed(2)} USD</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.printfulOrderId ? (
                            <Badge variant="secondary" className="gap-1">
                              <Package2 className="h-3 w-3" />
                              #{transaction.printfulOrderId}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(transaction)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order {selectedOrder?.uniqueBarcodeId || selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedOrder.status)}
                    {selectedOrder.status === "completed" && selectedOrder.emailSentAt && (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="h-3 w-3" />
                        Email Sent
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedOrder.printfulOrderId && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.printful.com/dashboard/default/orders/${selectedOrder.printfulOrderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Package2 className="h-4 w-4 mr-2" />
                      View in Printful
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                  <p className="text-sm font-mono">{selectedOrder.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Barcode ID</p>
                  <p className="text-sm font-mono">{selectedOrder.uniqueBarcodeId || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Purchase Number</p>
                  <p className="text-sm">#{selectedOrder.purchaseNumber || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-sm font-semibold">${parseFloat(selectedOrder.amount).toFixed(2)} USD</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                {selectedOrder.emailSentAt && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email Sent</p>
                    <p className="text-sm">
                      {new Date(selectedOrder.emailSentAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Product Information */}
              {selectedOrder.product && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium">Product Information</p>
                  <div className="flex gap-4">
                    <img
                      src={selectedOrder.product.imageUrl}
                      alt={selectedOrder.product.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{selectedOrder.product.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.product.description}</p>
                      <p className="text-sm font-semibold">${parseFloat(selectedOrder.product.price).toFixed(2)} USD</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Customer Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{selectedOrder.customer?.name || "Anonymous"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedOrder.customer?.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                    <p className="text-sm font-mono break-all">{selectedOrder.buyerWallet}</p>
                  </div>
                  {selectedOrder.customer && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Level</p>
                        <p className="text-sm">Level {selectedOrder.customer.level} ({selectedOrder.customer.points} points)</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                        <p className="text-sm">{selectedOrder.customer.totalPurchases} orders</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* NFT Information */}
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">NFT Information</p>
                <div className="grid grid-cols-2 gap-4">
                  {selectedOrder.txHash && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono break-all">{selectedOrder.txHash}</p>
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`https://testnet.xrpl.org/transactions/${selectedOrder.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                {selectedOrder.status === "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      resendEmailMutation.mutate(selectedOrder.id);
                    }}
                    disabled={resendEmailMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {resendEmailMutation.isPending ? "Sending..." : "Resend Email"}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
