
import type { OllamaRequest } from './types'

export async function llamarOllama({ prompt, model = 'llama3' }: OllamaRequest): Promise<string> {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  })
  const data = await res.json()
  return data.response
}
