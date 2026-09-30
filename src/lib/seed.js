import { seedOnce } from './storage'
import {
  seedBranches,
  seedCatalog,
  seedOffers,
  seedPaymentSettings,
  seedCreditPolicy,
  seedPatients,
  seedBills,
  seedCreditLedger,
  seedAuditLog,
  seedStaff,
} from '../data/seedData'

export function runSeed() {
  seedOnce('branches', seedBranches)
  seedOnce('catalog', seedCatalog)
  seedOnce('offers', seedOffers)
  seedOnce('paymentSettings', seedPaymentSettings)
  seedOnce('creditPolicy', seedCreditPolicy)
  seedOnce('patients', seedPatients)
  seedOnce('bills', seedBills)
  seedOnce('creditLedger', seedCreditLedger)
  seedOnce('auditLog', seedAuditLog)
  seedOnce('staff', seedStaff)
}
