const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

exports.sendOrderEmail = async function sendOrderEmail(order, user) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[email] GMAIL_USER ou GMAIL_APP_PASSWORD não configurado — email não enviado');
    return;
  }

  const to = process.env.STORE_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) {
    console.warn('[email] STORE_EMAIL não configurado — email não enviado');
    return;
  }

  await transporter.sendMail({
    from: `"Boutique Arco-Íris" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🛍️ Novo Pedido #${order.orderId} — ${user.name}`,
    html: buildHTML(order, user),
  });
  console.log(`[email] Pedido #${order.orderId} enviado para ${to}`);
};

function buildHTML(order, user) {
  const shippingLabel = order.shippingMethod === 'sedex' ? 'SEDEX' : 'PAC';
  const paymentLabel  = order.paymentMethod  === 'pix'   ? 'PIX'   : 'Cartão';
  const addr          = order.address;
  const date          = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const itemsHTML = order.items.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5ddd5;font-size:14px;color:#2c2420">
        ${item.productName}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5ddd5;font-size:14px;color:#2c2420;text-align:center">
        ${item.size}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #e5ddd5;font-size:14px;color:#2c2420;text-align:center">
        ${item.quantity}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #e5ddd5;font-size:14px;color:#2c2420;text-align:right">
        R$ ${(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Helvetica Neue',Arial,sans-serif">

  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e5ddd5">

    <!-- Cabeçalho -->
    <div style="background:#2c2420;padding:28px 32px;text-align:center">
      <p style="margin:0;font-size:11px;letter-spacing:4px;color:#c4789a;text-transform:uppercase">
        Boutique
      </p>
      <h1 style="margin:4px 0 0;font-size:28px;color:#fff;font-weight:300;letter-spacing:2px">
        Arco-Íris
      </h1>
    </div>

    <!-- Faixa arco-íris -->
    <div style="height:4px;background:linear-gradient(to right,#E040FB,#FF6B35,#FFD23F,#4CAF50,#2196F3,#9C27B0)"></div>

    <!-- Título do pedido -->
    <div style="padding:28px 32px 0">
      <p style="margin:0;font-size:11px;letter-spacing:3px;color:#c4789a;text-transform:uppercase">
        Novo Pedido
      </p>
      <h2 style="margin:6px 0 0;font-size:22px;color:#2c2420;font-weight:400">
        Pedido #${order.orderId}
      </h2>
      <p style="margin:4px 0 0;font-size:13px;color:#8b7355">${date}</p>
    </div>

    <div style="padding:24px 32px">

      <!-- Dados do cliente -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td colspan="2" style="padding-bottom:10px">
            <span style="font-size:11px;letter-spacing:3px;color:#c4789a;text-transform:uppercase">
              Cliente
            </span>
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8b7355;padding:3px 0;width:100px">Nome</td>
          <td style="font-size:14px;color:#2c2420;padding:3px 0">${user.name}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8b7355;padding:3px 0">Email</td>
          <td style="font-size:14px;color:#2c2420;padding:3px 0">${user.email}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8b7355;padding:3px 0">CPF</td>
          <td style="font-size:14px;color:#2c2420;padding:3px 0">
            ${formatCPF(user.cpf)}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8b7355;padding:3px 0">Telefone</td>
          <td style="font-size:14px;color:#2c2420;padding:3px 0">${addr.phone}</td>
        </tr>
      </table>

      <!-- Itens do pedido -->
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;color:#c4789a;text-transform:uppercase">
        Itens
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="border-bottom:2px solid #2c2420">
            <th style="font-size:11px;letter-spacing:1px;color:#8b7355;text-transform:uppercase;font-weight:400;padding-bottom:8px;text-align:left">
              Produto
            </th>
            <th style="font-size:11px;letter-spacing:1px;color:#8b7355;text-transform:uppercase;font-weight:400;padding-bottom:8px;text-align:center">
              Tam.
            </th>
            <th style="font-size:11px;letter-spacing:1px;color:#8b7355;text-transform:uppercase;font-weight:400;padding-bottom:8px;text-align:center">
              Qtd.
            </th>
            <th style="font-size:11px;letter-spacing:1px;color:#8b7355;text-transform:uppercase;font-weight:400;padding-bottom:8px;text-align:right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <!-- Totais -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="font-size:13px;color:#8b7355;padding:4px 0">Subtotal</td>
          <td style="font-size:14px;color:#2c2420;padding:4px 0;text-align:right">
            R$ ${(order.total - order.shippingFee).toFixed(2).replace('.', ',')}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#8b7355;padding:4px 0">
            Frete (${shippingLabel})
          </td>
          <td style="font-size:14px;color:#2c2420;padding:4px 0;text-align:right">
            R$ ${order.shippingFee.toFixed(2).replace('.', ',')}
          </td>
        </tr>
        <tr style="border-top:2px solid #2c2420">
          <td style="font-size:15px;font-weight:600;color:#2c2420;padding:10px 0 4px">
            Total
          </td>
          <td style="font-size:16px;font-weight:600;color:#c4789a;padding:10px 0 4px;text-align:right">
            R$ ${order.total.toFixed(2).replace('.', ',')}
          </td>
        </tr>
      </table>

      <!-- Endereço de entrega -->
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;color:#c4789a;text-transform:uppercase">
        Endereço de Entrega
      </p>
      <div style="background:#faf8f5;border:1px solid #e5ddd5;padding:16px;margin-bottom:24px;font-size:14px;color:#2c2420;line-height:1.7">
        <strong>${addr.name}</strong><br>
        ${addr.street}${addr.complement ? ', ' + addr.complement : ''}<br>
        ${addr.district ? addr.district + ' — ' : ''}${addr.city}/${addr.state}<br>
        CEP: ${addr.zip}
      </div>

      <!-- Envio e Pagamento -->
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="width:50%;padding-right:12px;vertical-align:top">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#c4789a;text-transform:uppercase">
              Envio
            </p>
            <p style="margin:0;font-size:14px;color:#2c2420;font-weight:600">
              ${shippingLabel}
            </p>
          </td>
          <td style="width:50%;padding-left:12px;vertical-align:top">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#c4789a;text-transform:uppercase">
              Pagamento
            </p>
            <p style="margin:0;font-size:14px;color:#2c2420;font-weight:600">
              ${paymentLabel}
            </p>
          </td>
        </tr>
      </table>

    </div>

    <!-- Rodapé -->
    <div style="background:#f0ebe3;padding:20px 32px;text-align:center;border-top:1px solid #e5ddd5">
      <p style="margin:0;font-size:12px;color:#8b7355">
        Boutique Arco-Íris — Sistema de Pedidos
      </p>
    </div>

  </div>

</body>
</html>
  `;
}

function formatCPF(cpf) {
  if (!cpf || cpf.length !== 11) return cpf || '—';
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
