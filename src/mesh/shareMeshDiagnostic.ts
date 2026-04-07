import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

/**
 * Writes a UTF-8 `.txt` to cache and opens the system share sheet when available;
 * falls back to `Share.share({ message })` on web, missing cache dir, or unavailable sharing.
 */
export async function shareMeshDiagnosticText(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Share.share({
      message: text,
      title: 'EMBER mesh diagnostic',
    });
    return;
  }

  const cache = FileSystem.cacheDirectory;
  if (!cache) {
    await Share.share({
      message: text,
      title: 'EMBER mesh diagnostic',
    });
    return;
  }

  const filename = `ember-mesh-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
  const path = `${cache}${filename}`;
  await FileSystem.writeAsStringAsync(path, text, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    await Share.share({
      message: text,
      title: 'EMBER mesh diagnostic',
    });
    return;
  }

  await Sharing.shareAsync(path, {
    mimeType: 'text/plain',
    dialogTitle: 'Share mesh diagnostic',
    ...(Platform.OS === 'ios' ? { UTI: 'public.plain-text' as const } : {}),
  });
}
