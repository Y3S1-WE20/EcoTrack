// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Use a permissive mapping so we can map SF symbol names to Material icon names.
type IconMapping = Record<string, string>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'message.fill': 'chat',
  'flag.fill': 'flag',
  'safari.fill': 'explore',
  'person.fill': 'person',
  'target': 'track_changes',
  'star.fill': 'star',
  'app.fill': 'apps',
  'doc.text': 'description',
  'plus': 'add',
  'mic': 'mic',
  'camera': 'photo-camera',
  'doc': 'description',
  'sun.max.fill': 'wb_sunny',
  'moon.fill': 'dark_mode',
  'gearshape.fill': 'settings',
  'chart.bar': 'bar-chart',
  'bell.fill': 'notifications',
  'logout': 'logout',
  'refresh': 'refresh',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // MaterialIcons expects a specific union of names; cast after lookup.
  const materialName = MAPPING[name] as ComponentProps<typeof MaterialIcons>['name'];
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
