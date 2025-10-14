import { Head, Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';
import AppLogo from '../../components/app-logo';
import { Button } from '../../components/ui/button';

export default function TermsOfService() {
    return (
        <>
            <Head title="Termos de Uso - ZapClass" />

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/">
                                <AppLogo />
                            </Link>
                            <Link href="/">
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <IconArrowLeft className="h-4 w-4" />
                                    Voltar para Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="container mx-auto px-4 py-12">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="mb-8 text-4xl font-bold text-gray-900">Termos de Uso</h1>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-600 mb-8">
                                Última atualização: {new Date().toLocaleDateString('pt-BR')}
                            </p>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
                                <p className="text-gray-700 mb-4">
                                    Ao acessar e usar a plataforma ZapClass, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
                                    Se você não concorda com alguma parte destes termos, não deve usar nossa plataforma.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
                                <p className="text-gray-700 mb-4">
                                    A ZapClass é uma plataforma que fornece integração com a API oficial do WhatsApp Business, permitindo que empresas
                                    gerenciem suas comunicações e automatizem processos através de mensagens.
                                </p>
                                <p className="text-gray-700 mb-4">
                                    Nossos serviços incluem, mas não se limitam a:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Acesso à API oficial do WhatsApp Business</li>
                                    <li>Gerenciamento de múltiplas conexões WhatsApp</li>
                                    <li>Configuração e gerenciamento de webhooks</li>
                                    <li>Cursos exclusivos sobre automação com WhatsApp</li>
                                    <li>Suporte técnico especializado</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro e Conta</h2>
                                <p className="text-gray-700 mb-4">
                                    Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas.
                                    Você é responsável por:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Manter a confidencialidade de suas credenciais de acesso</li>
                                    <li>Todas as atividades que ocorram em sua conta</li>
                                    <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                                    <li>Garantir que as informações fornecidas sejam verdadeiras e atualizadas</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Uso Aceitável</h2>
                                <p className="text-gray-700 mb-4">Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. É proibido:</p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Enviar spam ou mensagens não solicitadas em massa</li>
                                    <li>Violar quaisquer políticas do WhatsApp ou leis aplicáveis</li>
                                    <li>Usar a plataforma para atividades fraudulentas ou ilegais</li>
                                    <li>Tentar acessar sistemas ou dados sem autorização</li>
                                    <li>Interferir ou interromper a integridade ou desempenho da plataforma</li>
                                    <li>Usar a plataforma de forma que possa danificar, desabilitar ou sobrecarregar nossos servidores</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Planos e Pagamentos</h2>
                                <p className="text-gray-700 mb-4">
                                    Nossa plataforma oferece diferentes planos de assinatura. Ao escolher um plano, você concorda em:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Pagar todas as taxas associadas ao plano escolhido</li>
                                    <li>Os pagamentos são processados através do Stripe</li>
                                    <li>As assinaturas são renovadas automaticamente, a menos que canceladas</li>
                                    <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
                                    <li>Reembolsos são processados de acordo com nossa política de cancelamento</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancelamento e Suspensão</h2>
                                <p className="text-gray-700 mb-4">
                                    Você pode cancelar sua assinatura a qualquer momento através do painel de controle.
                                    Reservamo-nos o direito de suspender ou encerrar sua conta se:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Você violar estes termos de uso</li>
                                    <li>Houver atividades suspeitas ou fraudulentas</li>
                                    <li>Você não efetuar os pagamentos devidos</li>
                                    <li>A pedido de autoridades legais</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Propriedade Intelectual</h2>
                                <p className="text-gray-700 mb-4">
                                    Todo o conteúdo da plataforma, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio e software,
                                    é propriedade da ZapClass ou de seus fornecedores de conteúdo e é protegido por leis de direitos autorais.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
                                <p className="text-gray-700 mb-4">
                                    A ZapClass não se responsabiliza por:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Interrupções temporárias do serviço devido a manutenção ou problemas técnicos</li>
                                    <li>Problemas na API do WhatsApp fora de nosso controle</li>
                                    <li>Perda de dados resultante de falhas técnicas ou ações de terceiros</li>
                                    <li>Danos indiretos, incidentais ou consequenciais decorrentes do uso da plataforma</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificações dos Termos</h2>
                                <p className="text-gray-700 mb-4">
                                    Reservamo-nos o direito de modificar estes termos a qualquer momento.
                                    Notificaremos os usuários sobre mudanças significativas por e-mail ou através da plataforma.
                                    O uso continuado após as mudanças constitui aceitação dos novos termos.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Lei Aplicável</h2>
                                <p className="text-gray-700 mb-4">
                                    Estes termos são regidos pelas leis brasileiras. Qualquer disputa relacionada a estes termos
                                    será resolvida nos tribunais competentes do Brasil.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contato</h2>
                                <p className="text-gray-700 mb-4">
                                    Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais
                                    de suporte disponíveis na plataforma.
                                </p>
                            </section>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 py-8 text-white mt-16">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-gray-400 text-sm">
                                © {new Date().getFullYear()} ZapClass. Todos os direitos reservados.
                            </p>
                            <div className="flex gap-6 text-sm">
                                <Link href="/termos-de-uso" className="text-gray-400 hover:text-white">
                                    Termos de Uso
                                </Link>
                                <Link href="/politica-de-privacidade" className="text-gray-400 hover:text-white">
                                    Política de Privacidade
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
