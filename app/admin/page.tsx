import { Suspense } from 'react'
import { AdminPage } from './admin-client'

export default function Page() {
  return (
    <Suspense>
      <AdminPage />
    </Suspense>
  )
}
