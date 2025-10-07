import { Redirect } from 'expo-router';

export default function HomeScreen() {
  // Automatically redirect to habits page
  return <Redirect href="/habits" />;
}
