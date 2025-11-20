import { useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../constants/api';

// Simulador de analytics (en producción sería Google Analytics, etc.)
class AnalyticsService {
  constructor() {
    this.events = [];
    this.pageViews = [];
    this.userActions = [];
    this.performance = [];
  }

  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.events.push(event);
    
    if (APP_CONFIG.ENVIRONMENT === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }

  pageView(page) {
    const pageView = {
      page,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      url: window.location.href
    };
    
    this.pageViews.push(pageView);
    
    if (APP_CONFIG.ENVIRONMENT === 'development') {
      console.log('📄 Page View:', pageView);
    }
  }

  userAction(action, target, properties = {}) {
    const userAction = {
      action,
      target,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    this.userActions.push(userAction);
    
    if (APP_CONFIG.ENVIRONMENT === 'development') {
      console.log('👆 User Action:', userAction);
    }
  }

  performance(metric, value, properties = {}) {
    const performanceMetric = {
      metric,
      value,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    this.performance.push(performanceMetric);
    
    if (APP_CONFIG.ENVIRONMENT === 'development') {
      console.log('⚡ Performance:', performanceMetric);
    }
  }

  getStats() {
    return {
      events: this.events.length,
      pageViews: this.pageViews.length,
      userActions: this.userActions.length,
      performance: this.performance.length,
      data: {
        events: this.events,
        pageViews: this.pageViews,
        userActions: this.userActions,
        performance: this.performance
      }
    };
  }
}

const analytics = new AnalyticsService();

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName, properties = {}) => {
    analytics.track(eventName, properties);
  }, []);

  const trackPageView = useCallback((page) => {
    analytics.pageView(page);
  }, []);

  const trackUserAction = useCallback((action, target, properties = {}) => {
    analytics.userAction(action, target, properties);
  }, []);

  const trackPerformance = useCallback((metric, value, properties = {}) => {
    analytics.performance(metric, value, properties);
  }, []);

  // Auto-track page views
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);

  // Track performance metrics
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          trackPerformance('page_load_time', entry.loadEventEnd - entry.loadEventStart);
          trackPerformance('dom_content_loaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          trackPerformance('largest_contentful_paint', entry.startTime);
        }
        
        if (entry.entryType === 'first-input') {
          trackPerformance('first_input_delay', entry.processingStart - entry.startTime);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });
    } catch (e) {
      // Fallback para navegadores que no soportan todas las métricas
      console.warn('Performance Observer not fully supported');
    }

    return () => observer.disconnect();
  }, [trackPerformance]);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackPerformance,
    getStats: analytics.getStats.bind(analytics)
  };
};

// Hook para métricas de UX
export const useUXMetrics = () => {
  const { trackEvent, trackUserAction } = useAnalytics();

  const trackFormSubmission = useCallback((formName, success, errors = []) => {
    trackEvent('form_submission', {
      form_name: formName,
      success,
      error_count: errors.length,
      errors
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((buttonName, context = '') => {
    trackUserAction('click', 'button', {
      button_name: buttonName,
      context
    });
  }, [trackUserAction]);

  const trackError = useCallback((errorType, errorMessage, context = '') => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      context
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((featureName, properties = {}) => {
    trackEvent('feature_usage', {
      feature_name: featureName,
      ...properties
    });
  }, [trackEvent]);

  const trackSearchQuery = useCallback((query, resultsCount, context = '') => {
    trackEvent('search', {
      query,
      results_count: resultsCount,
      context
    });
  }, [trackEvent]);

  return {
    trackFormSubmission,
    trackButtonClick,
    trackError,
    trackFeatureUsage,
    trackSearchQuery
  };
};