export async function GET() {
  try {
    const url = process.env.ODOO_URL;

    // LOGIN
    const login = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "login",
          args: [
            process.env.ODOO_DB,
            process.env.ODOO_USER,
            process.env.ODOO_API_KEY
          ]
        }
      })
    });

    const loginData = await login.json();
    const uid = loginData.result;

    // LEADS
    const response = await fetch(url, {
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
            uid,
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

    // 🔥 LIMPIEZA
    const cleanData = data.result.map((lead) => ({
      name: lead.name,
      create_date: lead.create_date,
    }));

    return Response.json(cleanData);

  } catch (error) {
    return Response.json({ error: error.message });
  }
}
