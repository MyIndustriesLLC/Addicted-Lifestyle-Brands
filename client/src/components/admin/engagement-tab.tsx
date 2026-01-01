import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, MessageCircle, Image, TrendingUp, Trophy, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EngagementStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalEngagement: number;
  level100Count: number;
  level100Pending: number;
}

interface TopContributor {
  id: string;
  name: string;
  email: string;
  level: string;
  points: string;
  postsCount: number;
  totalLikes: number;
  totalComments: number;
  engagement: number;
}

interface Level100Customer {
  id: string;
  name: string;
  email: string;
  level: string;
  points: string;
}

export function EngagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<EngagementStats>({
    queryKey: ["/api/admin/engagement/stats"],
  });

  const { data: topContributors = [] } = useQuery<TopContributor[]>({
    queryKey: ["/api/admin/engagement/top-contributors"],
  });

  const { data: level100Customers = [] } = useQuery<Level100Customer[]>({
    queryKey: ["/api/admin/engagement/level100"],
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/admin/engagement/claim-reward/${customerId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to claim reward");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/engagement/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/engagement/level100"] });
      toast({
        title: "Reward claimed",
        description: "The level 100 reward has been marked as claimed",
      });
    },
    onError: () => {
      toast({
        title: "Failed to claim reward",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const engagementStats = [
    {
      title: "Total Posts",
      value: stats?.totalPosts.toString() || "0",
      description: "Photos shared by customers",
      icon: Image,
    },
    {
      title: "Total Likes",
      value: stats?.totalLikes.toString() || "0",
      description: "Hearts on all posts",
      icon: Heart,
    },
    {
      title: "Total Comments",
      value: stats?.totalComments.toString() || "0",
      description: "Comments on all posts",
      icon: MessageCircle,
    },
    {
      title: "Total Engagement",
      value: stats?.totalEngagement.toString() || "0",
      description: "Likes + Comments",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {engagementStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle>Top Contributors</CardTitle>
          </div>
          <CardDescription>Customers ranked by total points earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Posts</TableHead>
                  <TableHead className="text-right">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topContributors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No contributors yet
                    </TableCell>
                  </TableRow>
                ) : (
                  topContributors.map((contributor, index) => (
                    <TableRow key={contributor.id}>
                      <TableCell className="font-medium">
                        {index === 0 && <Badge variant="default" className="bg-yellow-500">🥇</Badge>}
                        {index === 1 && <Badge variant="default" className="bg-gray-400">🥈</Badge>}
                        {index === 2 && <Badge variant="default" className="bg-amber-600">🥉</Badge>}
                        {index > 2 && <span className="text-muted-foreground">#{index + 1}</span>}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contributor.name}</div>
                          <div className="text-sm text-muted-foreground">{contributor.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{contributor.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{contributor.points}</TableCell>
                      <TableCell className="text-right">{contributor.postsCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {contributor.totalLikes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {contributor.totalComments}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {level100Customers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <CardTitle>Level 100 Rewards Pending</CardTitle>
            </div>
            <CardDescription>
              Customers who reached Level 100 and earned a free custom T-shirt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Level</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {level100Customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {customer.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{customer.points}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => claimRewardMutation.mutate(customer.id)}
                          disabled={claimRewardMutation.isPending}
                        >
                          Mark as Claimed
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
