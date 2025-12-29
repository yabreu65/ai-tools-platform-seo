
import posthog from 'posthog-node'

posthog.init(process.env.POSTHOG_KEY!, {
  host: process.env.POSTHOG_HOST || 'https://app.posthog.com'
})

export default posthog
