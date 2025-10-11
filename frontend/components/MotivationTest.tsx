import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MotivationTest() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    setStatus('Testing motivation API...');
    
    const testUrls = [
      'http://192.168.1.10:4000/api/v1/motivation/health',
      'http://localhost:4000/api/v1/motivation/health',
      'http://192.168.1.10:4000/api/v1', // Test if base API works
      'http://localhost:4000/api/v1', // Test if base API works
    ];

    for (const url of testUrls) {
      try {
        console.log(`[MotivationTest] Testing: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log(`[MotivationTest] Success with ${url}:`, data);
          setStatus(`✅ Success!\nURL: ${url}\nResponse: ${JSON.stringify(data, null, 2)}`);
          return;
        } else {
          console.log(`[MotivationTest] HTTP ${response.status} with ${url}`);
          setStatus(`⚠️ HTTP ${response.status} with ${url}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[MotivationTest] Failed with ${url}:`, errorMsg);
        setStatus(`❌ Failed with ${url}: ${errorMsg}`);
      }
    }
    
    setStatus('❌ All motivation API tests failed\nCheck if backend is running on correct IP/port');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motivation API Test</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity style={styles.button} onPress={testAPI}>
        <Text style={styles.buttonText}>Test Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});