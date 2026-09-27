import api from './axios'

export const ProgramsAPI = {
  list: () => api.get('/programs/'),
  get: (slug) => api.get(`/programs/${slug}/`),
}

export const TrainersAPI = {
  list: () => api.get('/trainers/'),
  get: (slug) => api.get(`/trainers/${slug}/`),
}

export const MembershipPlansAPI = {
  list: () => api.get('/membership-plans/'),
}

export const MembershipsAPI = {
  mine: () => api.get('/memberships/'),
}

export const ClassesAPI = {
  list: () => api.get('/classes/'),
}

export const ClassBookingsAPI = {
  mine: () => api.get('/class-bookings/'),
  create: (payload) => api.post('/class-bookings/', payload),
  cancel: (id) => api.post(`/class-bookings/${id}/cancel/`),
}

export const AppointmentsAPI = {
  mine: () => api.get('/appointments/'),
  create: (payload) => api.post('/appointments/', payload),
  cancel: (id) => api.post(`/appointments/${id}/cancel/`),
}

export const PaymentsAPI = {
  createOrder: (payload) => api.post('/payments/create_order/', payload),
  verify: (payload) => api.post('/payments/verify/', payload),
  mine: () => api.get('/payments/'),
}

export const TestimonialsAPI = {
  list: () => api.get('/testimonials/'),
}

export const ContactAPI = {
  send: (payload) => api.post('/contact/', payload),
}

export const AdminAPI = {
  stats: () => api.get('/admin/stats/'),
  members: () => api.get('/appointments/'),
}
