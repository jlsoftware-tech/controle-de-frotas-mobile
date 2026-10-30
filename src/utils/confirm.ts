import { Alert, Platform } from 'react-native';

interface ConfirmActionOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

interface WebDialogGlobal {
  confirm?: (message: string) => boolean;
  alert?: (message: string) => void;
}

const webDialog = globalThis as WebDialogGlobal;

/**
 * Cross-platform destructive confirmation. React Native Web's `Alert.alert`
 * ignores button callbacks, so the web build uses `window.confirm` instead.
 */
export function confirmAction({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
}: ConfirmActionOptions) {
  if (Platform.OS === 'web') {
    if (typeof webDialog.confirm === 'function' && webDialog.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    if (typeof webDialog.alert === 'function') {
      webDialog.alert(`${title}\n\n${message}`);
    }
    return;
  }

  Alert.alert(title, message);
}
