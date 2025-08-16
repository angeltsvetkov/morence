export interface SubdomainInfo {
  isSubdomain: boolean;
  subdomain?: string;
  isMainDomain: boolean;
}

/**
 * Analyzes the current hostname to determine if we're on a subdomain
 * and extracts the subdomain name if applicable
 */
export const getSubdomainInfo = (): SubdomainInfo => {
  const hostname = window.location.hostname;
  
  // For development
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return {
      isSubdomain: false,
      isMainDomain: true
    };
  }
  
  // Check if it's the main morence.top domain
  if (hostname === 'morence.top' || hostname === 'www.morence.top') {
    return {
      isSubdomain: false,
      isMainDomain: true
    };
  }
  
  // Check if it's a subdomain of morence.top
  const morenceTopPattern = /^([a-zA-Z0-9-]+)\.morence\.top$/;
  const match = hostname.match(morenceTopPattern);
  
  if (match) {
    const subdomain = match[1];
    // Exclude 'www' as it's considered the main domain
    if (subdomain === 'www') {
      return {
        isSubdomain: false,
        isMainDomain: true
      };
    }
    
    return {
      isSubdomain: true,
      subdomain: subdomain,
      isMainDomain: false
    };
  }
  
  // For other domains (like Vercel previews), treat as main domain
  return {
    isSubdomain: false,
    isMainDomain: true
  };
};

/**
 * Gets the apartment domain from the current URL if we're on a subdomain
 */
export const getCurrentSubdomain = (): string | null => {
  const info = getSubdomainInfo();
  return info.isSubdomain ? info.subdomain! : null;
};
