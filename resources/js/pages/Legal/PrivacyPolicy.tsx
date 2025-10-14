import { Head, Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';
import AppLogo from '../../components/app-logo';
import { Button } from '../../components/ui/button';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Política de Privacidade - ZapClass" />

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
                        <h1 className="mb-8 text-4xl font-bold text-gray-900">Política de Privacidade</h1>

                        <div className="prose prose-gray max-w-none">
                            <p className="text-lg text-gray-600 mb-8">
                                Última atualização: {new Date().toLocaleDateString('pt-BR')}
                            </p>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introdução</h2>
                                <p className="text-gray-700 mb-4">
                                    A ZapClass valoriza sua privacidade e está comprometida em proteger seus dados pessoais.
                                    Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações
                                    quando você usa nossa plataforma.
                                </p>
                                <p className="text-gray-700 mb-4">
                                    Ao usar nossos serviços, você concorda com a coleta e uso de informações de acordo com esta política.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informações que Coletamos</h2>
                                <p className="text-gray-700 mb-4">
                                    Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
                                </p>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Informações de Cadastro</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Nome completo</li>
                                    <li>Endereço de e-mail</li>
                                    <li>Telefone</li>
                                    <li>Nome da empresa</li>
                                    <li>Informações de pagamento (processadas através do Stripe)</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Dados de Uso</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Endereço IP</li>
                                    <li>Tipo de navegador e dispositivo</li>
                                    <li>Páginas visitadas e tempo de acesso</li>
                                    <li>Logs de API e webhooks configurados</li>
                                    <li>Estatísticas de uso da plataforma</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Dados de Comunicação</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Mensagens enviadas através da API do WhatsApp</li>
                                    <li>Metadados de mensagens (horário, status de entrega)</li>
                                    <li>Conexões WhatsApp configuradas</li>
                                    <li>Webhooks e suas configurações</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Como Usamos suas Informações</h2>
                                <p className="text-gray-700 mb-4">Utilizamos as informações coletadas para:</p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Fornecer, operar e manter nossa plataforma</li>
                                    <li>Processar transações e gerenciar assinaturas</li>
                                    <li>Melhorar e personalizar a experiência do usuário</li>
                                    <li>Enviar notificações sobre sua conta e atualizações do serviço</li>
                                    <li>Fornecer suporte técnico e responder solicitações</li>
                                    <li>Detectar, prevenir e resolver problemas técnicos</li>
                                    <li>Analisar padrões de uso para melhorar nossos serviços</li>
                                    <li>Cumprir obrigações legais e regulatórias</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
                                <p className="text-gray-700 mb-4">
                                    Não vendemos suas informações pessoais a terceiros. Podemos compartilhar seus dados apenas nas seguintes situações:
                                </p>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Provedores de Serviço</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Stripe (processamento de pagamentos)</li>
                                    <li>WhatsApp/Meta (API oficial do WhatsApp Business)</li>
                                    <li>Provedores de hospedagem e infraestrutura</li>
                                    <li>Ferramentas de análise e monitoramento</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Requisitos Legais</h3>
                                <p className="text-gray-700 mb-4">
                                    Podemos divulgar suas informações se exigido por lei ou em resposta a solicitações válidas de autoridades públicas.
                                </p>

                                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Transferência de Negócio</h3>
                                <p className="text-gray-700 mb-4">
                                    Em caso de fusão, aquisição ou venda de ativos, suas informações podem ser transferidas.
                                    Notificaremos você antes que suas informações se tornem sujeitas a uma política de privacidade diferente.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança dos Dados</h2>
                                <p className="text-gray-700 mb-4">
                                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Criptografia de dados em trânsito (SSL/TLS)</li>
                                    <li>Criptografia de dados sensíveis em repouso</li>
                                    <li>Controles de acesso rigorosos</li>
                                    <li>Monitoramento contínuo de segurança</li>
                                    <li>Backups regulares e redundância de dados</li>
                                    <li>Auditorias de segurança periódicas</li>
                                </ul>
                                <p className="text-gray-700 mb-4">
                                    No entanto, nenhum método de transmissão pela internet é 100% seguro. Embora nos esforcemos para proteger
                                    suas informações, não podemos garantir segurança absoluta.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Retenção de Dados</h2>
                                <p className="text-gray-700 mb-4">
                                    Retemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta política,
                                    a menos que um período de retenção maior seja exigido ou permitido por lei.
                                </p>
                                <p className="text-gray-700 mb-4">
                                    Quando você cancela sua conta, seus dados são mantidos por um período de 90 dias para fins de backup
                                    e recuperação, após o qual são permanentemente excluídos.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Seus Direitos (LGPD)</h2>
                                <p className="text-gray-700 mb-4">
                                    De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Confirmação da existência de tratamento de dados</li>
                                    <li>Acesso aos seus dados pessoais</li>
                                    <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                                    <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                                    <li>Portabilidade dos dados a outro fornecedor</li>
                                    <li>Eliminação dos dados tratados com seu consentimento</li>
                                    <li>Informação sobre compartilhamento de dados</li>
                                    <li>Revogação do consentimento</li>
                                </ul>
                                <p className="text-gray-700 mb-4">
                                    Para exercer qualquer um desses direitos, entre em contato conosco através dos canais de suporte.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies e Tecnologias Similares</h2>
                                <p className="text-gray-700 mb-4">
                                    Utilizamos cookies e tecnologias similares para:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700">
                                    <li>Manter você conectado à plataforma</li>
                                    <li>Lembrar suas preferências</li>
                                    <li>Analisar o uso e desempenho do site</li>
                                    <li>Melhorar a segurança</li>
                                </ul>
                                <p className="text-gray-700 mb-4">
                                    Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade da plataforma.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Links para Outros Sites</h2>
                                <p className="text-gray-700 mb-4">
                                    Nossa plataforma pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade
                                    desses sites. Recomendamos que você leia as políticas de privacidade de cada site que visitar.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacidade de Menores</h2>
                                <p className="text-gray-700 mb-4">
                                    Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações
                                    de menores. Se você acredita que coletamos informações de um menor, entre em contato conosco imediatamente.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Alterações nesta Política</h2>
                                <p className="text-gray-700 mb-4">
                                    Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas
                                    por e-mail ou através de um aviso em nossa plataforma. A data da "Última atualização" no topo desta página
                                    indica quando a política foi revisada pela última vez.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contato</h2>
                                <p className="text-gray-700 mb-4">
                                    Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais,
                                    entre em contato conosco através dos canais de suporte disponíveis na plataforma.
                                </p>
                                <p className="text-gray-700 mb-4">
                                    Encarregado de Dados (DPO): Para questões específicas sobre proteção de dados, você pode entrar em
                                    contato com nosso encarregado através do e-mail de suporte.
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
