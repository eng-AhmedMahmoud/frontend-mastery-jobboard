import { wait } from './latency'

export async function postApplication(jobId: string): Promise<{ jobId: string }> {
  await wait(700)
  return { jobId }
}
