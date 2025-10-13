import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface OffsetProject {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerTon: number;
  totalCO2: number;
  image: string;
  verified: boolean;
  category: 'forestry' | 'renewable' | 'community' | 'technology';
}

const CarbonOffsetProgramScreen = () => {
  const router = useRouter();
  const [userCarbonFootprint] = useState(2.5); // tons of CO2 this month

  const offsetProjects: OffsetProject[] = [
    {
      id: '1',
      title: 'Amazon Rainforest Conservation',
      description: 'Protect 1,000 hectares of Amazon rainforest from deforestation and support local indigenous communities.',
      location: 'Brazil',
      pricePerTon: 12,
      totalCO2: 500,
      image: '🌳',
      verified: true,
      category: 'forestry',
    },
    {
      id: '2',
      title: 'Solar Power for Rural Communities',
      description: 'Install solar panels in rural villages, providing clean energy and reducing reliance on fossil fuels.',
      location: 'Kenya',
      pricePerTon: 15,
      totalCO2: 300,
      image: '☀️',
      verified: true,
      category: 'renewable',
    },
    {
      id: '3',
      title: 'Mangrove Restoration Project',
      description: 'Restore coastal mangrove forests that sequester carbon and protect communities from storms.',
      location: 'Philippines',
      pricePerTon: 18,
      totalCO2: 200,
      image: '🌊',
      verified: true,
      category: 'forestry',
    },
    {
      id: '4',
      title: 'Clean Cookstoves Initiative',
      description: 'Replace traditional cookstoves with efficient clean-burning stoves, reducing emissions and health risks.',
      location: 'Guatemala',
      pricePerTon: 20,
      totalCO2: 150,
      image: '🔥',
      verified: true,
      category: 'community',
    },
  ];

  const goBack = () => {
    router.back();
  };

  const offsetCarbon = (project: OffsetProject) => {
    const totalCost = (userCarbonFootprint * project.pricePerTon).toFixed(2);
    
    Alert.alert(
      'Offset Your Carbon Footprint',
      `Offset ${userCarbonFootprint} tons of CO₂ through "${project.title}" for $${totalCost}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Offset Now',
          onPress: () => {
            Alert.alert(
              'Success! 🌍',
              `Thank you for offsetting ${userCarbonFootprint} tons of CO₂! Your contribution helps support ${project.title}.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'forestry':
        return '#22c55e';
      case 'renewable':
        return '#f59e0b';
      case 'community':
        return '#3b82f6';
      case 'technology':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'forestry':
        return 'Forestry';
      case 'renewable':
        return 'Renewable Energy';
      case 'community':
        return 'Community';
      case 'technology':
        return 'Technology';
      default:
        return 'Other';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Carbon Offset Program</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Carbon Footprint Card */}
        <View style={styles.footprintCard}>
          <Text style={styles.footprintTitle}>Your Monthly Carbon Footprint</Text>
          <Text style={styles.footprintValue}>{userCarbonFootprint} tons CO₂</Text>
          <Text style={styles.footprintDesc}>
            Based on your tracked activities this month
          </Text>
        </View>

        {/* What is Carbon Offsetting */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What is Carbon Offsetting? 🌱</Text>
          <Text style={styles.infoText}>
            Carbon offsetting allows you to compensate for your emissions by funding projects that remove or prevent CO₂ from entering the atmosphere. These projects help fight climate change while supporting sustainable development worldwide.
          </Text>
        </View>

        {/* Offset Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verified Offset Projects</Text>
          
          {offsetProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectImage}>{project.image}</Text>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectLocation}>📍 {project.location}</Text>
                  {project.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ Verified</Text>
                    </View>
                  )}
                </View>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(project.category) }
                ]}>
                  <Text style={styles.categoryText}>
                    {getCategoryName(project.category)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.projectDescription}>
                {project.description}
              </Text>
              
              <View style={styles.projectDetails}>
                <View style={styles.priceInfo}>
                  <Text style={styles.priceLabel}>Price per ton:</Text>
                  <Text style={styles.priceValue}>${project.pricePerTon}</Text>
                </View>
                <View style={styles.totalInfo}>
                  <Text style={styles.totalLabel}>Total capacity:</Text>
                  <Text style={styles.totalValue}>{project.totalCO2} tons</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.offsetButton}
                onPress={() => offsetCarbon(project)}
              >
                <Text style={styles.offsetButtonText}>
                  Offset My Carbon (${(userCarbonFootprint * project.pricePerTon).toFixed(2)})
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits of Carbon Offsetting</Text>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🌍</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>Fight Climate Change:</Text> Directly contribute to reducing global CO₂ levels
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👥</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>Support Communities:</Text> Many projects provide jobs and improve livelihoods
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🌱</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>Protect Nature:</Text> Preserve forests and restore ecosystems
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>
              <Text style={styles.benefitBold}>Clean Energy:</Text> Accelerate the transition to renewable energy
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footprintCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  footprintTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  footprintValue: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  footprintDesc: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectImage: {
    fontSize: 32,
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  projectDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  offsetButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  offsetButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  benefitBold: {
    fontWeight: 'bold',
    color: '#212121',
  },
});

export default CarbonOffsetProgramScreen;