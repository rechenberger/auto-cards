import { createTeampilotClient } from '@teampilot/sdk'

export const launchpads = createTeampilotClient({
  default: {
    launchpadSlugId: process.env.TEAMPILOT_DEFAULT_LAUNCHPAD_SLUG_ID!,
  },
})
