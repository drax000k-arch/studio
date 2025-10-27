import type { CommunityPost } from './types';
import { PlaceHolderImages } from './placeholder-images';

const posts: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Alice',
      avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar1')?.imageUrl ?? '',
    },
    subject: 'Which laptop for programming?',
    options: ['MacBook Pro 14"', 'Dell XPS 15', 'ThinkPad X1 Carbon'],
    aiRecommendation: 'MacBook Pro 14"',
    aiJustification: 'The MacBook Pro 14" is recommended for its powerful M3 chip, excellent battery life, and high-resolution display, making it ideal for demanding programming tasks and long coding sessions. The Unix-based macOS is also a favorite among developers.',
    postedAt: '2 days ago',
    commentCount: 12,
  },
  {
    id: '2',
    author: {
      name: 'Bob',
      avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar2')?.imageUrl ?? '',
    },
    subject: 'Vacation destination for a family?',
    options: ['Beach resort in Mexico', 'National Parks road trip', 'Cultural tour in Italy'],
    aiRecommendation: 'National Parks road trip',
    aiJustification: 'A National Parks road trip offers a budget-friendly and educational experience for the whole family. It allows for flexibility in planning and activities, catering to different interests and energy levels, while promoting outdoor activity and appreciation for nature.',
    postedAt: '5 days ago',
    commentCount: 8,
  },
  {
    id: '3',
    author: {
      name: 'Charlie',
      avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar3')?.imageUrl ?? '',
    },
    subject: 'Best way to invest $1,000?',
    options: ['High-yield savings account', 'S&P 500 index fund', 'Cryptocurrency'],
    aiRecommendation: 'S&P 500 index fund',
    aiJustification: 'For long-term growth, an S&P 500 index fund is a historically reliable and diversified investment. It provides exposure to 500 of the largest U.S. companies, balancing risk and potential for solid returns over time, which is generally safer than the high volatility of cryptocurrency.',
    postedAt: '1 week ago',
    commentCount: 23,
  },
  {
    id: '4',
    author: {
      name: 'Diana',
      avatarUrl: PlaceHolderImages.find(img => img.id === 'avatar4')?.imageUrl ?? '',
    },
    subject: 'New hobby to pick up?',
    options: ['Learn to play guitar', 'Start pottery', 'Join a running club'],
    aiRecommendation: 'Join a running club',
    aiJustification: 'Joining a running club is an excellent choice as it combines physical fitness with social interaction, which can improve both physical and mental well-being. It has a low barrier to entry in terms of cost and equipment, and provides a structured way to build a healthy habit.',
    postedAt: '2 weeks ago',
    commentCount: 5,
  },
];

export function getCommunityPosts(): CommunityPost[] {
  return posts;
}
