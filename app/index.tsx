import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Navigate to the splash screen in the auth group
    router.replace('/(auth)/splash' as any);
  }, [router]);

  return <View />;
}
