import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

/**
 * Cross-platform alert that works on web and mobile.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  if (Platform.OS === 'web') {
    // Web: use confirm for 2+ buttons, otherwise window.alert
    if (buttons && buttons.length >= 2) {
      const cancel = buttons.find((b) => b.style === 'cancel');
      const action = buttons.find((b) => b.style !== 'cancel') || buttons[1];
      const confirmed = window.confirm(`${title}\n\n${message || ''}`);
      if (confirmed) {
        action?.onPress?.();
      } else {
        cancel?.onPress?.();
      }
    } else if (buttons && buttons.length === 1) {
      window.alert(`${title}${message ? '\n\n' + message : ''}`);
      buttons[0].onPress?.();
    } else {
      window.alert(`${title}${message ? '\n\n' + message : ''}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}
