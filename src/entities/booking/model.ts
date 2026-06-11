import { createEffect, createEvent, createStore } from 'effector'
import { api, type Booking } from '@/shared/api'

export const fetchBookingsFx = createEffect(api.fetchBookings)
export const bookingCreated = createEvent<Booking>()

export const $bookings = createStore<Booking[]>([])
  .on(fetchBookingsFx.doneData, (_, list) => list)
  .on(bookingCreated, (list, b) => [b, ...list])

export const $bookingsLoaded = createStore(false).on(fetchBookingsFx.done, () => true)
export const $bookingsLoading = fetchBookingsFx.pending
