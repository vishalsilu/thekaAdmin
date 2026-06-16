export const orderStats = [
  { label: "Total Orders", value: "1,284", delta: "+12%" },
  { label: "Pending Fulfillment", value: "42" },
  { label: "Revenue (30D)", value: "$48,290" },
  { label: "Avg. Order Value", value: "$114.50" }
];

export const ordersList = [
  { id: "LX-9031", customer: "Julianne Deville", date: "Oct 24, 2023", fulfillment: "Processing", payment: "Paid", total: "$342.00" },
  { id: "LX-9030", customer: "Marcus Knight", date: "Oct 24, 2023", fulfillment: "Shipped", payment: "Paid", total: "$1,120.50" },
  { id: "LX-9029", customer: "Elena Brooks", date: "Oct 23, 2023", fulfillment: "Pending", payment: "Pending", total: "$89.00" },
  { id: "LX-9028", customer: "Soren Reed", date: "Oct 23, 2023", fulfillment: "Delivered", payment: "Paid", total: "$210.00" },
  { id: "LX-9027", customer: "Lydia Walsh", date: "Oct 22, 2023", fulfillment: "Canceled", payment: "Refunded", total: "$45.00" }
];

export const sampleOrder = {
  id: "ORD-9042",
  customer: "Julian Vance",
  email: "julian.vance@example.com",
  phone: "+44 20 7946 0101",
  address: "42 Berkley Square\nMayfair, London W1J 5AW\nUnited Kingdom",
  status: "Shipped",
  items: [
    { id: "1", name: "Essential Cashmere Overcoat", meta: "Size: 42 | Color: Slate Gray", qty: 1, price: 1250, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=160&h=160&fit=crop" },
    { id: "2", name: "Architect's Bifold Wallet", meta: "Material: Full-grain Calfskin", qty: 1, price: 295, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=160&h=160&fit=crop" }
  ],
  timeline: [
    { title: "Out for delivery", when: "Nov 27, 2023 - 09:12 AM", note: "Package has reached the local distribution center in London, UK." },
    { title: "In transit", when: "Nov 26, 2023 - 4:30 PM", note: "Departed from international sorting facility." },
    { title: "Order shipped", when: "Nov 25, 2023 - 10:00 AM", note: "Tracking information generated and courier notified." }
  ]
};
