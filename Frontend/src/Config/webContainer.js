// FIX: Removed 'webContainer' from the import as it's not exported by the package
import { WebContainer } from "@webcontainer/api";

let webContainerInstance = null;

export const getWebContainer = async () => {
  if (webContainerInstance === null) {
    webContainerInstance = await WebContainer.boot();
  }
  return webContainerInstance;
};

// FIX: Removed the 'export default webContainer' line
// It was causing the error because 'webContainer' was undefined.
