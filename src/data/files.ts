import type { FileEntry } from "../types/file-manager";

export const fileEntries: FileEntry[] = [
  { id: "more-folder", name: "More-folder", type: "folder", modifiedAt: "08/11/2025, 23:16:51" },
  { id: "new-folder", name: "new-folder", type: "folder", modifiedAt: "08/11/2025, 23:08:04" },
  { id: "app-release", name: "app-release", type: "file", extension: "aab", size: "2.85 MB", modifiedAt: "08/05/2025, 00:09:53" },
  {
    id: "chrome",
    name: "google-chrome-stable_current",
    type: "file",
    extension: "deb",
    size: "2.85 MB",
    modifiedAt: "08/05/2025, 00:23:48",
  },
  { id: "inter-font", name: "Inter-font", type: "file", extension: "zip", size: "19.51 MB", modifiedAt: "08/04/2025, 22:36:29" },
  { id: "originui", name: "originui-main", type: "file", extension: "zip", size: "4.16 MB", modifiedAt: "08/05/2025, 00:00:04" },
  { id: "quotation", name: "Quotation", type: "file", extension: "pdf", size: "6.32 MB", modifiedAt: "08/05/2025, 00:25:00" },
  { id: "some", name: "Some", type: "file", extension: "pdf", size: "192.00 KB", modifiedAt: "08/05/2025, 00:14:22" },
  { id: "webview", name: "webview", type: "file", extension: "dmg", size: "1.70 MB", modifiedAt: "08/05/2025, 00:09:52" },
];
