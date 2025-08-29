import { useEffect } from 'react'
import { trackPageView, trackButtonClick, analyticsService } from '@/services/analytics'

export const useAnalytics = () => {
  const trackPage = (pageName: string) => {
    trackPageView(pageName)
  }

  const trackClick = (buttonName: string, context?: Record<string, any>) => {
    trackButtonClick(buttonName, context)
  }

  const trackFormSubmit = (formName: string, success: boolean, context?: Record<string, any>) => {
    const sessionId = sessionStorage.getItem('session_id') || Math.random().toString(36).substring(7)
    
    analyticsService.trackEvent({
      event_type: 'form_submit',
      event_name: 'Form Submit',
      session_id: sessionId,
      page_url: window.location.href,
      properties: { 
        form_name: formName, 
        success,
        ...context 
      }
    }).catch(console.error)
  }

  const trackSearch = (query: string, results: number, context?: Record<string, any>) => {
    const sessionId = sessionStorage.getItem('session_id') || Math.random().toString(36).substring(7)
    
    analyticsService.trackEvent({
      event_type: 'search_performed',
      event_name: 'Search Performed',
      session_id: sessionId,
      page_url: window.location.href,
      properties: { 
        query, 
        results_count: results,
        ...context 
      }
    }).catch(console.error)
  }

  const trackPropertyView = (propertyId: number, propertyType?: string) => {
    const sessionId = sessionStorage.getItem('session_id') || Math.random().toString(36).substring(7)
    
    analyticsService.trackEvent({
      event_type: 'property_view',
      event_name: 'Property View',
      session_id: sessionId,
      page_url: window.location.href,
      properties: { 
        property_id: propertyId,
        property_type: propertyType
      }
    }).catch(console.error)
  }

  return {
    trackPage,
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackPropertyView
  }
}

// Auto-track page views for components
export const usePageTracking = (pageName: string) => {
  useEffect(() => {
    trackPageView(pageName)
  }, [pageName])
}