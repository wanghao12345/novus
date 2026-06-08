import { invoke } from "@tauri-apps/api/core";

interface UploadFileParams {
  connectionId: string;
  localPath: string;
  remotePath: string;
}

export async function uploadFile({ connectionId, localPath, remotePath }: UploadFileParams): Promise<void> {
  await invoke("upload_file", {
    connectionId,
    localPath,
    remotePath,
  });
}
