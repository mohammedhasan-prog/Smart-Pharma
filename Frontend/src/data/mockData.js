export const dashboardData = {
  hero: {
    totalStock: '14,285',
    units: 'units',
    valuation: '$1.2M',
    categories: '124',
  },
  criticalAlerts: [
    { medicine: 'Amoxicillin 500mg', expiry: '12 Days', stock: '140 units' },
    { medicine: 'Epinephrine Auto', expiry: '28 Days', stock: '12 units' },
  ],
  expiryWatch: [
    { initials: 'LP', medicine: 'Lisinopril 10mg', lot: 'Lot #88492', days: '60 Days', stock: '300 units' },
    { initials: 'MT', medicine: 'Metformin 850mg', lot: 'Lot #11204', days: '75 Days', stock: '1,200 units' },
    { initials: 'AT', medicine: 'Atorvastatin 20mg', lot: 'Lot #44921', days: '88 Days', stock: '450 units' },
  ],
  recentDispenses: [
    { medicine: 'Ibuprofen 400mg', quantity: 30, time: '10:42 AM' },
    { medicine: 'Levothyroxine 50mcg', quantity: 90, time: '10:15 AM' },
    { medicine: 'Omeprazole 20mg', quantity: 60, time: '09:58 AM' },
    { medicine: 'Sertraline 50mg', quantity: 30, time: '09:30 AM' },
  ],
}

export const inventoryData = {
  stats: [
    {
      title: 'Total Items',
      value: '1,248',
      subtitle: '+12 added this week',
      icon: 'medication',
      accent: 'primary',
    },
    {
      title: 'Critical Expiry (< 30 Days)',
      value: '14',
      subtitle: 'Requires immediate attention',
      icon: 'warning',
      accent: 'error',
    },
    {
      title: 'Low Stock Alerts',
      value: '27',
      subtitle: 'Items below reorder level',
      icon: 'trending_down',
      accent: 'tertiary',
    },
  ],
  medicines: [
    {
      name: 'Amoxicillin 500mg',
      format: 'Capsule • Box of 30',
      salt: 'Amoxicillin Trihydrate',
      stockQty: 450,
      reorderLevel: 100,
      expiryDate: 'Oct 2025',
      expiryStatus: 'safe',
    },
    {
      name: 'Lisinopril 10mg',
      format: 'Tablet • Bottle of 90',
      salt: 'Lisinopril',
      stockQty: 120,
      reorderLevel: 50,
      expiryDate: 'Nov 12, 2023',
      expiryStatus: 'critical',
    },
    {
      name: 'Atorvastatin 20mg',
      format: 'Tablet • Box of 30',
      salt: 'Atorvastatin Calcium',
      stockQty: 45,
      reorderLevel: 100,
      expiryDate: 'Jan 2024',
      expiryStatus: 'warning',
    },
    {
      name: 'Metformin 500mg',
      format: 'Tablet • Bottle of 100',
      salt: 'Metformin Hydrochloride',
      stockQty: 850,
      reorderLevel: 200,
      expiryDate: 'Mar 2026',
      expiryStatus: 'safe',
    },
  ],
}

export const wholesalerOrdersData = {
  metrics: [
    {
      title: 'Pending Clearance',
      value: '12',
      subtitle: 'Orders requiring authorization',
      icon: 'pending_actions',
      accent: 'primary',
    },
    {
      title: 'Accepted Today',
      value: '45',
      subtitle: 'Currently in fulfillment',
      icon: 'task_alt',
      accent: 'secondary',
    },
    {
      title: 'Priority Fulfillment',
      value: '3',
      subtitle: 'Critical hospital orders',
      icon: 'local_shipping',
      accent: 'hero',
    },
  ],
  orders: [
    {
      id: 'ORD-8832-X',
      date: 'Oct 24, 08:30 AM',
      pharmacist: 'Dr. Elena Rostova',
      location: 'Central General Hospital',
      initials: 'EJ',
      medicine: 'Epinephrine Auto-Injector 0.3mg',
      quantity: '50 units',
      lot: 'L-9982',
      priority: 'Critical',
      status: 'Pending Wholesaler Review',
      critical: true,
    },
    {
      id: 'ORD-8833-Y',
      date: 'Oct 24, 09:15 AM',
      pharmacist: 'Marcus Sterling',
      location: 'Valley Community Pharmacy',
      initials: 'MS',
      medicine: 'Amoxicillin 500mg Capsules',
      quantity: '200 boxes',
      lot: 'L-7451',
      priority: 'Standard',
      status: 'Pending Wholesaler Review',
      critical: false,
    },
    {
      id: 'ORD-8834-Z',
      date: 'Oct 24, 10:45 AM',
      pharmacist: 'Dr. Lin Chen',
      location: 'Northside Clinic Dispensary',
      initials: 'LC',
      medicine: 'Lisinopril 10mg Tablets',
      quantity: '150 bottles',
      lot: 'L-1029',
      priority: 'Standard',
      status: 'Pending Wholesaler Review',
      critical: false,
    },
  ],
}

export const pointOfSaleData = {
  medicineChips: [
    { name: 'Amoxicillin 500mg', ndc: '0093-3109-01', stock: 142 },
    { name: 'Lisinopril 10mg', ndc: '0185-0030-01', stock: 89 },
    { name: 'Metformin 850mg', ndc: '57664-378-18', stock: 215 },
  ],
  cart: [
    {
      name: 'Amoxicillin 500mg',
      format: 'Capsule, Oral',
      stockLabel: 'Stock: 142',
      quantity: 30,
      unitPrice: '$0.45',
      total: '$13.50',
    },
    {
      name: 'Ibuprofen 800mg',
      format: 'Tablet, Film Coated',
      stockLabel: 'Stock: 15 (Low)',
      quantity: 60,
      unitPrice: '$0.12',
      total: '$7.20',
    },
  ],
  patient: {
    initials: 'JD',
    name: 'John Doe',
    dob: '11/04/1982',
    insurance: 'BlueCross PPO',
  },
  summary: {
    subtotal: '$20.70',
    coverage: '-$15.00',
    tax: '$0.00',
    totalDue: '$5.70',
  },
}
