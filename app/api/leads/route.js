export async function GET() {
  try {
    const url = process.env.ODOO_URL;

    // 🔐 LOGIN
    const loginRes = await fetch(url, {
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

    const loginData = await loginRes.json();
    const uid = loginData.result;

    if (!uid) {
      return Response.json({ error: "Login fallido", detail: loginData });
    }

    // 🔍 1. SEARCH (solo IDs)
    const searchRes = await fetch(url, {
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
            "search",
            [[]],
            { limit: 50 }
          ]
        }
      })
    });

    const searchData = await searchRes.json();
    const ids = searchData.result;

    if (!ids || ids.length === 0) {
      return Response.json([]);
    }

    // 📊 2. READ (ya limpio)
    const readRes = await fetch(url, {
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
            "read",
            [ids],
            { fields: ["name", "create_date"] }
          ]
        }
      })
    });

    const readData = await readRes.json();

    // 🔥 LIMPIEZA FINAL SEGURA
    const cleanData = (readData.result || []).map((lead) => ({
      name: String(lead.name || ""),
      create_date: String(lead.create_date || "")
    }));

    return Response.json(cleanData);

  } catch (error) {
    return Response.json({
      error: "Error interno",
      detail: error.message
    });
  }
}
