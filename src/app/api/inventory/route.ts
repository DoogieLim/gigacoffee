import { NextResponse } from "next/server"
import { inventoryRepo } from "@/lib/db"

export async function GET() {
  try {
    const data = await inventoryRepo.findAll()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
