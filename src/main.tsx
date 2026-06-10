import React from "react";
import ReactDOM from "react-dom/client";
import { NotificationsProvider, setUpNotifications } from "reapop";
import App from "./App";
import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";
import { AppNotifications } from "./components/notifications/AppNotifications";

setUpNotifications({
  defaultProps: {
    dismissAfter: 4500,
    dismissible: true,
    position: "bottom-left",
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance="dark" accentColor="gray">
      <NotificationsProvider>
        <App />
        <AppNotifications />
      </NotificationsProvider>
    </Theme>
  </React.StrictMode>,
);
