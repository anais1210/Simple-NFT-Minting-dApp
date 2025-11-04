import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import fetch from "node-fetch";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = new FormData();
    data.append("file", buffer, "nft.jpeg");
    data.append("groupId", process.env.PINATA_GROUP_ID!);

    const imgRes = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });

    const imgResult = await imgRes.json();
    console.log("Image upload result:", imgResult);

    const metadata = {
      pinataContent: {
        name,
        description,
        image: `ipfs://${imgResult.data.cid}`,
      },
      pinataMetadata: { name: "metadata.json" },
      groupId: process.env.PINATA_GROUP_ID!,
    };

    const metaRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      }
    );

    const metaResult = await metaRes.json();

    return NextResponse.json({
      imageCid: imgResult.data.cid,
      metadataCid: metaResult.IpfsHash,
    });
  } catch (err) {
    console.error("Server upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
