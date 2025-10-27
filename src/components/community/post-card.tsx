import type { CommunityPost } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type PostCardProps = {
  post: CommunityPost;
};

export function PostCard({ post }: PostCardProps) {
  const postedAt = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'just now';

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{post.subject}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <span>Posted by {post.author.name}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{postedAt}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Options</h4>
          <ul className="space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            {post.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
           <h4 className="text-sm font-semibold mb-2">AI Recommendation</h4>
           <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">{post.aiRecommendation}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentCount} comments</span>
            </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-2">View Post</Button>
      </CardFooter>
    </Card>
  );
}
