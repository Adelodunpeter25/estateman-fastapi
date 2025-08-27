import { createContext, useContext, useMemo, useState } from 'react'
import { recalcFutureInstallments, type Installment } from '@/lib/finance'

export type PropertyItem = {
  id: string
  address: string
  city: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: string
  type: string
  agent: string
  daysListed: number
  images: string[]
  coordinates?: { lat: number; lng: number }
}

export type PaymentPlan = {
  id: string
  clientName: string
  propertyId: string
  propertyAddress: string
  propertyType: string
  propertyDetails: Record<string, any>
  amount: number
  paidAmount: number
  installments: Installment[]
  realtorCommission: number
  commissionPaid: number
  status: 'active' | 'completed' | 'overdue'
}

type AppStore = {
  properties: PropertyItem[]
  payments: PaymentPlan[]
  updatePropertyPrice: (propertyId: string, newPrice: number) => void
}

const AppStoreContext = createContext<AppStore | null>(null)

const initialProperties: PropertyItem[] = [
  {
    id: '1',
    address: '123 Oak Street',
    city: 'Downtown',
    price: 450000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    status: 'Active',
    type: 'Single Family',
    agent: 'Sarah Wilson',
    daysListed: 15,
    images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop'
    ],
    coordinates: { lat: 40.7128, lng: -74.006 }
  },
  {
    id: '2',
    address: '456 Pine Avenue',
    city: 'Suburbs',
    price: 320000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    status: 'Pending',
    type: 'Condo',
    agent: 'Mike Chen',
    daysListed: 8,
    images: [
      'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop'
    ],
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: '3',
    address: '789 Maple Drive',
    city: 'Uptown',
    price: 580000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    status: 'Sold',
    type: 'Single Family',
    agent: 'Emily Rodriguez',
    daysListed: 22,
    images: [
      'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop'
    ],
    coordinates: { lat: 40.7831, lng: -73.9712 }
  }
]

const initialPayments: PaymentPlan[] = [
  {
    id: 'PAY-001',
    clientName: 'Jennifer Martinez',
    propertyId: '1',
    propertyAddress: '123 Oak Street, Downtown',
    propertyType: 'Single Family',
    propertyDetails: { bedrooms: 3, bathrooms: 2, sqft: 1850, yearBuilt: 2019, images: initialProperties[0].images },
    amount: 450000,
    paidAmount: 170000,
    installments: [
      { amount: 170000, dueDate: '2024-01-15', status: 'paid', paidDate: '2024-01-10' },
      { amount: 70000, dueDate: '2024-04-15', status: 'upcoming', paidDate: null },
      { amount: 70000, dueDate: '2024-07-15', status: 'upcoming', paidDate: null },
      { amount: 70000, dueDate: '2024-10-15', status: 'upcoming', paidDate: null },
      { amount: 70000, dueDate: '2025-01-15', status: 'upcoming', paidDate: null }
    ],
    realtorCommission: 22500,
    commissionPaid: 8500,
    status: 'active'
  },
  {
    id: 'PAY-002',
    clientName: 'Robert Chen',
    propertyId: '2',
    propertyAddress: '456 Pine Avenue, Suburban Hills',
    propertyType: 'Condo',
    propertyDetails: { bedrooms: 2, bathrooms: 2, sqft: 1200, yearBuilt: 2015, images: initialProperties[1].images },
    amount: 320000,
    paidAmount: 320000,
    installments: [
      { amount: 64000, dueDate: '2023-11-01', status: 'paid', paidDate: '2023-10-28' },
      { amount: 64000, dueDate: '2024-02-01', status: 'paid', paidDate: '2024-01-29' },
      { amount: 64000, dueDate: '2024-05-01', status: 'paid', paidDate: '2024-04-28' },
      { amount: 64000, dueDate: '2024-08-01', status: 'paid', paidDate: '2024-07-30' },
      { amount: 64000, dueDate: '2024-11-01', status: 'paid', paidDate: '2024-10-29' }
    ],
    realtorCommission: 16000,
    commissionPaid: 16000,
    status: 'completed'
  },
  {
    id: 'PAY-003',
    clientName: 'Michael Thompson',
    propertyId: '3',
    propertyAddress: '789 Maple Drive, Waterfront',
    propertyType: 'Single Family',
    propertyDetails: { bedrooms: 4, bathrooms: 3, sqft: 2400, yearBuilt: 2020, images: initialProperties[2].images },
    amount: 580000,
    paidAmount: 240000,
    installments: [
      { amount: 120000, dueDate: '2024-01-01', status: 'paid', paidDate: '2023-12-28' },
      { amount: 85000, dueDate: '2024-07-01', status: 'overdue', paidDate: null },
      { amount: 85000, dueDate: '2025-01-01', status: 'upcoming', paidDate: null },
      { amount: 85000, dueDate: '2025-07-01', status: 'upcoming', paidDate: null },
      { amount: 85000, dueDate: '2026-01-01', status: 'upcoming', paidDate: null }
    ],
    realtorCommission: 29000,
    commissionPaid: 12000,
    status: 'overdue'
  }
]

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<PropertyItem[]>(initialProperties)
  const [payments, setPayments] = useState<PaymentPlan[]>(initialPayments)

  const updatePropertyPrice = (propertyId: string, newPrice: number) => {
    setProperties(prev => prev.map(p => (p.id === propertyId ? { ...p, price: newPrice } : p)))
    setPayments(prev => prev.map(plan => {
      if (plan.propertyId !== propertyId) return plan
      const updatedInstallments = recalcFutureInstallments(plan.installments, newPrice, plan.paidAmount)
      return { ...plan, amount: newPrice, installments: updatedInstallments }
    }))
  }

  const value = useMemo(() => ({ properties, payments, updatePropertyPrice }), [properties, payments])
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
