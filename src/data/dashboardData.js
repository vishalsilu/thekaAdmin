export const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦", active: true },
  { id: "inventory", label: "Inventory", icon: "▤" },
  { id: "orders", label: "Orders", icon: "◫" },
  { id: "customers", label: "Customers", icon: "◉" },
  { id: "analytics", label: "Analytics", icon: "◌" },
  { id: "marketing", label: "Marketing", icon: "⌁" }
];

export const statCards = [
  { label: "Total Revenue", value: "$124,592.00", trend: "+ 12.4%", trendUp: true },
  { label: "Total Orders", value: "1,284", trend: "+ 8.1%", trendUp: true },
  { label: "New Customers", value: "482", trend: "- 2.3%", trendUp: false },
  { label: "Conversion Rate", value: "4.2%", trend: "+ 3.5%", trendUp: true }
];

export const chartBars = [
  { day: "Mon", gross: 30, profit: 12 },
  { day: "Tue", gross: 26, profit: 16 },
  { day: "Wed", gross: 48, profit: 18 },
  { day: "Thu", gross: 31, profit: 14 },
  { day: "Fri", gross: 64, profit: 21 },
  { day: "Sat", gross: 19, profit: 9 },
  { day: "Sun", gross: 14, profit: 8 }
];

export const recentOrders = [
  { id: "#LX - 9284", customer: "Alexander James", email: "aj@example.com", date: "Oct 24, 2023", total: "$1,240.00", status: "Completed" },
  { id: "#LX - 9285", customer: "Sophia Wright", email: "sw@example.com", date: "Oct 23, 2023", total: "$840.50", status: "Processing" },
  { id: "#LX - 9286", customer: "Marcus Kane", email: "mk@example.com", date: "Oct 23, 2023", total: "$2,100.00", status: "Shipped" },
  { id: "#LX - 9287", customer: "Elena Laurent", email: "el@example.com", date: "Oct 22, 2023", total: "$435.00", status: "Canceled" }
];
