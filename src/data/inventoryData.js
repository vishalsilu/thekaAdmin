/** @typedef {'high' | 'low' | 'out'} StockLevel */

/**
 * @type {Array<{
 *   id: string,
 *   image: string,
 *   name: string,
 *   subtitle: string,
 *   sku: string,
 *   category: string,
 *   stock: number,
 *   stockLevel: StockLevel,
 *   price: number,
 *   status: 'ACTIVE' | 'DRAFT'
 * }>}
 */
export const inventoryProducts = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=120&h=120&fit=crop",
    name: "Classic Wool Coat",
    subtitle: "Camel / Regular Fit",
    sku: "CW-8821",
    category: "Outerwear",
    stock: 42,
    stockLevel: "high",
    price: 450,
    status: "ACTIVE"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&h=120&fit=crop",
    name: "Silk Evening Dress",
    subtitle: "Midnight / Slim Fit",
    sku: "SE-4410",
    category: "Formal",
    stock: 12,
    stockLevel: "low",
    price: 890,
    status: "ACTIVE"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=120&h=120&fit=crop",
    name: "Merino Crewneck",
    subtitle: "Charcoal / Relaxed",
    sku: "MC-2201",
    category: "Essentials",
    stock: 0,
    stockLevel: "out",
    price: 120,
    status: "DRAFT"
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&h=120&fit=crop",
    name: "Leather Oxford Shoes",
    subtitle: "Brown / UK 9",
    sku: "LO-9920",
    category: "Footwear",
    stock: 8,
    stockLevel: "low",
    price: 320,
    status: "ACTIVE"
  }
];

export const totalInventoryResults = 124;
export const pageSize = 4;
