// Seed / illustrative data only — mirrors the scenario in the HMS functional
// overview deck. Loaded into localStorage once on first run (see src/lib/seed.js).

export const hospital = {
  name: 'Sai Siddhartha - Super Speciality Hospital',
  tagline: 'Healthcare operations, made transparent. Patient rewards, made easy.',
  system: 'HMS · Smart Hospital Management System',
  address: 'Ruby Block, Brundavan Colony, Kompally, Hyderabad, Secunderabad, Telangana 500100',
  phone: '083339 88244',
  email: 'info@saisiddharthahospital.in',
  gstin: '36ABCDE1234F1Z5',
}

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const ADMIN_ACCOUNTS = {
  superadmin: {
    email: 'super_admin@gmail.com',
    password: '123456',
    name: 'Dr. Srinivas Reddy',
    role: 'superadmin',
  },
  billing: {
    email: 'billing_admin@gmail.com',
    password: '123456',
    name: 'Swapna Rao',
    role: 'billing',
  },
}

// Single branch for now — Super Admin can add more from Branches & Settings later.
export const seedBranches = [
  { id: 'BR-1001', name: 'Kompally Branch', city: 'Hyderabad', staff: 38, status: 'Active' },
]

export const seedCatalog = [
  { id: 'ITM-1001', name: 'Paracetamol 500mg', type: 'Medicine', unit: 'Strip (10 tabs)', price: 28, creditRate: 5 },
  { id: 'ITM-1002', name: 'Amoxicillin 250mg', type: 'Medicine', unit: 'Box (30 tabs)', price: 165, creditRate: 5 },
  { id: 'ITM-1003', name: 'General Consultation', type: 'Service', unit: 'Visit', price: 300, creditRate: 10 },
  { id: 'ITM-1004', name: 'Complete Blood Count', type: 'Test', unit: 'Test', price: 250, creditRate: 5 },
  { id: 'ITM-1005', name: 'Ultrasound Abdomen', type: 'Scan', unit: 'Scan', price: 850, creditRate: 3 },
  { id: 'ITM-1006', name: 'Vitamin D3 60K', type: 'Medicine', unit: 'Strip (4 tabs)', price: 45, creditRate: 5 },
]

export const seedOffers = [
  {
    id: 'OFR-2001',
    title: 'Festive Health Checkup Bonus',
    description: 'Extra 5% credits on full-body checkup packages.',
    start: addDays(-10),
    end: addDays(20),
    status: 'Active',
  },
  {
    id: 'OFR-2002',
    title: 'Senior Citizen Consultation Offer',
    description: '10% flat credits on consultations for patients 60+.',
    start: addDays(-30),
    end: addDays(-1),
    status: 'Expired',
  },
]

export const seedPaymentSettings = {
  razorpay: {
    enabled: true,
    mode: 'test',
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_DEMOKEY123',
    label: 'Razorpay',
  },
  cashfree: {
    enabled: true,
    mode: 'test',
    appId: import.meta.env.VITE_CASHFREE_APP_ID || 'CF_TEST_DEMOAPP456',
    label: 'Cashfree',
  },
}

export const seedCreditPolicy = {
  earningModel: 'percentage',
  medicineRate: 5,
  serviceRate: 10,
  testRate: 5,
  scanRate: 3,
  validityDays: 30,
  minBillForCredit: 50,
  redemptionCap: 50,
  partialRedemption: true,
  updatedOn: addDays(-15),
  updatedBy: 'Dr. Srinivas Reddy',
}

export const seedPatients = [
  {
    id: 'PT-10231',
    name: 'Anitha Reddy',
    email: 'anitha.reddy@example.com',
    password: 'patient123',
    phone: '+91 98421 03345',
    dob: '1988-04-12',
    address: 'Kompally, Hyderabad',
    branchId: 'BR-1001',
    creditBalance: 66,
    joinedOn: addDays(-120),
  },
  {
    id: 'PT-10244',
    name: 'Suresh Goud',
    email: 'suresh.goud@example.com',
    password: 'patient123',
    phone: '+91 90031 88221',
    dob: '1979-11-02',
    address: 'Malkajgiri, Hyderabad',
    branchId: 'BR-1001',
    creditBalance: 140,
    joinedOn: addDays(-260),
  },
  {
    id: 'PT-10256',
    name: 'Kavya Sharma',
    email: 'kavya.sharma@example.com',
    password: 'patient123',
    phone: '+91 98765 44210',
    dob: '1995-07-23',
    address: 'Begumpet, Hyderabad',
    branchId: 'BR-1001',
    creditBalance: 25,
    joinedOn: addDays(-45),
  },
  {
    id: 'PT-10269',
    name: 'Ravi Teja',
    email: 'ravi.teja@example.com',
    password: 'patient123',
    phone: '+91 99422 10987',
    dob: '1990-01-30',
    address: 'Kukatpally, Hyderabad',
    branchId: 'BR-1001',
    creditBalance: 210,
    joinedOn: addDays(-400),
  },
  {
    id: 'PT-10277',
    name: 'Divya Rao',
    email: 'divya.rao@example.com',
    password: 'patient123',
    phone: '+91 96001 55678',
    dob: '1985-09-18',
    address: 'Ameerpet, Hyderabad',
    branchId: 'BR-1001',
    creditBalance: 0,
    joinedOn: addDays(-500),
  },
]

export const seedBills = [
  {
    id: 'INV-58231',
    patientId: 'PT-10231',
    branchId: 'BR-1001',
    date: addDays(-4),
    items: [
      { catalogId: 'ITM-1001', name: 'Paracetamol 500mg', qty: 1, unit: 'Strip', price: 28 },
      { catalogId: 'ITM-1003', name: 'General Consultation', qty: 1, unit: 'Visit', price: 300 },
    ],
    amount: 328,
    creditsEarned: 33,
    createdBy: 'Swapna Rao',
  },
  {
    id: 'INV-57110',
    patientId: 'PT-10231',
    branchId: 'BR-1001',
    date: addDays(-19),
    items: [{ catalogId: 'ITM-1004', name: 'Complete Blood Count', qty: 1, unit: 'Test', price: 250 }],
    amount: 250,
    creditsEarned: 13,
    createdBy: 'Swapna Rao',
  },
  {
    id: 'INV-56042',
    patientId: 'PT-10231',
    branchId: 'BR-1001',
    date: addDays(-38),
    items: [
      { catalogId: 'ITM-1002', name: 'Amoxicillin 250mg', qty: 1, unit: 'Box', price: 165 },
      { catalogId: 'ITM-1003', name: 'General Consultation', qty: 1, unit: 'Visit', price: 300 },
    ],
    amount: 465,
    creditsEarned: 47,
    createdBy: 'Swapna Rao',
  },
  {
    id: 'INV-58990',
    patientId: 'PT-10244',
    branchId: 'BR-1001',
    date: addDays(-3),
    items: [{ catalogId: 'ITM-1005', name: 'Ultrasound Abdomen', qty: 1, unit: 'Scan', price: 850 }],
    amount: 850,
    creditsEarned: 26,
    createdBy: 'Venkatesh Goud',
  },
]

export const seedCreditLedger = [
  { id: 'CR-1', patientId: 'PT-10231', date: addDays(-4), type: 'Earned', ref: 'INV-58231', amount: 33, expiry: addDays(26) },
  { id: 'CR-2', patientId: 'PT-10231', date: addDays(-7), type: 'Redeemed', ref: 'INV-57980', amount: -20, expiry: null },
  { id: 'CR-3', patientId: 'PT-10231', date: addDays(-19), type: 'Earned', ref: 'INV-57110', amount: 13, expiry: addDays(11) },
  { id: 'CR-4', patientId: 'PT-10231', date: addDays(-38), type: 'Earned', ref: 'INV-56042', amount: 47, expiry: addDays(-8) },
  { id: 'CR-5', patientId: 'PT-10231', date: addDays(-38), type: 'Expired', ref: 'Lot #4021', amount: -47, expiry: null },
  { id: 'CR-6', patientId: 'PT-10244', date: addDays(-3), type: 'Earned', ref: 'INV-58990', amount: 26, expiry: addDays(27) },
  { id: 'CR-7', patientId: 'PT-10244', date: addDays(-30), type: 'Earned', ref: 'INV-55210', amount: 114, expiry: addDays(0) },
  { id: 'CR-8', patientId: 'PT-10256', date: addDays(-45), type: 'Earned', ref: 'INV-54980', amount: 25, expiry: addDays(1) },
  { id: 'CR-9', patientId: 'PT-10269', date: addDays(-40), type: 'Earned', ref: 'INV-54100', amount: 210, expiry: addDays(14) },
]

export const seedAuditLog = [
  { id: 'AUD-1', actor: 'Billing Admin · Swapna Rao', action: 'Applied 20 credits on INV-57980', time: addDays(-7) },
  { id: 'AUD-2', actor: 'Super Admin · Dr. Srinivas Reddy', action: 'Updated credit earning rule to 5% (Medicines)', time: addDays(-15) },
  { id: 'AUD-3', actor: 'Billing Admin · Venkatesh Goud', action: 'Cancelled bill INV-56980 (duplicate entry)', time: addDays(-21) },
  { id: 'AUD-4', actor: 'Super Admin · Dr. Srinivas Reddy', action: 'Updated hospital profile and operating details', time: addDays(-60) },
]

export const seedStaff = [
  { id: 'STF-1', name: 'Swapna Rao', email: 'billing_admin@gmail.com', role: 'Billing Admin', branchId: 'BR-1001', status: 'Active' },
  { id: 'STF-2', name: 'Venkatesh Goud', email: 'venkatesh.goud@saisiddharthahospital.in', role: 'Billing Admin', branchId: 'BR-1001', status: 'Active' },
  { id: 'STF-3', name: 'Dr. Srinivas Reddy', email: 'super_admin@gmail.com', role: 'Super Admin', branchId: 'BR-1001', status: 'Active' },
]
