export async function GET() {
  try {
    const response = await fetch(process.env.ODOO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            process.env.ODOO_DB,
            parseInt(process.env.ODOO_UID),
            process.env.ODOO_API_KEY,
            "crm.lead",
            "search_read",
            [[]],
            {
              fields: ["name", "create_date"]
            }
          ]
        }
      })
    });

    const data = await response.json();

    return Response.json(data.result);
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
