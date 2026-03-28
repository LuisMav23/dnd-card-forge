export type NotificationType = 'comment' | 'upvote' | 'downvote' | 'favorite';

export type MeNotificationItem = {
  id: string;
  actor_id: string | null;
  actor_display_name: string | null;
  card_id: string;
  type: NotificationType;
  comment_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type MeNotificationsResponse = {
  items: MeNotificationItem[];
  unread_count: number;
};
