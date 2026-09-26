import { supabase } from '../lib/supabase.js';

/**
 * 1. Material Compatibility (Weight: 40%)
 * Strict check: must match material category exactly
 */
export const calculateMaterialScore = (listingMaterial, reqMaterial) => {
  if (!listingMaterial || !reqMaterial) return 0;
  return listingMaterial.trim().toLowerCase() === reqMaterial.trim().toLowerCase() ? 40 : 0;
};

/**
 * 2. Quantity Compatibility (Weight: 20%)
 * Fits inside [min_quantity, max_quantity] -> 20/20
 * Close to bounds -> Proportional score (10-18)
 * Unsuitable -> 0
 */
export const calculateQuantityScore = (quantity, minQuantity, maxQuantity) => {
  const qty = Number(quantity);
  const min = Number(minQuantity);
  const max = Number(maxQuantity);

  if (isNaN(qty) || isNaN(min) || isNaN(max) || qty <= 0) return 0;

  // Perfect fit inside buyer's requested window
  if (qty >= min && qty <= max) {
    return 20;
  }

  // Slightly below minimum (e.g. 70%-99% of min)
  if (qty < min) {
    const ratio = qty / min;
    if (ratio >= 0.7) {
      return Math.round(20 * ratio * 0.85); // 12 - 16 pts
    } else if (ratio >= 0.4) {
      return Math.round(20 * ratio * 0.6); // 5 - 8 pts
    }
    return 0;
  }

  // Slightly above maximum (e.g. within 150% of max)
  if (qty > max) {
    const overage = (qty - max) / max;
    if (overage <= 0.3) {
      return Math.round(20 * (1 - overage * 0.7)); // 15 - 18 pts
    } else if (overage <= 0.8) {
      return Math.round(20 * (1 - overage * 0.9)); // 6 - 12 pts
    }
    return 0;
  }

  return 0;
};

/**
 * 3. Location & Distance Compatibility (Weight: 20%)
 * Transparent heuristic for Hackathon MVP
 */
export const calculateLocationScore = (listingLoc = '', reqLoc = '') => {
  const l1 = (listingLoc || '').toLowerCase().trim();
  const l2 = (reqLoc || '').toLowerCase().trim();

  if (!l1 || !l2) {
    return { score: 14, distance: 'Est. 15 km (Regional Corridor)' };
  }

  // Exact location string match
  if (l1 === l2) {
    return { score: 20, distance: '1.2 km (Same Industrial Zone)' };
  }

  // Extract key city tokens
  const hubs = ['mumbai', 'pune', 'bengaluru', 'bangalore', 'thane', 'delhi', 'surat', 'ahmedabad', 'hyderabad', 'chennai'];
  const l1Hub = hubs.find(h => l1.includes(h));
  const l2Hub = hubs.find(h => l2.includes(h));

  if (l1Hub && l2Hub && l1Hub === l2Hub) {
    return { score: 19, distance: '4.8 km (Same Metro District)' };
  }

  // Regional neighbors (e.g., Mumbai - Pune, Mumbai - Thane)
  const isNeighbor =
    (l1.includes('mumbai') && (l2.includes('thane') || l2.includes('pune') || l2.includes('navi mumbai'))) ||
    (l2.includes('mumbai') && (l1.includes('thane') || l1.includes('pune') || l1.includes('navi mumbai')));

  if (isNeighbor) {
    return { score: 16, distance: '22 km (Adjacent Industrial Cluster)' };
  }

  // Shared generic words (e.g. "Zone", "Park", "Phase")
  const tokens1 = l1.split(/[\s,/-]+/).filter(t => t.length > 3);
  const tokens2 = l2.split(/[\s,/-]+/).filter(t => t.length > 3);
  const common = tokens1.filter(t => tokens2.includes(t));

  if (common.length > 0) {
    return { score: 15, distance: '18 km (Shared Logistics Cluster)' };
  }

  // Different locations
  return { score: 10, distance: '85 km (Inter-District Transit)' };
};

/**
 * 4. Condition Compatibility (Weight: 10%)
 */
export const calculateConditionScore = (listingCondition, acceptableConditions = []) => {
  if (!listingCondition) return 0;
  if (!Array.isArray(acceptableConditions) || acceptableConditions.length === 0) {
    return 5; // Neutral fallback
  }

  if (acceptableConditions.includes(listingCondition)) {
    return 10;
  }

  // Adjacent acceptable downgrade (e.g., requested Excellent, got Good)
  if (
    (acceptableConditions.includes('Excellent') && listingCondition === 'Good') ||
    (acceptableConditions.includes('Good') && listingCondition === 'Fair')
  ) {
    return 5;
  }

  return 0;
};

/**
 * 5. Availability & Timing Compatibility (Weight: 10%)
 */
export const calculateAvailabilityScore = (listingStatus, reqActive) => {
  const isListingOpen = listingStatus === 'OPEN';
  const isReqActive = reqActive !== false;
  return isListingOpen && isReqActive ? 10 : 0;
};

/**
 * Generates human-readable explanation of why a match was ranked
 */
export const generateMatchReason = ({
  materialScore,
  quantityScore,
  locationScore,
  conditionScore,
  availabilityScore,
  listing,
  requirement,
  distance,
}) => {
  const reasons = [];

  if (materialScore === 40) {
    reasons.push(`${listing.material_type} stream compatibility verified`);
  }

  if (quantityScore >= 18) {
    reasons.push(`available volume (${listing.quantity} ${listing.unit}) perfectly fits demand range (${requirement.min_quantity}–${requirement.max_quantity} ${listing.unit})`);
  } else if (quantityScore >= 10) {
    reasons.push(`volume (${listing.quantity} ${listing.unit}) close to target range`);
  }

  if (conditionScore === 10) {
    reasons.push(`condition (${listing.condition}) accepted`);
  } else if (conditionScore === 5) {
    reasons.push(`condition (${listing.condition}) acceptable for reprocessing`);
  }

  if (locationScore >= 18) {
    reasons.push(`local proximity (${distance})`);
  } else {
    reasons.push(`transit distance (${distance})`);
  }

  return reasons.join('; ') + '.';
};

export const matchingService = {
  /**
   * Calculate full transparent rule-based score between a listing and a requirement
   * @param {Object} listing 
   * @param {Object} requirement 
   * @returns {Object|null} Match details with breakdown and final percentage
   */
  calculateMatchScore(listing, requirement) {
    if (!listing || !requirement) return null;

    // 1. Material (Weight 40%) - Candidate is discarded if not matching
    const materialScore = calculateMaterialScore(listing.material_type, requirement.material_type);
    if (materialScore === 0) {
      return null;
    }

    // 2. Quantity (Weight 20%)
    const quantityScore = calculateQuantityScore(
      listing.quantity,
      requirement.min_quantity,
      requirement.max_quantity
    );

    // 3. Location (Weight 20%)
    const { score: locationScore, distance } = calculateLocationScore(
      listing.location,
      requirement.location
    );

    // 4. Condition (Weight 10%)
    const conditionScore = calculateConditionScore(
      listing.condition,
      requirement.acceptable_condition
    );

    // 5. Availability (Weight 10%)
    const availabilityScore = calculateAvailabilityScore(
      listing.status,
      requirement.active
    );

    // Final Score (0 - 100)
    const finalScore = Math.min(
      100,
      materialScore + quantityScore + locationScore + conditionScore + availabilityScore
    );

    const reason = generateMatchReason({
      materialScore,
      quantityScore,
      locationScore,
      conditionScore,
      availabilityScore,
      listing,
      requirement,
      distance,
    });

    return {
      requirementId: requirement.id,
      buyerId: requirement.buyer_id,
      buyerName: requirement.profiles?.name || 'Verified Buyer',
      buyerLocation: requirement.location || 'Regional Hub',
      matchPercentage: Math.round(finalScore),
      scores: {
        materialScore,
        quantityScore,
        locationScore,
        conditionScore,
        availabilityScore,
      },
      distance,
      reason,
      requirement,
    };
  },

  /**
   * Find top 3-5 compatible buyer requirements for a specific waste listing
   * @param {string|object} listingOrId 
   * @returns {Promise<{ matches: Array<object>, error: string|null }>}
   */
  async findMatchesForListing(listingOrId) {
    try {
      let listing = listingOrId;
      if (typeof listingOrId === 'string') {
        const { data, error } = await supabase
          .from('listings')
          .select('*, profiles:owner_id(*)')
          .eq('id', listingOrId)
          .single();

        if (error || !data) {
          return { matches: [], error: error?.message || 'Listing not found.' };
        }
        listing = data;
      }

      // Fetch all active requirements
      const { data: requirements, error: reqError } = await supabase
        .from('requirements')
        .select(`
          *,
          profiles:buyer_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .eq('active', true);

      if (reqError) {
        return { matches: [], error: reqError.message };
      }

      const matches = (requirements || [])
        .map(req => this.calculateMatchScore(listing, req))
        .filter(m => m !== null && m.matchPercentage >= 50) // Filter incompatible
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5); // Top 3-5 matches

      return { matches, error: null };
    } catch (err) {
      return { matches: [], error: err.message || 'Matching computation failed.' };
    }
  },

  /**
   * Find top compatible waste listings for a buyer requirement
   * @param {string|object} requirementOrId 
   * @returns {Promise<{ matches: Array<object>, error: string|null }>}
   */
  async findMatchesForRequirement(requirementOrId) {
    try {
      let requirement = requirementOrId;
      if (typeof requirementOrId === 'string') {
        const { data, error } = await supabase
          .from('requirements')
          .select('*, profiles:buyer_id(*)')
          .eq('id', requirementOrId)
          .single();

        if (error || !data) {
          return { matches: [], error: error?.message || 'Requirement not found.' };
        }
        requirement = data;
      }

      // Fetch open listings
      const { data: listings, error: listError } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .eq('status', 'OPEN');

      if (listError) {
        return { matches: [], error: listError.message };
      }

      const matches = (listings || [])
        .map(list => {
          const scoreData = this.calculateMatchScore(list, requirement);
          if (!scoreData) return null;
          return {
            ...scoreData,
            listingId: list.id,
            listing,
          };
        })
        .filter(m => m !== null && m.matchPercentage >= 50)
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5);

      return { matches, error: null };
    } catch (err) {
      return { matches: [], error: err.message || 'Matching computation failed.' };
    }
  },
};
