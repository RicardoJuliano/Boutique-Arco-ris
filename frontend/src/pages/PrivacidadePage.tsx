import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EMAIL = 'boutiquearcoiris2020@gmail.com';
const UPDATED = 'Junho de 2026';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <p className="page-eyebrow">Legal</p>
        <h1 className="page-title mb-2">Política de Privacidade</h1>
        <p className="font-body text-xs font-light text-muted mb-12">Última atualização: {UPDATED}</p>

        <div className="space-y-10 font-body font-light text-sm leading-relaxed text-muted">

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">1. Quem somos</h2>
            <p>
              A <strong className="text-cream font-normal">Boutique Arco-Íris</strong>, localizada na Av. JK, 502 — Buenópolis/MG,
              CEP 39230-000, é responsável pelo tratamento dos dados pessoais coletados neste site,
              nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">2. Dados que coletamos</h2>
            <ul className="space-y-2 list-none">
              {[
                ['Nome completo', 'Identificação no cadastro e nos pedidos'],
                ['E-mail', 'Comunicação sobre pedidos e conta'],
                ['CPF', 'Identificação fiscal e emissão de Nota Fiscal'],
                ['Endereço de entrega', 'Cálculo de frete e envio dos pedidos'],
                ['Telefone', 'Atendimento ao cliente (WhatsApp)'],
                ['Histórico de pedidos', 'Consulta e suporte pós-venda'],
              ].map(([dado, motivo]) => (
                <li key={dado} className="flex gap-3 border-b border-border pb-2">
                  <span className="text-cream min-w-48">{dado}</span>
                  <span>{motivo}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">3. Como usamos seus dados</h2>
            <p className="mb-3">Seus dados são usados exclusivamente para:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Processar e entregar seus pedidos</li>
              <li>Emitir Nota Fiscal eletrônica</li>
              <li>Enviar recomendações de moda personalizadas (quiz de estilo)</li>
              <li>Prestar atendimento ao cliente</li>
              <li>Cumprir obrigações legais e fiscais</li>
            </ul>
            <p className="mt-3">
              <strong className="text-cream font-normal">Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins comerciais.</strong>
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">4. Com quem compartilhamos</h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-cream font-normal">Cloudinary</strong> — serviço de hospedagem de imagens dos produtos
                (não recebe dados pessoais dos clientes).
              </li>
              <li>
                <strong className="text-cream font-normal">Correios</strong> — endereço de entrega para despacho das encomendas.
              </li>
              <li>
                <strong className="text-cream font-normal">Autoridades públicas</strong> — quando exigido por lei, ordem judicial ou órgão regulatório.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">5. Seus direitos (LGPD, Art. 18)</h2>
            <p className="mb-3">Você tem direito a, a qualquer momento:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar, corrigir ou atualizar seus dados</li>
              <li>Solicitar a exclusão dos seus dados (quando não houver obrigação legal de retenção)</li>
              <li>Revogar o consentimento para tratamentos baseados nele</li>
              <li>Solicitar portabilidade dos dados para outro fornecedor</li>
            </ul>
            <p className="mt-3">
              Para exercer esses direitos, entre em contato pelo e-mail{' '}
              <a href={`mailto:${EMAIL}`} className="text-gold hover:text-gold/80 transition-colors">{EMAIL}</a>{' '}
              ou pelo WhatsApp (38) 99922-3190.
              Respondemos em até 5 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">6. Cookies</h2>
            <p>
              Este site utiliza apenas <strong className="text-cream font-normal">cookies de sessão</strong> para manter você
              conectado durante a navegação. Não utilizamos cookies de rastreamento, publicidade
              ou análise de comportamento de terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">7. Segurança</h2>
            <p>
              Todas as comunicações entre seu navegador e nosso servidor são protegidas por
              criptografia HTTPS/TLS. Senhas são armazenadas com hash seguro (bcrypt).
              Nenhum dado de cartão de crédito é armazenado em nossos servidores.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">8. Retenção de dados</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa ou pelo prazo exigido por
              lei (ex.: dados fiscais por 5 anos, conforme legislação tributária federal).
              Após esse período, os dados são excluídos de forma segura.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">9. Encarregada de Dados (DPO)</h2>
            <p>
              Nos termos do Art. 41 da LGPD, a encarregada pelo tratamento de dados pessoais da
              Boutique Arco-Íris é <strong className="text-cream font-normal">Viviane</strong>, que pode ser
              contactada pelo e-mail{' '}
              <a href={`mailto:${EMAIL}`} className="text-gold hover:text-gold/80 transition-colors">{EMAIL}</a>{' '}
              ou pelo WhatsApp (38) 99922-3190.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">10. Atualizações desta política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. A data da última revisão está
              indicada no topo desta página. Mudanças relevantes serão comunicadas por e-mail
              aos clientes cadastrados.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
