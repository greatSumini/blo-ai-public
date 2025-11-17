'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useParams } from 'next/navigation';

interface OrganizationContextValue {
  /**
   * Current organization ID from URL params
   */
  orgId: string | null;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();

  const orgId = useMemo(() => {
    if (params && typeof params.orgId === 'string') {
      return params.orgId;
    }
    return null;
  }, [params]);

  const value = useMemo<OrganizationContextValue>(() => ({
    orgId,
  }), [orgId]);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to get the current organization ID from URL
 * Returns null if not in an organization context
 */
export function useCurrentOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useCurrentOrganization must be used within OrganizationProvider');
  }
  return context;
}

/**
 * Hook to get the current organization ID
 * Throws an error if orgId is null
 */
export function useRequiredOrganization() {
  const { orgId } = useCurrentOrganization();
  if (!orgId) {
    throw new Error('Organization ID is required but not found in URL');
  }
  return orgId;
}
