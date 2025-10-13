import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MotivationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const motivationalQuotes = [
    {
      id: 1,
      quote: "Every small action towards sustainability creates ripples of positive change.",
      icon: "leaf.fill"
    },
    {
      id: 2,
      quote: "The Earth does not belong to us; we belong to the Earth.",
      icon: "globe"
    },
    {
      id: 3,
      quote: "Be the change you wish to see in the world.",
      icon: "sparkles"
    },
    {
      id: 4,
      quote: "Small steps, when multiplied by millions of people, can transform the world.",
      icon: "figure.walk"
    },
    {
      id: 5,
      quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
      icon: "tree.fill"
    },
    {
      id: 6,
      quote: "We don't inherit the Earth from our ancestors; we borrow it from our children.",
      icon: "heart.fill"
    }
  ];

  const ecoTips = [
    {
      id: 1,
      tip: "Switch to LED bulbs to reduce energy consumption by up to 80%",
      category: "Energy"
    },
    {
      id: 2,
      tip: "Use a reusable water bottle to prevent plastic waste",
      category: "Waste"
    },
    {
      id: 3,
      tip: "Take shorter showers to conserve water and energy",
      category: "Water"
    },
    {
      id: 4,
      tip: "Choose local and organic foods to reduce carbon footprint",
      category: "Food"
    },
    {
      id: 5,
      tip: "Walk or bike for short trips instead of driving",
      category: "Transport"
    },
    {
      id: 6,
      tip: "Unplug electronics when not in use to save energy",
      category: "Energy"
    }
  ];

  const showMotivation = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    Alert.alert("Daily Motivation", randomQuote.quote, [{ text: "Thanks!", style: "default" }]);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <IconSymbol size={40} name="star.fill" color={colors.tint} />
          <ThemedText style={styles.title}>Motivations</ThemedText>
          <ThemedText style={styles.subtitle}>Stay inspired on your eco journey</ThemedText>
        </ThemedView>

        <TouchableOpacity 
          style={[styles.motivationButton, { backgroundColor: colors.tint }]} 
          onPress={showMotivation}
        >
          <IconSymbol size={24} name="sparkles" color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>Get Daily Motivation</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Inspirational Quotes</ThemedText>
          {motivationalQuotes.map((item) => (
            <ThemedView key={item.id} style={[styles.card, { backgroundColor: colors.background }]}>
              <IconSymbol size={24} name={item.icon as any} color={colors.tint} />
              <ThemedText style={styles.quoteText}>"{item.quote}"</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Eco Tips</ThemedText>
          {ecoTips.map((item) => (
            <ThemedView key={item.id} style={[styles.tipCard, { backgroundColor: colors.background }]}>
              <ThemedView style={styles.tipHeader}>
                <ThemedText style={[styles.categoryBadge, { backgroundColor: colors.tint }]}>
                  {item.category}
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.tipText}>{item.tip}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={styles.footer}>
          <IconSymbol size={32} name="leaf.fill" color={colors.tint} />
          <ThemedText style={styles.footerText}>
            Every eco-friendly action you take makes a difference! 🌱
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  motivationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBadge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 100, // Extra padding for tab bar
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});