import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const WHATSAPP_URL = 'https://wa.me/5538999223190?text=Ol%C3%A1%21+Quero+solicitar+uma+troca+ou+devolu%C3%A7%C3%A3o.';
const EMAIL = 'boutiquearcoiris2020@gmail.com';

export default function TrocasPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <p className="page-eyebrow">Legal</p>
        <h1 className="page-title mb-2">Trocas e Devoluções</h1>
        <p className="font-body text-xs font-light text-muted mb-12">
          Seus direitos conforme o Código de Defesa do Consumidor (Lei nº 8.078/1990)
        </p>

        <div className="space-y-10 font-body font-light text-sm leading-relaxed text-muted">

          <section className="border border-gold/30 bg-gold/5 p-6">
            <h2 className="font-display text-lg font-light text-cream mb-3">
              Direito de Arrependimento — 7 dias
            </h2>
            <p>
              Conforme o <strong className="text-cream font-normal">Art. 49 do CDC</strong>, você tem até{' '}
              <strong className="text-cream font-normal">7 dias corridos</strong> contados a partir do
              recebimento do produto para desistir da compra, sem necessidade de justificativa e sem
              qualquer custo. O frete de devolução é pago pela Boutique Arco-Íris.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">Como solicitar</h2>
            <p className="mb-4">Entre em contato pelos canais abaixo dentro do prazo aplicável:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-6 py-3 text-center"
              >
                WhatsApp (38) 99922-3190
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="btn-outline px-6 py-3 text-center"
              >
                {EMAIL}
              </a>
            </div>
            <p className="mt-4 text-xs">
              Atendimento: Seg–Sex 8h–18h | Sáb 8h–14h. Respondemos em até 1 dia útil.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">Prazos por motivo</h2>
            <div className="space-y-4">
              <div className="border-l-2 border-gold/40 pl-4">
                <h3 className="text-cream font-normal mb-1">Arrependimento (desistência sem motivo)</h3>
                <p>Até <strong className="text-cream font-normal">7 dias corridos</strong> após o recebimento. CDC, Art. 49.</p>
              </div>
              <div className="border-l-2 border-gold/40 pl-4">
                <h3 className="text-cream font-normal mb-1">Defeito — produtos não duráveis (roupas, acessórios)</h3>
                <p>Até <strong className="text-cream font-normal">30 dias</strong> após o recebimento. CDC, Art. 26, I.</p>
              </div>
              <div className="border-l-2 border-gold/40 pl-4">
                <h3 className="text-cream font-normal mb-1">Defeito — produtos duráveis</h3>
                <p>Até <strong className="text-cream font-normal">90 dias</strong> após o recebimento. CDC, Art. 26, II.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">Condições para troca ou devolução</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Produto sem sinais de uso (para arrependimento)</li>
              <li>Etiquetas originais preservadas</li>
              <li>Embalagem original ou equivalente adequada para transporte</li>
              <li>Nota Fiscal ou número do pedido informado</li>
            </ul>
            <p className="mt-3">
              Em caso de <strong className="text-cream font-normal">defeito de fabricação</strong>, aceitamos
              o produto mesmo que tenha sido usado, desde que o defeito seja comprovado.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">Frete de devolução</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <p className="text-cream font-normal mb-1">Arrependimento</p>
                <p>Frete pago pela <strong className="text-cream font-normal">Boutique Arco-Íris</strong>. Enviaremos a etiqueta de postagem por WhatsApp ou e-mail.</p>
              </div>
              <div className="border border-border p-4">
                <p className="text-cream font-normal mb-1">Defeito ou produto errado</p>
                <p>Frete pago pela <strong className="text-cream font-normal">Boutique Arco-Íris</strong>. Enviaremos a etiqueta de postagem após análise.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">Reembolso</h2>
            <p>
              Após recebermos e verificarmos o produto devolvido, o reembolso é processado em até{' '}
              <strong className="text-cream font-normal">10 dias úteis</strong>:
            </p>
            <ul className="space-y-1.5 list-disc list-inside mt-3">
              <li><strong className="text-cream font-normal">Pix:</strong> estorno na chave Pix utilizada no pagamento</li>
              <li><strong className="text-cream font-normal">Cartão:</strong> estorno na fatura (prazo do banco pode variar até 2 faturas)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">Dúvidas?</h2>
            <p>
              Se tiver qualquer dúvida sobre trocas e devoluções, entre em contato conosco pelo
              WhatsApp <strong className="text-cream font-normal">(38) 99922-3190</strong> ou pelo e-mail{' '}
              <a href={`mailto:${EMAIL}`} className="text-gold hover:text-gold/80 transition-colors">{EMAIL}</a>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
