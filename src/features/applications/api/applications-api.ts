import { postApplication } from '@/data/server/applications-server'

/** The client side of the applications endpoint. Becomes a server action in module 9. */
export const submitApplication = (jobId: string): Promise<{ jobId: string }> =>
  postApplication(jobId)
