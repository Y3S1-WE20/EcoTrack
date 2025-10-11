import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/contexts/ThemeContext';

interface CustomTabBarProps extends BottomTabBarProps {}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useAppTheme();
  
  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? '#FFFFFF' : theme.tabBarInactive;
    const size = 24;
    
    switch (routeName) {
      case 'habits':
        return <IconSymbol size={size} name="house.fill" color={color} />; // Home icon for habits page
      case 'assistant':
        return <IconSymbol size={size} name="message.fill" color={color} />; // Assistant/Chat
      case 'goals':
        return <IconSymbol size={size} name="chart.bar.fill" color={color} />; // Goals/Progress
      case 'profile':
        return <IconSymbol size={size} name="person.fill" color={color} />; // Profile
      default:
        return <IconSymbol size={size} name="app.fill" color={color} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'habits':
        return 'Habits'; // Habits tab
      case 'assistant':
        return 'Assistant';
      case 'goals':
        return 'Goals';
      case 'profile':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.tabBar }]}>
      {state.routes
        .filter(route => !['index', 'explore'].includes(route.name)) // Filter out index and explore tabs
        .map((route, index) => {
        const { options } = descriptors[route.key];
        const label = getTabLabel(route.name);
        const icon = getTabIcon(route.name, state.index === state.routes.findIndex(r => r.key === route.key));

        const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {/* Modern indicator dot for current tab */}
            {isFocused && (
              <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
            )}
            <View style={[
              styles.tabIconContainer,
              isFocused && [styles.tabIconContainerFocused, { backgroundColor: theme.primary }]
            ]}>
              {icon}
            </View>
            <Text style={[
              styles.tabLabel,
              { color: theme.tabBarInactive },
              isFocused && [styles.tabLabelFocused, { color: theme.primary }]
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 0, // Remove border for cleaner look
    paddingBottom: 25, // More space for safe area
    paddingTop: 12,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  tabIconContainerFocused: {
    transform: [{ scale: 1.1 }], // Slightly larger when active
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelFocused: {
    fontWeight: '600',
  },
});

export default CustomTabBar;