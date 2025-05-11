import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Animated version of Image component
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function SplashPage() {
  // Animation values
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations immediately
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 10, stiffness: 80 });
    rotation.value = withSequence(
      withTiming(0.05, { duration: 300 }),
      withTiming(-0.05, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
    
    // Text animations with delay
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }));
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

    // Simulate loading resources
    const prepare = async () => {
      try {
        // Artificially delay for the splash effect
        await new Promise(resolve => setTimeout(resolve, 2800));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the splash screen and navigate
        await SplashScreen.hideAsync();
        // Navigate to the login screen
        router.replace({pathname: '/(auth)/login'});
      }
    };

    prepare();
  }, []);

  // Define animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ],
      opacity: opacity.value,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }]
    };
  });

  const taglineAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: taglineOpacity.value
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedImage
        source={require('../../assets/images/klyptik-splash.png')}
        style={[styles.logo, logoAnimatedStyle]}
        contentFit="contain"
      />
      
      <AnimatedText style={[styles.appName, titleAnimatedStyle]}>
        KLYPTIK
      </AnimatedText>
      
      <AnimatedText style={[styles.tagline, taglineAnimatedStyle]}>
        Fun • Intelligent • Grow
      </AnimatedText>
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
    marginBottom: 10,
  },
  appName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 20,
  },
  tagline: {
    color: '#a5a5be',
    fontSize: 16,
    marginTop: 16,
    letterSpacing: 1,
  }
}); 