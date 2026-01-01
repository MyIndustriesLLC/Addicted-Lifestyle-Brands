import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Search, Eye, Plus, Minus, Zap, TrendingUp, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Customer, Transaction } from "@shared/schema";
import type { AdminCustomer } from "@/types/api";

export function CustomersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [pointsAmount, setPointsAmount] = useState<string>("");
  const { toast } = useToast();

  const { data: customers = [] } = useQuery<AdminCustomer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const adjustPointsMutation = useMutation({
    mutationFn: async ({ customerId, points }: { customerId: string; points: number }) => {
      return apiRequest("POST", `/api/customers/${customerId}/adjust-points`, { points });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Points adjusted successfully" });
      setPointsDialogOpen(false);
      setPointsAmount("");
    },
    onError: () => {
      toast({ title: "Failed to adjust points", variant: "destructive" });
    },
  });

  // Filter and search customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    const customerLevel = parseInt(customer.level);
    let matchesLevel = true;

    if (levelFilter === "1-10") matchesLevel = customerLevel >= 1 && customerLevel <= 10;
    else if (levelFilter === "11-50") matchesLevel = customerLevel >= 11 && customerLevel <= 50;
    else if (levelFilter === "51-100") matchesLevel = customerLevel >= 51 && customerLevel <= 100;

    return matchesSearch && matchesLevel;
  });

  const handleViewDetails = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleOpenPointsDialog = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setPointsDialogOpen(true);
  };

  const handleAdjustPoints = (add: boolean) => {
    if (!selectedCustomer || !pointsAmount) return;

    const points = parseInt(pointsAmount);
    if (isNaN(points) || points <= 0) {
      toast({ title: "Please enter a valid number", variant: "destructive" });
      return;
    }

    adjustPointsMutation.mutate({
      customerId: selectedCustomer.id,
      points: add ? points : -points,
    });
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(t =>
      customers.find(c => c.id === customerId)?.walletAddress === t.buyerWallet
    );
  };

  const getLevelBadge = (level: string) => {
    const levelNum = parseInt(level);
    let variant: "default" | "secondary" | "destructive" = "secondary";
    let color = "text-gray-600";

    if (levelNum >= 75) {
      variant = "default";
      color = "text-yellow-600";
    } else if (levelNum >= 25) {
      variant = "secondary";
      color = "text-blue-600";
    }

    return (
      <Badge variant={variant} className={color}>
        Level {level}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage all registered customers</CardDescription>
            </div>
            <Badge variant="outline">
              {filteredCustomers.length} customers
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or wallet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1-10">Level 1-10</SelectItem>
                <SelectItem value="11-50">Level 11-50</SelectItem>
                <SelectItem value="51-100">Level 51-100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{customer.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {customer.walletAddress?.slice(0, 10)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{getLevelBadge(customer.level)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <span className="font-medium">{customer.points}</span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalPurchases}</TableCell>
                      <TableCell className="font-semibold">{customer.totalSpent} XRP</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(customer)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPointsDialog(customer)}
                          title="Adjust Points"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete profile for {selectedCustomer?.name || "this customer"}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedCustomer.name || "Anonymous"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedCustomer.email || "N/A"}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                  <p className="text-sm font-mono break-all">{selectedCustomer.walletAddress || "N/A"}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getLevelBadge(selectedCustomer.level)}
                    </div>
                    <p className="text-xs text-muted-foreground">Current Level</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <p className="text-2xl font-bold">{selectedCustomer.points}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <ShoppingBag className="h-4 w-4 text-blue-500" />
                      <p className="text-2xl font-bold">{selectedCustomer.totalPurchases}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Purchases</p>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase History */}
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Purchase History</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getCustomerTransactions(selectedCustomer.id).length > 0 ? (
                    getCustomerTransactions(selectedCustomer.id).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{transaction.uniqueBarcodeId}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.createdAt
                              ? new Date(transaction.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{transaction.amount} XRP</p>
                          <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No purchases yet
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailsOpen(false);
                    handleOpenPointsDialog(selectedCustomer);
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Adjust Points
                </Button>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Customer Points</DialogTitle>
            <DialogDescription>
              Add or remove points for {selectedCustomer?.name || "this customer"}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Points</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <p className="text-2xl font-bold">{selectedCustomer.points}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <div className="mt-1">{getLevelBadge(selectedCustomer.level)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points Amount</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  placeholder="Enter points amount"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleAdjustPoints(false)}
                  disabled={adjustPointsMutation.isPending || !pointsAmount}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Points
                </Button>
                <Button
                  onClick={() => handleAdjustPoints(true)}
                  disabled={adjustPointsMutation.isPending || !pointsAmount}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Points
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
