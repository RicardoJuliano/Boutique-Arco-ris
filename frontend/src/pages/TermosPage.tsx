import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EMAIL = 'boutiquearcoiris2020@gmail.com';
const UPDATED = 'Junho de 2026';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <p className="page-eyebrow">Legal</p>
        <h1 className="page-title mb-2">Termos de Uso</h1>
        <p className="font-body text-xs font-light text-muted mb-12">Última atualização: {UPDATED}</p>

        <div className="space-y-10 font-body font-light text-sm leading-relaxed text-muted">

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o site da <strong className="text-cream font-normal">Boutique Arco-Íris</strong>,
              você concorda com estes Termos de Uso. Se não concordar com qualquer disposição,
              pedimos que não utilize nosso site. Estes termos estão em conformidade com o
              Código de Defesa do Consumidor (CDC — Lei nº 8.078/1990) e o Marco Civil da
              Internet (Lei nº 12.965/2014).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">2. Uso do Site</h2>
            <p className="mb-3">Você pode utilizar este site para:</p>
            <ul className="space-y-1.5 list-disc list-inside mb-4">
              <li>Navegar pelo catálogo de produtos</li>
              <li>Criar uma conta e realizar compras</li>
              <li>Utilizar a consultora de moda com IA</li>
              <li>Acompanhar seus pedidos</li>
            </ul>
            <p className="mb-3">É <strong className="text-cream font-normal">proibido</strong>:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Usar o site para fins ilegais ou fraudulentos</li>
              <li>Tentar acessar áreas restritas sem autorização</li>
              <li>Reproduzir conteúdo do site sem autorização prévia por escrito</li>
              <li>Inserir informações falsas no cadastro ou pedidos</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">3. Cadastro e Conta</h2>
            <p className="mb-3">Ao criar uma conta, você se compromete a:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Fornecer informações verdadeiras, incluindo CPF e e-mail válidos</li>
              <li>Manter sua senha em sigilo e não compartilhá-la com terceiros</li>
              <li>Notificar imediatamente a Boutique Arco-Íris em caso de acesso não autorizado</li>
              <li>Ser responsável por todas as atividades realizadas em sua conta</li>
            </ul>
            <p className="mt-3">
              A Boutique Arco-Íris reserva-se o direito de suspender contas com indícios de
              uso fraudulento ou violação destes termos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">4. Pedidos e Pagamentos</h2>
            <ul className="space-y-3">
              <li>
                <strong className="text-cream font-normal">Confirmação:</strong> um pedido é confirmado
                após a aprovação do pagamento. A disponibilidade do produto é verificada no momento
                da finalização da compra.
              </li>
              <li>
                <strong className="text-cream font-normal">Estoque:</strong> em caso raro de indisponibilidade
                após a compra, entraremos em contato para oferecer substituição ou reembolso integral.
              </li>
              <li>
                <strong className="text-cream font-normal">Preços:</strong> os preços exibidos incluem os
                impostos aplicáveis. O frete é calculado separadamente com base no CEP de entrega.
              </li>
              <li>
                <strong className="text-cream font-normal">Nota Fiscal:</strong> emitimos Nota Fiscal
                eletrônica (NF-e) para todas as compras. Em caso de não recebimento, solicite pelo
                e-mail{' '}
                <a href={`mailto:${EMAIL}`} className="text-gold hover:text-gold/80 transition-colors">{EMAIL}</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">5. Entrega</h2>
            <p>
              Os prazos de entrega são estimativas dos Correios e podem variar por fatores externos
              como greves, feriados ou condições climáticas. A Boutique Arco-Íris não se responsabiliza
              por atrasos causados exclusivamente pelos Correios, mas se compromete a auxiliar na
              localização de encomendas mediante solicitação.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo deste site — incluindo textos, imagens, logotipo, nome "Boutique Arco-Íris"
              e o sistema de recomendações com IA — é de propriedade exclusiva da Boutique Arco-Íris
              ou de seus licenciantes. É vedada a reprodução, distribuição ou uso comercial sem
              autorização prévia por escrito.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              A Boutique Arco-Íris não se responsabiliza por danos decorrentes de caso fortuito ou
              força maior, interrupções de serviço de terceiros (Correios, operadoras de pagamento)
              ou uso indevido do site pelo usuário. Nossa responsabilidade máxima limita-se ao valor
              do pedido em questão.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">8. Privacidade</h2>
            <p>
              O tratamento dos seus dados pessoais é regido pela nossa{' '}
              <a href="/politica-de-privacidade" className="text-gold hover:text-gold/80 transition-colors">
                Política de Privacidade
              </a>
              , em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">9. Alterações nos Termos</h2>
            <p>
              Estes Termos de Uso podem ser atualizados periodicamente. A versão vigente estará
              sempre disponível nesta página, com a data de última atualização. O uso continuado
              do site após alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">10. Foro</h2>
            <p>
              Fica eleito o foro da <strong className="text-cream font-normal">Comarca de Buenópolis/MG</strong>{' '}
              para dirimir quaisquer controvérsias decorrentes destes Termos, ressalvado o direito
              do consumidor de optar pelo foro do seu domicílio, conforme o CDC.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-cream mb-4">11. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato pelo e-mail{' '}
              <a href={`mailto:${EMAIL}`} className="text-gold hover:text-gold/80 transition-colors">{EMAIL}</a>{' '}
              ou pelo WhatsApp <strong className="text-cream font-normal">(38) 99922-3190</strong>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
