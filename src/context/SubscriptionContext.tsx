import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { Session } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanId = 'basic' | 'intermediate' | 'large' | 'commercial';
export type SubscriptionStatus = 'trialing' | 'active' | 'grace_period' | 'cancelled';

export interface SubscriptionContextValue {
  /** e.g. 'basic' */
  planId: PlanId | null;
  /** e.g. 'Basic' */
  planName: string;
  /** 'trialing' | 'active' | 'grace_period' | 'cancelled' */
  status: SubscriptionStatus | null;
  /** Max active animals allowed on this plan */
  animalLimit: number;
  /** Current count of status='Active' animals */
  activeAnimalCount: number;
  /** ISO string for when the trial ends */
  trialEndsAt: string | null;
  /** Days remaining in trial (null if not trialing) */
  trialDaysRemaining: number | null;
  /** true when activeAnimalCount >= animalLimit */
  isAtLimit: boolean;
  /** true when status is grace_period or cancelled */
  isBlocked: boolean;
  /** Convenience: !isBlocked && !isAtLimit */
  canAddAnimals: boolean;
  /** true while loading from Supabase */
  isLoading: boolean;
  /** Refetch subscription data (call after plan changes) */
  refreshSubscription: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextValue>({
  planId: null,
  planName: '',
  status: null,
  animalLimit: 0,
  activeAnimalCount: 0,
  trialEndsAt: null,
  trialDaysRemaining: null,
  isAtLimit: false,
  isBlocked: false,
  canAddAnimals: false,
  isLoading: true,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SubscriptionProvider = ({ session, children }: { session: Session; children: React.ReactNode }) => {
  const [planId, setPlanId]                     = useState<PlanId | null>(null);
  const [planName, setPlanName]                 = useState('');
  const [status, setStatus]                     = useState<SubscriptionStatus | null>(null);
  const [animalLimit, setAnimalLimit]           = useState(0);
  const [activeAnimalCount, setActiveAnimalCount] = useState(0);
  const [trialEndsAt, setTrialEndsAt]           = useState<string | null>(null);
  const [isLoading, setIsLoading]               = useState(true);

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = session.user.id;

      // 1. Fetch current subscription joined with plan definition
      const { data: sub, error: subErr } = await supabase
        .from('subscriptions')
        .select(`
          plan_id,
          status,
          trial_ends_at,
          plan_definitions (
            name,
            animal_limit
          )
        `)
        .eq('user_id', userId)
        .single();

      // 2. If no subscription found, provision a basic one
      if (subErr || !sub) {
        console.log('SubscriptionContext: No subscription found, provisioning default...');
        await supabase.rpc('provision_subscription', {
          p_user_id: userId,
          p_plan_id: 'basic',
        });
        
        // Re-fetch now that it exists
        const { data: newSub } = await supabase
          .from('subscriptions')
          .select(`plan_id, status, trial_ends_at, plan_definitions(name, animal_limit)`)
          .eq('user_id', userId)
          .single();
        
        if (!newSub) return;
        
        updateStateFromSub(newSub, userId);
      } else {
        updateStateFromSub(sub, userId);
      }
    } catch (err) {
      console.error('SubscriptionContext: unexpected error', err);
    } finally {
      setIsLoading(false);
    }
  }, [session.user.id]);

  const updateStateFromSub = async (sub: any, userId: string) => {
    // Check if trial has expired and update status to grace_period if needed
    let resolvedStatus = sub.status as SubscriptionStatus;
    if (resolvedStatus === 'trialing' && sub.trial_ends_at) {
      const trialEnd = new Date(sub.trial_ends_at);
      if (trialEnd < new Date()) {
        await supabase
          .from('subscriptions')
          .update({ status: 'grace_period', updated_at: new Date().toISOString() })
          .eq('user_id', userId);
        resolvedStatus = 'grace_period';
      }
    }

    const planDef = sub.plan_definitions as any;
    setPlanId(sub.plan_id as PlanId);
    setPlanName(planDef?.name ?? sub.plan_id);
    setStatus(resolvedStatus);
    setAnimalLimit(planDef?.animal_limit ?? 0);
    setTrialEndsAt(sub.trial_ends_at);

    // Fetch active animal count
    const { count, error: countErr } = await supabase
      .from('animals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Active');

    if (!countErr) {
      setActiveAnimalCount(count ?? 0);
    }
  };
    } catch (err) {
      console.error('SubscriptionContext: unexpected error', err);
    } finally {
      setIsLoading(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Derived values
  const trialDaysRemaining = (() => {
    if (status !== 'trialing' || !trialEndsAt) return null;
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const isAtLimit  = activeAnimalCount >= animalLimit;
  const isBlocked  = status === 'grace_period' || status === 'cancelled';
  const canAddAnimals = !isBlocked && !isAtLimit;

  return (
    <SubscriptionContext.Provider value={{
      planId,
      planName,
      status,
      animalLimit,
      activeAnimalCount,
      trialEndsAt,
      trialDaysRemaining,
      isAtLimit,
      isBlocked,
      canAddAnimals,
      isLoading,
      refreshSubscription: fetchSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
