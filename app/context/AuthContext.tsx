"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
interface User {
    user_id: string;
    sub?: string;
    name?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    role?: string;
    raw_user?: any;
}
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const login = () => {
        // Redirect to local API route which will redirect to backend login
        window.location.href = `/api/auth/login`;
    };
    const logout = async () => {
        try {
            // Call local API route which will proxy to backend
            const response = await axios.post(`/api/auth/logout`, {}, { withCredentials: true });
            setUser(null);
            // Check if backend provided a logout URL (e.g., W3 SLO)
            if (response.data && response.data.logout_url) {
                console.log('Redirecting to SSO logout:', response.data.logout_url);
                window.location.href = response.data.logout_url;
            } else {
                // No SSO logout URL, just redirect to home
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout failed", error);
            // Even if logout fails, clear local state and redirect
            setUser(null);
            window.location.href = "/";
        }
    };
    const normalizeUser = (userData: any): User => {
        let userId = userData.user_id;
        // If user_id is missing, try to extract it from identities like the backend does
        if (!userId && userData.identities && userData.identities.length > 0) {
            try {
                const idpUserInfo = userData.identities[0].idpUserInfo || {};
                const attributes = idpUserInfo.attributes || {};
                userId = attributes.uid;
            } catch (e) {
                console.warn("Error extracting user_id from identities", e);
            }
        }
        // Fallback to sub
        if (!userId) {
            userId = userData.sub;
        }
        // Extract role (handle array or string)
        let role = "Consultant"; // Default
        if (userData.role) {
            role = userData.role;
        } else if (userData.roles && Array.isArray(userData.roles)) {
            // Simple logic: if 'Manager' is in the list, be Manager, else Consultant
            if (userData.roles.includes("Manager")) {
                role = "Manager";
            } else {
                role = userData.roles[0] || "Consultant";
            }
        }
        return {
            user_id: userId,
            sub: userData.sub,
            name: userData.name,
            email: userData.email,
            given_name: userData.given_name,
            family_name: userData.family_name,
            role: role,
            raw_user: userData
        };
    };
    const checkAuth = async () => {
        try {
            // Use local API route which will proxy to backend with proper cookie handling
            const response = await axios.get(`/api/auth/user`, {
                withCredentials: true,
            });
            if (response.data && response.data.user) {
                const normalized = normalizeUser(response.data.user);
                setUser(normalized);
                // Sync user with backend (create if not exists)
                try {
                    const payload = {
                        email: normalized.email,
                        name: normalized.name,
                        user_type: normalized.role,
                        manager_id: null, // Send null instead of invalid string
                        is_manager: normalized.role === 'Manager',
                        user_id: normalized.user_id
                    };
                    console.log('Syncing user with backend, payload:', payload);
                    await axios.post('/api/auth/user', payload, {
                        withCredentials: true
                    });
                    console.log('User synced with backend');
                } catch (syncError) {
                    console.error('Failed to sync user with backend:', syncError);
                    // We don't block login on sync failure, but log it
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.warn("Auth check failed - user likely not logged in", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        checkAuth();
    }, []);
    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}