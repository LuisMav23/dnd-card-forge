'use client';

import FollowersFollowingClient from '@/components/users/FollowersFollowingClient';
import { useParams } from 'next/navigation';

export default function UserFollowingPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  if (!id) return null;
  return <FollowersFollowingClient profileUserId={id} initialTab="following" />;
}
