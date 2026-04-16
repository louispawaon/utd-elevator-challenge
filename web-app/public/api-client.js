
async function parseResponse(res) {
  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = {}
    }
  }
  if (!res.ok) {
    const msg = data.error || res.statusText || 'Request failed'
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return data
}

export async function getRequests() {
  const res = await fetch('/api/requests')
  return parseResponse(res)
}

export async function getRiders() {
  const res = await fetch('/api/riders')
  return parseResponse(res)
}


export async function createRequest(body) {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse(res)
}

export async function clearAllRequests() {
  const res = await fetch('/api/requests', { method: 'DELETE' })
  return parseResponse(res)
}


export async function simulate(body) {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse(res)
}

export async function resetAll() {
  const res = await fetch('/api/reset', { method: 'POST' })
  return parseResponse(res)
}
