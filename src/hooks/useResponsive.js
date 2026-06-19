import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;

  return {
    width,
    height,
    isDesktop,
    // Utility function to select values based on screen type
    select: (mobileValue, desktopValue) => (isDesktop ? desktopValue : mobileValue),
  };
}
