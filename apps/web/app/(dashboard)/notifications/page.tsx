"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/api/client";

interface Notification {
  id:        string;
  title:     string;
  body:      string;
  read:      boolean;
  link:      string | null;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isLoading,     setIsLoading]     = useState(true);
  const [markingAll,    setMarkingAll]    = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get("/notifications");
      setNotifications(data.data?.notifications ?? []);
      setUnreadCount(data.data?.unreadCount ?? 0);
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await apiClient.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: string) => {
    const n = notifications.find((x) => x.id === id);
    await apiClient.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.read) setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: "10px", fontSize: "13px", fontWeight: 700,
                background: "var(--color-accent)", color: "var(--color-accent-text)",
                padding: "2px 8px", borderRadius: "999px",
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
            Your recent alerts and updates
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            style={{
              padding: "7px 14px", fontSize: "12px", fontWeight: 600,
              background: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              borderRadius: "7px", color: "var(--color-text-secondary)",
              cursor: markingAll ? "not-allowed" : "pointer",
              opacity: markingAll ? 0.6 : 1,
            }}
          >
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "12px", overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "48px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Loading...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "56px 0", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔔</div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>All caught up</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((n, i) => (
              <div
                key={n.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  padding: "16px 20px",
                  borderBottom: i < notifications.length - 1 ? "1px solid var(--color-border)" : "none",
                  background: n.read ? "transparent" : "var(--color-accent-subtle)",
                  position: "relative",
                }}
              >
                {/* Unread dot */}
                {!n.read && (
                  <div style={{
                    position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "var(--color-accent)",
                  }} />
                )}

                {/* Content */}
                <div style={{ flex: 1, paddingLeft: n.read ? "0" : "6px" }}>
                  <p style={{ fontSize: "14px", fontWeight: n.read ? 400 : 600, color: "var(--color-text-primary)", margin: "0 0 3px" }}>
                    {n.title}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "0 0 6px", lineHeight: 1.45 }}>
                    {n.body}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 500, background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", borderRadius: "5px", color: "var(--color-accent)", cursor: "pointer" }}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    title="Delete"
                    style={{ padding: "4px 8px", fontSize: "14px", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", lineHeight: 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
