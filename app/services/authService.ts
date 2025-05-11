// Define the types for the API responses and requests
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export interface RegisterResponse {
    uid: string;
    email: string;
    display_name: string;
    username: string;
    token: string;
    expires_in: number;
    message: string;
    success: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    uid: string;
    email: string;
    display_name: string;
    username: string;
    token: string;
    expires_in: number;
    message: string;
    success: boolean;
}

export interface LoginErrorResponse {
    detail: string;
}

// Base URL for API requests
const BASE_URL = process.env.EXPO_PUBLIC_API_URL; // Fetch from .env file with fallback

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const response = await fetch(`${BASE_URL}auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || 'Registration failed');
        }

        return responseData;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred during registration');
    }
};

/**
 * Login a user
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${BASE_URL}auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Handle error response format: { "detail": "Login failed: Invalid email or password" }
            throw new Error(responseData.detail || 'Login failed');
        }

        // Return the response data (storage is handled in AuthContext)
        return responseData;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred during login');
    }
};

/**
 * Store user data in storage
 */
export const storeUserData = async (userData: Partial<LoginResponse>): Promise<void> => {
    const userDataToStore = JSON.stringify({
        uid: userData.uid,
        email: userData.email,
        display_name: userData.display_name,
        username: userData.username
    });

    try {
        // For React Native
        await AsyncStorage.setItem('user', userDataToStore);

        // For web fallback
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', userDataToStore);
        }
    } catch (error) {
        console.error('Error storing user data:', error);
    }
};

/**
 * Get user data from storage
 */
export const getUserData = async (): Promise<{ uid?: string; email?: string; display_name?: string; username?: string } | null> => {
    try {
        // Try AsyncStorage first (React Native)
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }

        // Fallback to localStorage for web
        if (typeof localStorage !== 'undefined') {
            const webUserData = localStorage.getItem('user');
            if (webUserData) {
                return JSON.parse(webUserData);
            }
        }
    } catch (error) {
        console.error('Error retrieving user data:', error);
    }
    return null;
};

/**
 * Store auth token in storage
 */
export const storeAuthToken = async (token: string): Promise<void> => {
    try {
        // For React Native
        await AsyncStorage.setItem('authToken', token);

        // For web fallback
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('authToken', token);
        }
    } catch (error) {
        console.error('Error storing auth token:', error);
    }
};

/**
 * Get auth token from storage
 */
export const getAuthToken = async (): Promise<string | null> => {
    try {
        // Try AsyncStorage first (React Native)
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            return token;
        }

        // Fallback to localStorage for web
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('authToken');
        }
    } catch (error) {
        console.error('Error retrieving auth token:', error);
    }
    return null;
};

/**
 * Remove auth token from storage (logout)
 */
export const removeAuthToken = async (): Promise<void> => {
    try {
        // For React Native
        await AsyncStorage.multiRemove(['authToken', 'user']);

        // For web fallback
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error('Error removing auth data:', error);
    }
};

// Get user profile data
export const getUserProfile = async (userId: string) => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}api/user-profile?user_id=${userId}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error('Failed to retrieve user profile');
        }

        return data.profile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}; 