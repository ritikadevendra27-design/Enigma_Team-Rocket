import { supabase } from '../lib/supabase.js';

// Transparent, configurable estimation multipliers (Clearly marked as ESTIMATES for MVP)
export const ESTIMATE_FACTORS = {
  CO2_OFFSET_KG_PER_KG: 1.45,       // Est. 1.45 kg CO2e avoided per kg recycled material
  ENERGY_SAVED_KWH_PER_KG: 2.75,     // Est. 2.75 kWh energy conserved compared to virgin extraction
  LANDFILL_VOLUME_M3_PER_KG: 0.0035, // Est. cubic meters of landfill footprint diverted
};

export const impactService = {
  /**
   * Calculate verified circular impact metrics strictly from COMPLETED exchanges
   * @returns {Promise<{
   *   totalMaterialCirculatedKg: number,
   *   completedExchangeCount: number,
   *   materialDivertedKg: number,
   *   categoryBreakdown: Record<string, { quantity: number, count: number }>,
   *   estimates: {
   *     co2OffsetKg: number,
   *     energySavedKWh: number,
   *     landfillDivertedM3: number,
   *     disclaimer: string
   *   },
   *   error: string|null
   * }>}
   */
  async getImpactMetrics() {
    try {
      // 1. Query all COMPLETED listings
      const { data: completedListings, error: listError } = await supabase
        .from('listings')
        .select('id, material_type, quantity, unit, location, status, updated_at')
        .eq('status', 'COMPLETED');

      if (listError) {
        return {
          totalMaterialCirculatedKg: 0,
          completedExchangeCount: 0,
          materialDivertedKg: 0,
          categoryBreakdown: {},
          estimates: {
            co2OffsetKg: 0,
            energySavedKWh: 0,
            landfillDivertedM3: 0,
            disclaimer: 'Calculations are estimates for hackathon MVP modeling.',
          },
          error: listError.message,
        };
      }

      let totalKg = 0;
      const categoryBreakdown = {};

      for (const item of (completedListings || [])) {
        let qty = Number(item.quantity) || 0;
        // Normalize tons to kg for uniform aggregation if needed
        if (item.unit?.toLowerCase() === 'tons' || item.unit?.toLowerCase() === 'ton') {
          qty = qty * 1000;
        }

        totalKg += qty;

        const cat = item.material_type || 'Other';
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { quantity: 0, count: 0 };
        }
        categoryBreakdown[cat].quantity += qty;
        categoryBreakdown[cat].count += 1;
      }

      // Calculate configurable estimates
      const co2Offset = Number((totalKg * ESTIMATE_FACTORS.CO2_OFFSET_KG_PER_KG).toFixed(1));
      const energySaved = Number((totalKg * ESTIMATE_FACTORS.ENERGY_SAVED_KWH_PER_KG).toFixed(1));
      const landfillDiverted = Number((totalKg * ESTIMATE_FACTORS.LANDFILL_VOLUME_M3_PER_KG).toFixed(2));

      return {
        totalMaterialCirculatedKg: totalKg,
        completedExchangeCount: completedListings?.length || 0,
        materialDivertedKg: totalKg, // PRD: material diverted from disposal = completed exchange quantity
        categoryBreakdown,
        estimates: {
          co2OffsetKg: co2Offset,
          energySavedKWh: energySaved,
          landfillDivertedM3: landfillDiverted,
          disclaimer: 'ESTIMATE ONLY: Environmental savings are heuristic projections and not third-party certified.',
        },
        error: null,
      };
    } catch (err) {
      return {
        totalMaterialCirculatedKg: 0,
        completedExchangeCount: 0,
        materialDivertedKg: 0,
        categoryBreakdown: {},
        estimates: {
          co2OffsetKg: 0,
          energySavedKWh: 0,
          landfillDivertedM3: 0,
          disclaimer: '',
        },
        error: err.message || 'Failed to compute impact metrics.',
      };
    }
  },
};
