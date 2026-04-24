export async function GET() {
  try {
    const baseUrl = process.env.ODOO_URL;

    // 🔐 LOGIN (web/session/authenticate)
    const loginRes = await fetch(`${baseUrl}/web/session/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        params: {
          db: process.env.ODOO_DB,
          login: process.env.ODOO_USER,
          password: process.env.ODOO_API_KEY
        }
      })
    });

    const loginData = await loginRes.json();

    if (!loginData.result || !loginData.result.uid) {
      return Response.json({
        error: "Login fallido",
        detail: loginData
      });
    }

    const uid = loginData.result.uid;

    // 📦 CONSULTA PRODUCTOS
    const dataRes = await fetch(`${baseUrl}/web/dataset/call_kw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": loginRes.headers.get("set-cookie") || ""
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        params: {
          model: "product.product",
          method: "search_read",
          args: [[]],
          kwargs: {
            fields: ["name", "list_price"],
            limit: 20
          }
        }
      })
    });

    const data = await dataRes.json();

    const cleanData = (data.result || []).map((prod) => ({
      name: String(prod.name || ""),
      price: Number(prod.list_price || 0)
    }));

    return Response.json(cleanData);

  } catch (error) {
    return Response.json({
      error: "Error interno",
      detail: error.message
    });
  }
}
