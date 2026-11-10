import { NextResponse } from "next/server";
import { getMembershipMetadata } from "@/lib/chain/read";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;
  if (!/^\d+$/.test(tokenId)) {
    return NextResponse.json({ error: "Invalid token id" }, { status: 400 });
  }

  try {
    const uri = await getMembershipMetadata(tokenId);
    const payload = uri.split(",")[1];
    if (!payload) throw new Error("UNSUPPORTED_METADATA");
    const metadata = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return NextResponse.json(metadata, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Membership metadata is unavailable while the local chain is offline." },
      { status: 503 }
    );
  }
}
