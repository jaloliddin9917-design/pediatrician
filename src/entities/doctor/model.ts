import { createEffect, createStore } from 'effector'
import { api, type Doctor } from '@/shared/api'

export const fetchDoctorsFx = createEffect(api.fetchDoctors)

export const $doctors = createStore<Doctor[]>([]).on(fetchDoctorsFx.doneData, (_, list) => list)
export const $doctorsLoaded = createStore(false).on(fetchDoctorsFx.done, () => true)
export const $doctorsLoading = fetchDoctorsFx.pending
