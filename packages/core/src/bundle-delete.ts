const pendingDeleteBundleFiles = new Set<string>()

export function markBundleFileForDeletion(fileName: string) {
  if (!fileName) return
  pendingDeleteBundleFiles.add(fileName)
}

export function getPendingDeleteBundleFiles(): string[] {
  return [...pendingDeleteBundleFiles]
}

export function clearPendingDeleteBundleFiles() {
  pendingDeleteBundleFiles.clear()
}
