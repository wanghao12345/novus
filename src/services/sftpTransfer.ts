import { invoke } from "@tauri-apps/api/core";

interface UploadFileParams {
  connectionId: string;
  localPath: string;
  remotePath: string;
  transferId: string;
}

export async function uploadFile({ connectionId, localPath, remotePath, transferId }: UploadFileParams): Promise<void> {
  await invoke("upload_file", {
    connectionId,
    localPath,
    remotePath,
    transferId,
  });
}
