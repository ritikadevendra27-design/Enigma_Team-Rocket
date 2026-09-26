export const factors = {
  'Plastic / PET': { points: 10, co2: 0.85 }, 'Paper / Cardboard': { points: 6, co2: 0.6 }, Glass: { points: 5, co2: 0.3 }, Metal: { points: 12, co2: 1.2 }, 'Textile / Cotton': { points: 8, co2: 1.5 }, 'Organic / Food Waste': { points: 4, co2: 0.4 }, 'Electronic Waste': { points: 9, co2: 0.9 }
}
export const categories = Object.keys(factors)
export const initialListings = [
  { id: 'pet-500', name: 'PET Bottles', category: 'Plastic / PET', quantity: 500, unit: 'kg', condition: 'Clean / Sorted', location: 'Navi Mumbai', date: 'Today', description: 'Baled, clean PET bottles collected from campus events. Ready for pickup.', owner: 'Green Future College', status: 'OPEN', image: '♻️', match: 92 },
  { id: 'cardboard-250', name: 'Cardboard Offcuts', category: 'Paper / Cardboard', quantity: 250, unit: 'kg', condition: 'Good', location: 'Mumbai', date: 'Yesterday', description: 'Flattened cartons and clean cardboard from a local warehouse.', owner: 'Urban Reuse Hub', status: 'OPEN', image: '📦', match: 87 },
  { id: 'glass-100', name: 'Glass Bottles', category: 'Glass', quantity: 100, unit: 'kg', condition: 'Sorted', location: 'Thane', date: '2 days ago', description: 'Mixed clear glass bottles, separated and boxed safely for pickup.', owner: 'Community Recycling Center', status: 'OPEN', image: '◉', match: 84 },
  { id: 'textile-80', name: 'Cotton Textile Waste', category: 'Textile / Cotton', quantity: 80, unit: 'kg', condition: 'Used', location: 'Mumbai', date: '3 days ago', description: 'Clean cotton offcuts suitable for reuse and textile recycling.', owner: 'Circular Mumbai', status: 'OPEN', image: '▧', match: 81 },
  { id: 'metal-300', name: 'Metal Scrap', category: 'Metal', quantity: 300, unit: 'kg', condition: 'Sorted', location: 'Navi Mumbai', date: '4 days ago', description: 'Sorted non-hazardous metal offcuts from fabrication.', owner: 'GreenLoop Industries', status: 'OPEN', image: '⬡', match: 79 },
  { id: 'organic-150', name: 'Organic Market Waste', category: 'Organic / Food Waste', quantity: 150, unit: 'kg', condition: 'Usable', location: 'Thane', date: '5 days ago', description: 'Separated fruit and vegetable scraps from a neighborhood market.', owner: 'CleanFuture Foundation', status: 'OPEN', image: '✳', match: 76 }
]
export const initialExchanges = [
  { id: 'ex-1', listingId: 'pet-500', material: 'PET Bottles', category: 'Plastic / PET', quantity: 500, unit: 'kg', partner: 'EcoCycle Recycler', location: 'Navi Mumbai', date: 'Sep 18, 2026', status: 'COMPLETED', points: 5000, co2: 425 },
  { id: 'ex-2', listingId: 'paper-demo', material: 'Paper Exchange', category: 'Paper / Cardboard', quantity: 200, unit: 'kg', partner: 'GreenLoop Industries', location: 'Mumbai', date: 'Sep 12, 2026', status: 'COMPLETED', points: 1200, co2: 120 },
  { id: 'ex-3', listingId: 'metal-demo', material: 'Metal Exchange', category: 'Metal', quantity: 200, unit: 'kg', partner: 'ReCircle Solutions', location: 'Thane', date: 'Sep 08, 2026', status: 'COMPLETED', points: 2400, co2: 240 },
  { id: 'ex-4', listingId: 'textile-demo', material: 'Textile Exchange', category: 'Textile / Cotton', quantity: 100, unit: 'kg', partner: 'Circular Mumbai', location: 'Mumbai', date: 'Sep 04, 2026', status: 'COMPLETED', points: 800, co2: 150 }
]
export const monthly = [
  { month: 'Apr', material: 280, co2: 190 }, { month: 'May', material: 360, co2: 245 }, { month: 'Jun', material: 410, co2: 280 }, { month: 'Jul', material: 330, co2: 225 }, { month: 'Aug', material: 520, co2: 355 }, { month: 'Sep', material: 580, co2: 390 }
]
export const categoryImpact = [{ name: 'Plastic', value: 38 }, { name: 'Paper', value: 24 }, { name: 'Metal', value: 17 }, { name: 'Glass', value: 12 }, { name: 'Textile', value: 9 }]
