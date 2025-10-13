import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './ui/icon-symbol';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: string;
  onRightPress?: () => void;
}

export default function Header({ title, subtitle, rightIcon, onRightPress }: HeaderProps) {
  return (
    <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoBubble}><Text style={{fontSize:18}}>🌿</Text></View>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <TouchableOpacity style={styles.right} onPress={onRightPress}>
        {rightIcon ? <IconSymbol name={rightIcon} size={22} color="white" /> : null}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  logoBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  title: { color: 'white', fontSize: 20, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  right: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }
});
