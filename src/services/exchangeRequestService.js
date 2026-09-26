import { supabase } from '../lib/supabase.js';

export const exchangeRequestService = {
  /**
   * CREATE: Buyer sends exchange request for an OPEN listing
   * @param {Object} params
   * @param {string} params.listing_id
   * @param {string} [params.message]
   * @returns {Promise<{ request: object|null, error: string|null }>}
   */
  async createExchangeRequest({ listing_id, message = '' }) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { request: null, error: 'You must be logged in to request materials.' };
      }

      if (!listing_id) {
        return { request: null, error: 'Listing ID is required.' };
      }

      // 1. Fetch listing to verify status & prevent self-request
      const { data: listing, error: listError } = await supabase
        .from('listings')
        .select('id, owner_id, status')
        .eq('id', listing_id)
        .single();

      if (listError || !listing) {
        return { request: null, error: 'Listing not found.' };
      }

      if (listing.owner_id === user.id) {
        return { request: null, error: 'You cannot create an exchange request for your own listing.' };
      }

      if (listing.status !== 'OPEN' && listing.status !== 'REQUESTED') {
        return { request: null, error: `This listing is currently ${listing.status} and cannot be requested.` };
      }

      // 2. Check for duplicate pending requests
      const { data: existing } = await supabase
        .from('exchange_requests')
        .select('id, status')
        .eq('listing_id', listing_id)
        .eq('requester_id', user.id)
        .in('status', ['REQUESTED', 'ACCEPTED'])
        .maybeSingle();

      if (existing) {
        return { request: null, error: `You already have an active (${existing.status}) request for this listing.` };
      }

      // 3. Insert exchange request
      const { data: created, error } = await supabase
        .from('exchange_requests')
        .insert({
          listing_id,
          requester_id: user.id,
          message: message?.trim() || 'Requesting circular material exchange for verified reprocessing.',
          status: 'REQUESTED',
        })
        .select(`
          *,
          listings:listing_id (
            id,
            material_type,
            quantity,
            unit,
            condition,
            location,
            status,
            owner_id,
            profiles:owner_id (
              id,
              name,
              email,
              location
            )
          ),
          requester:requester_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .single();

      if (error) {
        return { request: null, error: error.message };
      }

      // 4. Update listing status to 'REQUESTED'
      await supabase
        .from('listings')
        .update({ status: 'REQUESTED' })
        .eq('id', listing_id);

      return { request: created, error: null };
    } catch (err) {
      return { request: null, error: err.message || 'Failed to submit exchange request.' };
    }
  },

  /**
   * READ: Get requests sent by the current user (Buyer perspective)
   * @returns {Promise<{ requests: Array<object>, error: string|null }>}
   */
  async getRequestsForUser() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { requests: [], error: 'User must be authenticated.' };
      }

      const { data, error } = await supabase
        .from('exchange_requests')
        .select(`
          *,
          listings:listing_id (
            id,
            material_type,
            quantity,
            unit,
            condition,
            location,
            status,
            image_url,
            owner_id,
            profiles:owner_id (
              id,
              name,
              email,
              location
            )
          )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { requests: [], error: error.message };
      }

      return { requests: data || [], error: null };
    } catch (err) {
      return { requests: [], error: err.message || 'Failed to fetch user requests.' };
    }
  },

  /**
   * READ: Get incoming requests on listings owned by the current user (Generator perspective)
   * @returns {Promise<{ requests: Array<object>, error: string|null }>}
   */
  async getRequestsForOwner() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { requests: [], error: 'User must be authenticated.' };
      }

      // First get user's listing IDs
      const { data: myListings, error: listErr } = await supabase
        .from('listings')
        .select('id')
        .eq('owner_id', user.id);

      if (listErr || !myListings || myListings.length === 0) {
        return { requests: [], error: null };
      }

      const listingIds = myListings.map(l => l.id);

      const { data, error } = await supabase
        .from('exchange_requests')
        .select(`
          *,
          listings:listing_id (
            id,
            material_type,
            quantity,
            unit,
            condition,
            location,
            status
          ),
          requester:requester_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });

      if (error) {
        return { requests: [], error: error.message };
      }

      return { requests: data || [], error: null };
    } catch (err) {
      return { requests: [], error: err.message || 'Failed to fetch incoming requests.' };
    }
  },

  /**
   * READ: Get requests for a specific listing
   * @param {string} listingId 
   * @returns {Promise<{ requests: Array<object>, error: string|null }>}
   */
  async getRequestsForListing(listingId) {
    try {
      if (!listingId) return { requests: [], error: 'Listing ID required.' };

      const { data, error } = await supabase
        .from('exchange_requests')
        .select(`
          *,
          requester:requester_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) {
        return { requests: [], error: error.message };
      }

      return { requests: data || [], error: null };
    } catch (err) {
      return { requests: [], error: err.message || 'Failed to fetch listing requests.' };
    }
  },

  /**
   * WORKFLOW: Generator accepts an exchange request (REQUESTED -> ACCEPTED)
   * @param {string} requestId 
   * @returns {Promise<{ request: object|null, error: string|null }>}
   */
  async acceptRequest(requestId) {
    try {
      if (!requestId) return { request: null, error: 'Request ID required.' };

      // 1. Fetch request and listing
      const { data: req, error: fetchErr } = await supabase
        .from('exchange_requests')
        .select('*, listings:listing_id(*)')
        .eq('id', requestId)
        .single();

      if (fetchErr || !req) {
        return { request: null, error: 'Request not found.' };
      }

      // 2. Update request status to ACCEPTED
      const { data: updated, error } = await supabase
        .from('exchange_requests')
        .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { request: null, error: error.message };
      }

      // 3. Sync listing status to ACCEPTED
      await supabase
        .from('listings')
        .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
        .eq('id', req.listing_id);

      return { request: updated, error: null };
    } catch (err) {
      return { request: null, error: err.message || 'Failed to accept request.' };
    }
  },

  /**
   * WORKFLOW: Generator rejects an exchange request (REQUESTED -> REJECTED)
   * @param {string} requestId 
   * @returns {Promise<{ request: object|null, error: string|null }>}
   */
  async rejectRequest(requestId) {
    try {
      if (!requestId) return { request: null, error: 'Request ID required.' };

      const { data: req } = await supabase
        .from('exchange_requests')
        .select('id, listing_id')
        .eq('id', requestId)
        .single();

      const { data: updated, error } = await supabase
        .from('exchange_requests')
        .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { request: null, error: error.message };
      }

      // Check if there are other pending requests for this listing
      if (req?.listing_id) {
        const { data: otherRequests } = await supabase
          .from('exchange_requests')
          .select('id')
          .eq('listing_id', req.listing_id)
          .in('status', ['REQUESTED', 'ACCEPTED']);

        if (!otherRequests || otherRequests.length === 0) {
          // Revert listing status back to OPEN
          await supabase
            .from('listings')
            .update({ status: 'OPEN', updated_at: new Date().toISOString() })
            .eq('id', req.listing_id);
        }
      }

      return { request: updated, error: null };
    } catch (err) {
      return { request: null, error: err.message || 'Failed to reject request.' };
    }
  },

  /**
   * WORKFLOW: Complete physical material exchange (ACCEPTED -> COMPLETED)
   * @param {string} requestId 
   * @returns {Promise<{ request: object|null, error: string|null }>}
   */
  async completeExchange(requestId) {
    try {
      if (!requestId) return { request: null, error: 'Request ID required.' };

      const { data: req, error: fetchErr } = await supabase
        .from('exchange_requests')
        .select('id, listing_id')
        .eq('id', requestId)
        .single();

      if (fetchErr || !req) {
        return { request: null, error: 'Request not found.' };
      }

      // 1. Mark request COMPLETED
      const { data: updated, error } = await supabase
        .from('exchange_requests')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return { request: null, error: error.message };
      }

      // 2. Mark listing COMPLETED (circulated into economy)
      await supabase
        .from('listings')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', req.listing_id);

      return { request: updated, error: null };
    } catch (err) {
      return { request: null, error: err.message || 'Failed to complete exchange.' };
    }
  },

  /**
   * READ: Get single request by ID
   * @param {string} id 
   * @returns {Promise<{ request: object|null, error: string|null }>}
   */
  async getRequestById(id) {
    try {
      if (!id) return { request: null, error: 'Request ID required.' };

      const { data, error } = await supabase
        .from('exchange_requests')
        .select(`
          *,
          listings:listing_id (
            *,
            profiles:owner_id (*)
          ),
          requester:requester_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { request: null, error: error.message };
      }

      return { request: data, error: null };
    } catch (err) {
      return { request: null, error: err.message || 'Failed to fetch request.' };
    }
  },
};
