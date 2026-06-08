declare module "reapop" {
  import type { ReactNode } from "react";

  export type NotificationStatus = "none" | "info" | "success" | "loading" | "warning" | "error";

  export interface Notification {
    dismissAfter?: number;
    dismissible?: boolean;
    id: string;
    message?: ReactNode;
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    status?: NotificationStatus;
    title?: ReactNode;
  }

  export interface NotifyOptions extends Partial<Notification> {}

  export function setUpNotifications(options: {
    defaultProps?: Partial<Notification>;
  }): void;

  export function useNotifications(): {
    dismissNotification: (id: string) => void;
    dismissNotifications: () => void;
    notifications: Notification[];
    notify: (
      messageOrNotification: string | Partial<Notification>,
      statusOrOptions?: NotificationStatus | NotifyOptions,
      options?: NotifyOptions,
    ) => { payload: Notification } | undefined;
  };

  export function NotificationsProvider(props: { children: ReactNode }): JSX.Element;

  export const atalhoTheme: unknown;

  export default function NotificationsSystem(props: {
    dismissNotification: (id: string) => void;
    notifications: Notification[];
    theme: unknown;
  }): JSX.Element;
}
