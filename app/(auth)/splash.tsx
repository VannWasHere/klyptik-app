import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashPage() {
  useEffect(() => {
    // Simulate loading resources
    const prepare = async () => {
      try {
        // Artificially delay for the splash effect
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen
        await SplashScreen.hideAsync();
        // Navigate to the login screen
        router.replace({pathname: '/(auth)/login'});
      }
    };

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/klyptik.png')}
        style={styles.logo}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181829',
  },
  logo: {
    width: 200,
    height: 200,
  },
}); 