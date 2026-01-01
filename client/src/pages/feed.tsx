import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Post, Customer } from "@shared/schema";
import type { CustomerAuthResponse } from "@/types/api";
import { PostCard } from "@/components/post-card";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { LevelProgressBar } from "@/components/level-progress-bar";

export default function Feed() {
  const [activeTab, setActiveTab] = useState("community");
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const { data: customerAuth } = useQuery<CustomerAuthResponse>({
    queryKey: ["/api/customer/me"],
  });

  // Fetch public customer profiles for post authors
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers/public"],
  });

  const { data: communityPosts = [], isLoading: isLoadingCommunity } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: activeTab === "community",
  });

  const { data: myPosts = [], isLoading: isLoadingMyPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/customer", customerAuth?.customer?.id],
    queryFn: async () => {
      if (!customerAuth?.customer?.id) return [];
      const response = await fetch(`/api/posts/customer/${customerAuth.customer.id}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: activeTab === "my-posts" && !!customerAuth?.customer?.id,
  });

  const { data: followingPosts = [], isLoading: isLoadingFollowing } = useQuery<Post[]>({
    queryKey: ["/api/posts/following"],
    enabled: activeTab === "following" && !!customerAuth?.authenticated,
  });

  if (!customerAuth?.authenticated) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Join the Community
          </h2>
          <p className="text-muted-foreground">
            Sign in to share your addiction, earn points, and level up
          </p>
        </div>
      </div>
    );
  }

  const isLoading =
    (activeTab === "community" && isLoadingCommunity) ||
    (activeTab === "my-posts" && isLoadingMyPosts) ||
    (activeTab === "following" && isLoadingFollowing);

  const currentPosts =
    activeTab === "community" ? communityPosts :
    activeTab === "my-posts" ? myPosts :
    followingPosts;

  const getPostAuthor = (post: Post): Customer | undefined => {
    return customers.find(c => c.id === post.customerId);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                Community Feed
              </h1>
            </div>
            <Button
              size="icon"
              className="h-12 w-12"
              onClick={() => setCreatePostOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {customerAuth?.customer && (
            <div className="max-w-md">
              <LevelProgressBar
                points={customerAuth.customer.points}
                level={customerAuth.customer.level}
              />
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="my-posts" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">No posts yet</p>
                <p className="text-sm text-muted-foreground">
                  Share your first post to earn 10 points!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPosts.map((post) => {
                  const author = getPostAuthor(post);
                  if (!author) return null;
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={author}
                      currentCustomerId={customerAuth?.customer?.id}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">No posts yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to share your addiction!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPosts.map((post) => {
                  const author = getPostAuthor(post);
                  if (!author) return null;
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={author}
                      currentCustomerId={customerAuth?.customer?.id}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">No posts from people you follow</p>
                <p className="text-sm text-muted-foreground">
                  Follow other members to see their posts here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPosts.map((post) => {
                  const author = getPostAuthor(post);
                  if (!author) return null;
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={author}
                      currentCustomerId={customerAuth?.customer?.id}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
      </div>
    </div>
  );
}
