import NotificationsSystem, { atalhoTheme, useNotifications } from "reapop";

export function AppNotifications() {
  const { dismissNotification, notifications } = useNotifications();

  return (
    <NotificationsSystem
      dismissNotification={(id) => dismissNotification(id)}
      notifications={notifications}
      theme={atalhoTheme}
    />
  );
}
