import { NextRequest, NextResponse } from 'next/server'
import { getAddressInfo, getPublicKey, req } from '@/lib/octra'

export async function POST(reqBody: NextRequest) {
  try {
    const {  priv, addr, recipient, amount, rpc } = await reqBody.json()

    if (!priv || !addr || !recipient || !amount || !rpc) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
    }

    // Step 1: Ambil public key dulu
    const pubkey = await getPublicKey(recipient, rpc)
    if (!pubkey) {
      return NextResponse.json({ success: false, error: 'Cannot get recipient public key' }, { status: 400 })
    }

    // Step 2: Cek info address
    const info = await getAddressInfo(recipient, rpc)
    if (!info || !info.has_public_key) {
      return NextResponse.json({ success: false, error: 'Recipient invalid or missing public key' }, { status: 400 })
    }

    // Step 3: Siapkan payload
    const sendData = {
      from: addr,
      to: recipient,
      amount: String(Math.floor(parseFloat(amount) * 1e6)),
      from_private_key: priv,
      to_public_key: pubkey,
    }

    const [status, text, json] = await req('POST', '/private_transfer', sendData, rpc)

    if (status === 200) {
      return NextResponse.json({ success: true, ...json })
    } else {
      return NextResponse.json({ success: false, error: json?.error || text })
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}
