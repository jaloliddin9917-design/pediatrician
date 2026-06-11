import { createEffect, createStore } from 'effector'
import { api, type VaccineDose } from '@/shared/api'

export const fetchVaccinesFx = createEffect(api.fetchVaccines)

export const $vaccines = createStore<VaccineDose[]>([]).on(fetchVaccinesFx.doneData, (_, list) => list)
export const $vaccinesLoaded = createStore(false).on(fetchVaccinesFx.done, () => true)
export const $vaccinesLoading = fetchVaccinesFx.pending
