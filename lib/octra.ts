export async function req(
  method: 'GET' | 'POST',
  path: string,
  data?: any,
  rpcUrl: string = 'https://octra.network'
): Promise<[number, string, any]> {
  try {
    const url = `${rpcUrl}${path}`

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (method === 'POST' && data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    const text = await response.text()

    let json: any = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = null
    }

    return [response.status, text, json]
  } catch (err: any) {
    return [500, err.message, null]
  }
}

export async function getAddressInfo(
  address: string,
  rpcUrl: string = 'https://octra.network'
): Promise<any | null> {
  const [status, , json] = await req('GET', `/address/${address}`, undefined, rpcUrl)
  if (status === 200 && json) {
    return json
  }
  return null
}

export async function getPublicKey(
  address: string,
  rpcUrl: string = 'https://octra.network'
): Promise<string | null> {
  const [status, , json] = await req('GET', `/public_key/${address}`, undefined, rpcUrl)
  if (status === 200 && json?.public_key) {
    return json.public_key
  }
  return null
}
