
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/login', '/api/public'],
  ignoredRoutes: ['/api/webhooks/stripe']
})
