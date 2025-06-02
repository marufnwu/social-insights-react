import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SocialMediaContext = createContext({});

export const useSocialMedia = () => {
  return useContext(SocialMediaContext);
};

export const SocialMediaProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [widgetPreferences, setWidgetPreferences] = useState([]);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Load available providers and user connections when user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchProviders();
      fetchConnections();
      fetchWidgetPreferences();
    }
  }, [currentUser]);

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const response = await api.get('/api/social-media/providers');
      setProviders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchConnections = async () => {
    try {
      setLoadingConnections(true);
      const response = await api.get('/api/social-media/connections');
      setConnections(response.data.data.connections);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const fetchWidgetPreferences = async () => {
    try {
      setLoadingPreferences(true);
      const response = await api.get('/api/widget/preferences');
      setWidgetPreferences(response.data.data.connections);
    } catch (error) {
      console.error('Failed to fetch widget preferences:', error);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const getLoginUrl = async (provider, platform = 'web') => {
    try {
      const response = await api.post('/api/social-media/auth/url', {
        provider,
        platform
      });
      return response.data.data.login_url;
    } catch (error) {
      console.error('Failed to get login URL:', error);
      throw error;
    }
  };

  const processOAuthCallback = async (provider, code) => {
    try {
      const response = await api.post('/api/social-media/auth/callback', {
        provider,
        code
      });
      await fetchConnections();
      return response.data;
    } catch (error) {
      console.error('Failed to process OAuth callback:', error);
      throw error;
    }
  };

  const disconnectProvider = async (provider, providerId) => {
    try {
      const response = await api.post('/api/social-media/auth/disconnect', {
        provider,
        provider_id: providerId
      });
      await fetchConnections();
      return response.data;
    } catch (error) {
      console.error('Failed to disconnect provider:', error);
      throw error;
    }
  };

  const saveWidgetPreferences = async (preferencesData) => {
    try {
      const response = await api.post('/api/widget/preferences', {
        connections: preferencesData
      });
      await fetchWidgetPreferences();
      return response.data;
    } catch (error) {
      console.error('Failed to save widget preferences:', error);
      throw error;
    }
  };

  const toggleWidgetVisibility = async (connectionId) => {
    try {
      const response = await api.post(`/api/widget/preferences/${connectionId}/toggle`);
      await fetchWidgetPreferences();
      return response.data;
    } catch (error) {
      console.error('Failed to toggle widget visibility:', error);
      throw error;
    }
  };

  const value = {
    providers,
    connections,
    widgetPreferences,
    loadingProviders,
    loadingConnections,
    loadingPreferences,
    getLoginUrl,
    processOAuthCallback,
    disconnectProvider,
    saveWidgetPreferences,
    toggleWidgetVisibility,
    refreshConnections: fetchConnections,
  };

  return (
    <SocialMediaContext.Provider value={value}>
      {children}
    </SocialMediaContext.Provider>
  );
};