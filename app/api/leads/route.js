export async function GET() {
  try {
    const url = process.env.ODOO_URL;

    // 🔐 LOGIN (obtener UID automáticamente)
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

    if (!loginData.result) {
      return Response.json({
        error: "Error de login en Odoo",
        detail: loginData
      });
    }

    const uid = loginData.result;

    // 📊 CONSULTA LEADS
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
              fields: ["name", "create_date"],
              limit: 50
            }
          ]
        }
      })
    });

    const data = await response.json();

    // 🔍 Si Odoo devuelve error, lo mostramos
    if (data.error) {
      return Response.json({
        error: "Error desde Odoo",
        detail: data.error
      });
    }

    // 🔥 LIMPIEZA SEGURA (evita error JSON serializable)
    const cleanData = (data.result || []).map((lead) => ({
      name: lead.name ? String(lead.name) : "",
      create_date: lead.create_date ? String(lead.create_date) : ""
    }));

    return Response.json(cleanData);

  } catch (error) {
    return Response.json({
      error: "Error interno",
      detail: error.message
    });
  }
}
