import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { documentDirectory, EncodingType, writeAsStringAsync } from 'expo-file-system';

const ExportDataScreen = () => {
  const router = useRouter();
  const [exportOptions, setExportOptions] = useState({
    habitLogs: true,
    carbonFootprint: true,
    goals: true,
    badges: true,
    profile: true,
    analytics: false,
  });
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    router.back();
  };

  const toggleOption = (key: keyof typeof exportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateSampleData = () => {
    return {
      profile: {
        name: 'John Doe',
        email: 'john@example.com',
        joinDate: '2025-01-01',
        totalDays: 283,
      },
      carbonFootprint: {
        totalCO2Saved: 156.7,
        averageDailyCO2: 6.8,
        bestDay: 3.2,
        worstDay: 12.5,
        trend: 'Improving',
      },
      habitLogs: [
        { date: '2025-10-10', activity: 'Walked to work', co2Saved: 2.3 },
        { date: '2025-10-09', activity: 'Used public transport', co2Saved: 4.1 },
        { date: '2025-10-08', activity: 'Recycled 5 bottles', co2Saved: 0.8 },
      ],
      goals: [
        { title: 'Reduce Daily CO₂', target: 7.1, current: 6.8, status: 'On Track' },
        { title: 'Walk 3x/week', target: 3, current: 2, status: 'Behind' },
      ],
      badges: [
        { name: 'Eco Warrior', earnedAt: '2025-09-15' },
        { name: 'Green Week', earnedAt: '2025-08-20' },
        { name: 'First Steps', earnedAt: '2025-01-01' },
      ],
    };
  };

  const generateHTMLReport = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EcoTrack Data Export</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
          .logo { color: #4CAF50; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .date { color: #666; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .section-title { color: #4CAF50; font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .data-card { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50; }
          .data-label { font-weight: bold; color: #555; }
          .data-value { font-size: 18px; color: #333; margin-top: 5px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .table th { background-color: #4CAF50; color: white; }
          .badge { display: inline-block; background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🌱 EcoTrack Data Export</div>
          <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
        </div>

        ${exportOptions.profile ? `
        <div class="section">
          <h2 class="section-title">Profile Information</h2>
          <div class="data-grid">
            <div class="data-card">
              <div class="data-label">Name</div>
              <div class="data-value">${data.profile.name}</div>
            </div>
            <div class="data-card">
              <div class="data-label">Email</div>
              <div class="data-value">${data.profile.email}</div>
            </div>
            <div class="data-card">
              <div class="data-label">Member Since</div>
              <div class="data-value">${data.profile.joinDate}</div>
            </div>
            <div class="data-card">
              <div class="data-label">Total Days Active</div>
              <div class="data-value">${data.profile.totalDays}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${exportOptions.carbonFootprint ? `
        <div class="section">
          <h2 class="section-title">Carbon Footprint Summary</h2>
          <div class="data-grid">
            <div class="data-card">
              <div class="data-label">Total CO₂ Saved</div>
              <div class="data-value">${data.carbonFootprint.totalCO2Saved} kg</div>
            </div>
            <div class="data-card">
              <div class="data-label">Average Daily CO₂</div>
              <div class="data-value">${data.carbonFootprint.averageDailyCO2} kg</div>
            </div>
            <div class="data-card">
              <div class="data-label">Best Day</div>
              <div class="data-value">${data.carbonFootprint.bestDay} kg</div>
            </div>
            <div class="data-card">
              <div class="data-label">Trend</div>
              <div class="data-value">${data.carbonFootprint.trend}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${exportOptions.habitLogs ? `
        <div class="section">
          <h2 class="section-title">Recent Habit Logs</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>CO₂ Impact</th>
              </tr>
            </thead>
            <tbody>
              ${data.habitLogs.map((log: any) => `
                <tr>
                  <td>${log.date}</td>
                  <td>${log.activity}</td>
                  <td>${log.co2Saved} kg saved</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${exportOptions.goals ? `
        <div class="section">
          <h2 class="section-title">Goals Progress</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Goal</th>
                <th>Target</th>
                <th>Current</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.goals.map((goal: any) => `
                <tr>
                  <td>${goal.title}</td>
                  <td>${goal.target}</td>
                  <td>${goal.current}</td>
                  <td>${goal.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${exportOptions.badges ? `
        <div class="section">
          <h2 class="section-title">Earned Badges</h2>
          <div>
            ${data.badges.map((badge: any) => `
              <span class="badge">${badge.name} (${badge.earnedAt})</span>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>This report was generated by EcoTrack - Making the world greener, one habit at a time 🌱</p>
          <p>For questions about your data, contact us at privacy@ecotrack.app</p>
        </div>
      </body>
      </html>
    `;
  };

  const exportToPDF = async () => {
    try {
      setLoading(true);
      
      const data = generateSampleData();
      const html = generateHTMLReport(data);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Save to device storage
      const fileName = `ecotrack-export-${new Date().toISOString().split('T')[0]}.pdf`;
      const downloadUri = `${documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: downloadUri,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadUri);
      } else {
        Alert.alert('Success', `Data exported to: ${downloadUri}`);
      }
      
      Alert.alert('Export Complete', 'Your data has been exported successfully!');
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = async () => {
    try {
      setLoading(true);
      
      const data = generateSampleData();
      const jsonData = JSON.stringify(data, null, 2);
      
      const fileName = `ecotrack-export-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `Data exported to: ${fileUri}`);
      }
      
      Alert.alert('Export Complete', 'Your data has been exported as JSON!');
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startExport = () => {
    if (!Object.values(exportOptions).some(Boolean)) {
      Alert.alert('No Data Selected', 'Please select at least one type of data to export.');
      return;
    }

    Alert.alert(
      'Export Data',
      `This will export your selected data in ${format.toUpperCase()} format. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            if (format === 'pdf') {
              exportToPDF();
            } else {
              exportToJSON();
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Export Data</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>📄 Export Your Data</Text>
            <Text style={styles.infoText}>
              Download a complete copy of your EcoTrack data. You can choose which information to include and the format for your export.
            </Text>
          </View>

          {/* Export Format */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Format</Text>
            
            <View style={styles.formatContainer}>
              <TouchableOpacity
                style={[styles.formatButton, format === 'pdf' && styles.formatButtonSelected]}
                onPress={() => setFormat('pdf')}
              >
                <Text style={styles.formatIcon}>📄</Text>
                <View style={styles.formatContent}>
                  <Text style={[styles.formatTitle, format === 'pdf' && styles.formatTitleSelected]}>
                    PDF Report
                  </Text>
                  <Text style={styles.formatDesc}>Formatted report with charts and summaries</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formatButton, format === 'json' && styles.formatButtonSelected]}
                onPress={() => setFormat('json')}
              >
                <Text style={styles.formatIcon}>📊</Text>
                <View style={styles.formatContent}>
                  <Text style={[styles.formatTitle, format === 'json' && styles.formatTitleSelected]}>
                    JSON Data
                  </Text>
                  <Text style={styles.formatDesc}>Raw data in machine-readable format</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Data to Export</Text>
            <Text style={styles.sectionDescription}>
              Choose which types of data you want to include in your export
            </Text>
            
            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>👤</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Profile Information</Text>
                  <Text style={styles.optionDesc}>Name, email, join date, and basic profile data</Text>
                </View>
              </View>
              <Switch
                value={exportOptions.profile}
                onValueChange={() => toggleOption('profile')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>🌍</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Carbon Footprint Data</Text>
                  <Text style={styles.optionDesc}>CO₂ calculations, emissions tracking, and trends</Text>
                </View>
              </View>
              <Switch
                value={exportOptions.carbonFootprint}
                onValueChange={() => toggleOption('carbonFootprint')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>📝</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Habit Logs</Text>
                  <Text style={styles.optionDesc}>All your logged activities and daily entries</Text>
                </View>
              </View>
              <Switch
                value={exportOptions.habitLogs}
                onValueChange={() => toggleOption('habitLogs')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>🎯</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Goals & Progress</Text>
                  <Text style={styles.optionDesc}>Your goals, targets, and progress tracking</Text>
                </View>
              </View>
              <Switch
                value={exportOptions.goals}
                onValueChange={() => toggleOption('goals')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>🏆</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Badges & Achievements</Text>
                  <Text style={styles.optionDesc}>Earned badges, streaks, and milestones</Text>
                </View>
              </View>
              <Switch
                value={exportOptions.badges}
                onValueChange={() => toggleOption('badges')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>📈</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Analytics Data</Text>
                  <Text style={styles.optionDesc}>Usage patterns and app interaction data</Text>
                </View>
              </View>
              <Switch
                value={exportOptions.analytics}
                onValueChange={() => toggleOption('analytics')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              />
            </View>
          </View>

          {/* Export Button */}
          <TouchableOpacity 
            style={[styles.exportButton, loading && styles.exportButtonDisabled]} 
            onPress={startExport}
            disabled={loading}
          >
            <Text style={styles.exportButtonText}>
              {loading ? 'Exporting...' : `Export to ${format.toUpperCase()}`}
            </Text>
          </TouchableOpacity>

          {/* Legal Notice */}
          <View style={styles.legalSection}>
            <Text style={styles.legalTitle}>📋 Important Information</Text>
            <Text style={styles.legalText}>
              • Your exported data will include all selected information from your account{'\n'}
              • The export process may take a few moments for large datasets{'\n'}
              • Exported files will be saved to your device and can be shared{'\n'}
              • For security reasons, passwords and payment information are never exported{'\n'}
              • If you need help with your data export, contact our support team
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  formatContainer: {
    gap: 10,
  },
  formatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  formatButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  formatIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  formatContent: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  formatTitleSelected: {
    color: '#007AFF',
  },
  formatDesc: {
    fontSize: 14,
    color: '#666666',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 14,
    color: '#666666',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  exportButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  legalSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 10,
  },
  legalText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
});

export default ExportDataScreen;