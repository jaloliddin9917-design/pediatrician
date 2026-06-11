import { useUnit } from 'effector-react'
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { RoleGuard } from '@/app/guards'
import { $session } from '@/entities/session/model'
import { DoctorLayout } from '@/widgets/doctor-layout'
import { ParentLayout } from '@/widgets/parent-layout'

const LoginPage = lazy(() => import('@/pages/auth/login'))
const RegisterPage = lazy(() => import('@/pages/auth/register'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))
const ParentHomePage = lazy(() => import('@/pages/parent/home'))
const ChatPage = lazy(() => import('@/pages/parent/chat'))
const DoctorsPage = lazy(() => import('@/pages/parent/doctors'))
const DoctorProfilePage = lazy(() => import('@/pages/parent/doctor-profile'))
const ChildrenPage = lazy(() => import('@/pages/parent/children'))
const HistoryPage = lazy(() => import('@/pages/parent/history'))
const VaccinesPage = lazy(() => import('@/pages/parent/vaccines'))
const QueuePage = lazy(() => import('@/pages/doctor/queue'))
const CaseDetailPage = lazy(() => import('@/pages/doctor/case-detail'))
const SchedulePage = lazy(() => import('@/pages/doctor/schedule'))

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
  {
    path: '/parent',
    element: (
      <RoleGuard role="parent">
        <ParentLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: s(<ParentHomePage />) },
      { path: 'chat', element: s(<ChatPage />) },
      { path: 'doctors', element: s(<DoctorsPage />) },
      { path: 'doctors/:id', element: s(<DoctorProfilePage />) },
      { path: 'children', element: s(<ChildrenPage />) },
      { path: 'history', element: s(<HistoryPage />) },
      { path: 'vaccines', element: s(<VaccinesPage />) },
    ],
  },
  {
    path: '/doctor',
    element: (
      <RoleGuard role="doctor">
        <DoctorLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: s(<QueuePage />) },
      { path: 'cases/:id', element: s(<CaseDetailPage />) },
      { path: 'schedule', element: s(<SchedulePage />) },
    ],
  },
  { path: '*', element: s(<NotFoundPage />) },
])
