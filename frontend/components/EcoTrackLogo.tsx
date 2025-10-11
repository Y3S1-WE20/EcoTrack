import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/constants/theme';

interface EcoTrackLogoProps {
  size?: 'small' | 'medium' | 'large' | 'header';
  showText?: boolean;
  style?: any;
}

const EcoTrackLogo: React.FC<EcoTrackLogoProps> = ({ 
  size = 'medium', 
  showText = true,
  style 
}) => {
  const theme = useTheme();

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { imageSize: 24, fontSize: 16, spacing: 4 };
      case 'medium':
        return { imageSize: 40, fontSize: 20, spacing: 8 };
      case 'large':
        return { imageSize: 80, fontSize: 32, spacing: 12 };
      case 'header':
        return { imageSize: 32, fontSize: 18, spacing: 6 };
      default:
        return { imageSize: 40, fontSize: 20, spacing: 8 };
    }
  };

  const { imageSize, fontSize, spacing } = getSizeConfig();

  return (
    <View style={[styles.container, { gap: spacing }, style]}>
      <Image 
        source={require('@/assets/images/icon.jpeg')}
        style={[
          styles.logo,
          { 
            width: imageSize, 
            height: imageSize,
          }
        ]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[
          styles.text, 
          { 
            fontSize,
            color: theme.text,
          }
        ]}>
          EcoTrack
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 8,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default EcoTrackLogo;