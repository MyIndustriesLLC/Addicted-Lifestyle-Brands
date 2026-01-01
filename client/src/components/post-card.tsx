import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post, Customer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: Post;
  author: Customer;
  currentCustomerId?: string;
  onCommentClick?: (postId: string) => void;
}

export function PostCard({ post, author, currentCustomerId, onCommentClick }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(parseInt(post.likesCount || "0"));
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle like");
      return response.json();
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikesCount(parseInt(data.likesCount || "0"));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to toggle like",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/customer"] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed and 10 points deducted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleLikeClick = () => {
    if (!currentCustomerId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleDeleteClick = () => {
    if (confirm("Are you sure you want to delete this post? You'll lose 10 points.")) {
      deleteMutation.mutate();
    }
  };

  const isOwnPost = currentCustomerId === post.customerId;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="text-sm sm:text-base font-semibold">
                {author.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm sm:text-base">{author.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Level {author.level}
                </Badge>
                <span>•</span>
                <span>
                  {post.createdAt
                    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                    : "just now"}
                </span>
              </div>
            </div>
          </div>
          {isOwnPost && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              disabled={deleteMutation.isPending}
              className="h-10 w-10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-4 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            disabled={likeMutation.isPending}
            className="gap-2 h-10"
          >
            <Heart
              className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className="text-sm">{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCommentClick?.(post.id)}
            className="gap-2 h-10"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.commentsCount || 0}</span>
          </Button>
        </div>

        {post.caption && (
          <div className="text-sm">
            <span className="font-semibold mr-2">{author.name}</span>
            <span>{post.caption}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
