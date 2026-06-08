import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBellProps {
  token: string | null;
}

export function NotificationBell({ token }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, connected, markRead, markAllRead } =
    useNotifications(token);

  if (!token) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          border: '1px solid #ddd',
          borderRadius: '999px',
          background: '#fff',
          padding: '8px 12px',
          cursor: 'pointer',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '999px',
              background: '#e11d48',
              color: '#fff',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '320px',
            maxHeight: '360px',
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <strong>Notifications</strong>
            <span style={{ fontSize: '12px', color: connected ? '#16a34a' : '#9ca3af' }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: '16px', margin: 0, color: '#6b7280' }}>
              No unread notifications
            </p>
          ) : (
            notifications.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => void markRead(item._id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  background: item.isRead ? '#fff' : '#eff6ff',
                  padding: '12px 16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>
                  {item.message}
                </div>
              </button>
            ))
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              style={{
                width: '100%',
                border: 'none',
                background: '#f9fafb',
                padding: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
