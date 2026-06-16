export const collectionsSeed = [
  {
    id: "col-001",
    name: "Winter Minimalism 2024",
    productCount: 24,
    parentCategory: "Outerwear",
    featured: true,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=120&h=120&fit=crop"
  },
  {
    id: "col-002",
    name: "Essential Silk Line",
    productCount: 12,
    parentCategory: "Essentials",
    featured: false,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&h=120&fit=crop"
  },
  {
    id: "col-003",
    name: "Urban Nomad Series",
    productCount: 18,
    parentCategory: "Accessories",
    featured: true,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&h=120&fit=crop"
  },
  {
    id: "col-004",
    name: "Sculptural Knits",
    productCount: 9,
    parentCategory: "Knitwear",
    featured: false,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=120&h=120&fit=crop"
  }
];

export const categoriesSeed = [
  {
    id: "cat-001",
    name: "Outerwear",
    parentCollection: "Winter Essentials",
    slug: "/shop/outerwear",
    active: true,
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=120&h=120&fit=crop"
  },
  {
    id: "cat-002",
    name: "Denim",
    parentCollection: "Core Collection",
    slug: "/shop/denim",
    active: true,
    image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=120&h=120&fit=crop"
  },
  {
    id: "cat-003",
    name: "Knitwear",
    parentCollection: "Winter Essentials",
    slug: "/shop/knitwear",
    active: false,
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=120&h=120&fit=crop"
  },
  {
    id: "cat-004",
    name: "Accessories",
    parentCollection: "Core Collection",
    slug: "/shop/accessories",
    active: true,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=120&h=120&fit=crop"
  }
];
