import { getUserInfo } from './preferences';

export async function checkAuthState() {
  try {
    const userInfo = await getUserInfo();
    return userInfo; // Will be null if not logged in
  } catch (error) {
    console.error('Error checking auth state:', error);
    return null;
  }
}