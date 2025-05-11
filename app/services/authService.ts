// Define the types for the API responses and requests
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

        // Store the token immediately on successful login
        if (responseData.token) {
            storeAuthToken(responseData.token);
            storeUserData(responseData);
        }

        return responseData;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unexpected error occurred during login');
    }
};

/**
 * Store user data in local storage
 */
export const storeUserData = (userData: Partial<LoginResponse>): void => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify({
            uid: userData.uid,
            email: userData.email,
            display_name: userData.display_name,
            username: userData.username
        }));
    }
};

/**
 * Get user data from local storage
 */
export const getUserData = (): { uid?: string; email?: string; display_name?: string; username?: string } | null => {
    if (typeof localStorage !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
    }
    return null;
};

/**
 * Store auth token in local storage
 */
export const storeAuthToken = (token: string): void => {
    // For web
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token);
    }

    // For React Native, you would use AsyncStorage or SecureStore
    // We'll implement this when we add those libraries
};

/**
 * Get auth token from local storage
 */
export const getAuthToken = (): string | null => {
    // For web
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('authToken');
    }

    // For React Native, you would use AsyncStorage or SecureStore
    return null;
};

/**
 * Remove auth token from local storage (logout)
 */
export const removeAuthToken = (): void => {
    // For web
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    // For React Native, you would use AsyncStorage or SecureStore
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