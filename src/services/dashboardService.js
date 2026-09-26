import { supabase } from '../lib/supabase.js';
import { impactService } from './impactService.js';

export const dashboardService = {
  /**
   * Get personalized and global dashboard activity metrics
   * @param {string} [userId] Optional specific user ID
   * @returns {Promise<{ metrics: object|null, error: string|null }>}
   */
  async getDashboardMetrics(userId = null) {
    try {
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id || null;
      }

      // 1. Fetch Global / User Listing Stats
      const { data: listings, error: listError } = await supabase
        .from('listings')
        .select('id, owner_id, status, quantity, unit, material_type');

      if (listError) {
        return { metrics: null, error: listError.message };
      }

      const allListings = listings || [];
      const totalListings = allListings.length;
      const activeListings = allListings.filter(l => l.status === 'OPEN').length;

      // User specific listings
      const myListings = currentUserId ? allListings.filter(l => l.owner_id === currentUserId) : [];
      const myActiveListings = myListings.filter(l => l.status === 'OPEN').length;

      // 2. Fetch Exchange Requests
      const { data: requests, error: reqError } = await supabase
        .from('exchange_requests')
        .select('id, listing_id, requester_id, status');

      const allRequests = requests || [];
      const totalRequests = allRequests.length;
      const pendingRequests = allRequests.filter(r => r.status === 'REQUESTED').length;
      const acceptedRequests = allRequests.filter(r => r.status === 'ACCEPTED').length;
      const completedRequests = allRequests.filter(r => r.status === 'COMPLETED').length;

      // User specific requests
      const mySentRequests = currentUserId ? allRequests.filter(r => r.requester_id === currentUserId) : [];

      // 3. Fetch Circular Impact
      const { totalMaterialCirculatedKg, completedExchangeCount, estimates } = await impactService.getImpactMetrics();

      return {
        metrics: {
          global: {
            totalListings,
            activeListings,
            totalRequests,
            pendingRequests,
            acceptedRequests,
            completedRequests,
            totalMaterialCirculatedKg,
            completedExchangeCount,
            co2OffsetKg: estimates.co2OffsetKg,
          },
          user: currentUserId ? {
            myTotalListings: myListings.length,
            myActiveListings,
            mySentRequestsCount: mySentRequests.length,
            myPendingSentCount: mySentRequests.filter(r => r.status === 'REQUESTED').length,
            myAcceptedSentCount: mySentRequests.filter(r => r.status === 'ACCEPTED').length,
          } : null,
        },
        error: null,
      };
    } catch (err) {
      return { metrics: null, error: err.message || 'Failed to aggregate dashboard metrics.' };
    }
  },
};
