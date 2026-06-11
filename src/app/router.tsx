import { useUnit } from 'effector-react'
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { $session } from '@/entities/session/model'

const LoginPage = lazy(() => import('@/pages/auth/login'))
const RegisterPage = lazy(() => import('@/pages/auth/register'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

function IndexRedirect() {
  const session = useUnit($session)
  if (!session) return <Navigate to="/auth/login" replace />
  return <Navigate to={session.role === 'doctor' ? '/doctor' : '/parent'} replace />
}

const s = (node: ReactNode) => <Suspense fallback={null}>{node}</Suspense>

export const router = createBrowserRouter([
  { path: '/', element: <IndexRedirect /> },
  { path: '/auth/login', element: s(<LoginPage />) },
  { path: '/auth/register', element: s(<RegisterPage />) },
  { path: '*', element: s(<NotFoundPage />) },
])
