import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { $session } from '@/entities/session/model'
import type { UserRole } from '@/shared/api'

export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const session = useUnit($session)
  if (!session) return <Navigate to="/auth/login" replace />
  if (session.role !== role) {
    return <Navigate to={session.role === 'doctor' ? '/doctor' : '/parent'} replace />
  }
  return <>{children}</>
}
