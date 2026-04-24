export async function GET() {
  try {
    const res = await fetch("http://34.63.64.120/api.php");

    const data = await res.json();

    return Response.json(data);

  } catch (error) {
    return Response.json({
      error: "Error conectando con VM",
      detail: error.message
    });
  }
}
