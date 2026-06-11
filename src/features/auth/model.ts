import { createEffect, sample } from 'effector'
import { fakeRequest, type User, type UserRole } from '@/shared/api'
import { sessionSet } from '@/entities/session/model'

export interface Credentials {
  name?: string
  email: string
  role: UserRole
}

export const loginFx = createEffect(({ name, email, role }: Credentials) =>
  fakeRequest<User>({
    id: 'u1',
    name: name || (role === 'doctor' ? 'Dr. Aziza Karimova' : 'Dilnoza'),
    email,
    role,
  }),
)

sample({ clock: loginFx.doneData, target: sessionSet })
