import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { LAYOUT_CONFIG } from './constants';

export const useTimePickerAnimations = (isVisible: boolean) => {
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      backdropOpacity.value = withTiming(LAYOUT_CONFIG.modalOpacity, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  return {
    backdropAnimatedStyle,
    modalAnimatedStyle,
  };
};
