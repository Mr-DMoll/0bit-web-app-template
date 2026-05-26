export interface Notification {
  id:        string;
  userId:    string;
  title:     string;
  body:      string;
  read:      boolean;
  link:      string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount:   number;
}
