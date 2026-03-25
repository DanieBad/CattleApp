/**
 * Utility to detect if the user is on a mobile device (iOS or Android).
 * This is used to restrict the Voice Assistant to mobile devices where 
 * voice interaction is most natural.
 */
export const isMobile = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return true;
  }

  if (/android/i.test(userAgent)) {
    return true;
  }

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return true;
  }

  // Check for touch capability as a fallback for some mobile browsers
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Only return true if the screen is relatively small (typically mobile)
    return window.innerWidth <= 1024; 
  }

  return false;
};
