import { NextRequest, NextResponse } from 'next/server'
import nacl from 'tweetnacl'
import { encodeBase64, decodeBase64 } from 'tweetnacl-util'

export async function POST(req: NextRequest) {
  try {
    const { priv, addr, rpc } = await req.json()

    if (!priv || !addr || !rpc) {
      return NextResponse.json({ success: false, error: 'Missing priv, addr, or rpc' }, { status: 400 })
    }

    // Decode private key and derive public key
    const skBytes = decodeBase64(priv)
    const keyPair = nacl.sign.keyPair.fromSeed(skBytes.slice(0, 32))
    const pub = encodeBase64(keyPair.publicKey)

    console.log("pub " + pub);

    // Prepare header with X-Private-Key
    const headers = {
      'X-Private-Key': priv
    }

    // Perform the same request as in req_private()
    const res = await fetch(`${rpc}/view_encrypted_balance/${addr}`, { headers })
    const text = await res.text()

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${res.status}` }, { status: 500 })
    }

    const result = text.trim() ? JSON.parse(text) : {}

    const parseFloatOrZero = (val: any) =>
      typeof val === 'string' ? parseFloat(val.split?.(' ')[0] || '0') : 0

    return NextResponse.json({
      success: true,
      public: parseFloatOrZero(result.public_balance),
      public_raw: Number(result.public_balance_raw) || 0,
      encrypted: parseFloatOrZero(result.encrypted_balance),
      encrypted_raw: Number(result.encrypted_balance_raw) || 0,
      total: parseFloatOrZero(result.total_balance)
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
