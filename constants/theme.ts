import { Platform } from 'react-native';

export const Fonts =
Platform.OS === 'ios'
? {
sans: 'System',
serif: 'Times New Roman',
rounded: 'SF Pro Rounded',
mono: 'Menlo',
}
: Platform.OS === 'android'
? {
sans: 'sans-serif',
serif: 'serif',
rounded: 'sans-serif',
mono: 'monospace',
}
: {
sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
serif: "Georgia, 'Times New Roman', serif",
rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
mono: "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};
