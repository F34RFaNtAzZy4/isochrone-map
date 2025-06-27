import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { address } = await request.json()
  const apiKey = process.env.GEOAPIFY_API_KEY

  if (!apiKey) {
    return NextResponse.json({ message: "API key not configured on server" }, { status: 500 })
  }

  if (!address) {
    return NextResponse.json({ message: "Address is required" }, { status: 400 })
  }

  try {
    const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      address as string,
    )}&filter=countrycode:at&bias=proximity:16.3738,48.2082&apiKey=${apiKey}`

    const response = await fetch(geoapifyUrl)

    // First, check if the request was successful
    if (!response.ok) {
      // If not, get the error text and return a proper error response
      const errorText = await response.text()
      console.error("Geoapify Geocode Error:", errorText)
      return NextResponse.json({ message: `Geocoding failed: ${response.statusText}` }, { status: response.status })
    }

    // Only parse JSON if the request was successful
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Geocode API route error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
