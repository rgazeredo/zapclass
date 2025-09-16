import { Head } from '@inertiajs/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { IconCheck, IconChartBar, IconUsers, IconShield, IconSettings, IconTrendingUp, IconHeadphones, IconMenu2, IconX } from '@tabler/icons-react';
import { useState } from 'react';

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const scrollToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false); // Close mobile menu after navigation
    };
    return (
        <>
            <Head title="ZapClass - Transforme Seu Negócio com API WhatsApp" />

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-gray-900">
                                ZapClass
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center space-x-8">
                                <a
                                    href="#recursos"
                                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('recursos');
                                    }}
                                >
                                    Recursos
                                </a>
                                <a
                                    href="#precos"
                                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('precos');
                                    }}
                                >
                                    Preços
                                </a>
                                <a
                                    href="#contato"
                                    className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('contato');
                                    }}
                                >
                                    Contato
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">EN</a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">Entrar</a>
                                <Button
                                    className="bg-gray-900 hover:bg-gray-800"
                                    onClick={() => scrollToSection('contato')}
                                >
                                    Demo Grátis
                                </Button>
                            </nav>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <IconX className="h-6 w-6 text-gray-900" />
                                ) : (
                                    <IconMenu2 className="h-6 w-6 text-gray-900" />
                                )}
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        {mobileMenuOpen && (
                            <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
                                <div className="flex flex-col space-y-4">
                                    <a
                                        href="#recursos"
                                        className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection('recursos');
                                        }}
                                    >
                                        Recursos
                                    </a>
                                    <a
                                        href="#precos"
                                        className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection('precos');
                                        }}
                                    >
                                        Preços
                                    </a>
                                    <a
                                        href="#contato"
                                        className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection('contato');
                                        }}
                                    >
                                        Contato
                                    </a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">EN</a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Entrar</a>
                                    <Button
                                        className="bg-gray-900 hover:bg-gray-800 w-fit"
                                        onClick={() => scrollToSection('contato')}
                                    >
                                        Demo Grátis
                                    </Button>
                                </div>
                            </nav>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                                    Novo curso
                                </div>
                                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                    Transforme Seu Negócio com API WhatsApp
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    Conecte, automatize e faça seu negócio crescer com nossa poderosa plataforma de API WhatsApp. Inclui cursos exclusivos para maximizar seus resultados.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Button
                                        size="lg"
                                        className="bg-gray-900 hover:bg-gray-800"
                                        onClick={() => scrollToSection('contato')}
                                    >
                                        Começar Demo Grátis
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => scrollToSection('precos')}
                                    >
                                        Ver Preços
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <IconCheck className="h-4 w-4 text-green-500 mr-2" />
                                        Sem configuração necessária
                                    </div>
                                    <div className="flex items-center">
                                        <IconCheck className="h-4 w-4 text-green-500 mr-2" />
                                        Suporte 24/7
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="bg-white rounded-2xl shadow-2xl p-8">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <IconHeadphones className="h-8 w-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Interativo</h3>
                                        <p className="text-gray-600">Teste nossa plataforma gratuitamente</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Confiado por Milhares</h2>
                        <p className="text-gray-600 mb-12">Junte-se às empresas que já estão transformando seus negócios</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">10.000+</div>
                                <div className="text-gray-600">Clientes Atendidos</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">5M+</div>
                                <div className="text-gray-600">Mensagens Enviadas</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">99.8%</div>
                                <div className="text-gray-600">Satisfação</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
                                <div className="text-gray-600">Uptime</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="recursos" className="py-20 bg-gray-50 scroll-mt-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Tudo que Você Precisa para Ter Sucesso
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Desde integração WhatsApp até cursos exclusivos, fornecemos todas as ferramentas que seu negócio precisa para crescer.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <IconChartBar className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Integração API WhatsApp</h3>
                                <p className="text-gray-600">
                                    Conecte múltiplas contas WhatsApp e automatize mensagens com uma API poderosa e confiável.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <IconCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">API Completa</h3>
                                <p className="text-gray-600">
                                    Acesso total à nossa API com webhooks, monitoramento em tempo real e documentação completa.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <IconUsers className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cursos Exclusivos</h3>
                                <p className="text-gray-600">
                                    Aprenda a maximizar seus resultados com nossa biblioteca de cursos exclusivos sobre marketing e vendas.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <IconShield className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Segurança Empresarial</h3>
                                <p className="text-gray-600">
                                    Seus dados são protegidos com os mais altos padrões de segurança utilizados por grandes corporações.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <IconTrendingUp className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Alta Performance</h3>
                                <p className="text-gray-600">
                                    99.9% de uptime garantido com infraestrutura proprietária para suportar grandes volumes.
                                </p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <IconHeadphones className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Suporte Especializado</h3>
                                <p className="text-gray-600">
                                    Nossa equipe de especialistas está pronta para ajudar você a alcançar os melhores resultados.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="precos" className="py-20 bg-white scroll-mt-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Escolha Seu Plano</h2>
                            <p className="text-xl text-gray-600">
                                Preços transparentes que crescem com seu negócio. Todos os planos incluem nossa biblioteca de cursos.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Basic Plan */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
                                    <p className="text-gray-600 mb-4">Ideal para pequenos negócios</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
                                        <span className="text-gray-600">/mês</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>1 Conexão WhatsApp</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>1.000 mensagens/mês</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>Dashboard básico</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>Suporte por email</span>
                                    </li>
                                </ul>
                                <Button className="w-full" variant="outline">
                                    Escolher Plano
                                </Button>
                            </div>

                            {/* Professional Plan */}
                            <div className="bg-gray-900 text-white rounded-2xl p-8 relative">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Mais Popular
                                    </span>
                                </div>
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold mb-2">Profissional</h3>
                                    <p className="text-gray-300 mb-4">Para empresas em crescimento</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold">R$ 59,90</span>
                                        <span className="text-gray-300">/mês</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-400 mr-3" />
                                        <span>3 Conexões WhatsApp</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-400 mr-3" />
                                        <span>5.000 mensagens/mês</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-400 mr-3" />
                                        <span>Dashboard avançado</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-400 mr-3" />
                                        <span>API acesso completo</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-400 mr-3" />
                                        <span>Suporte prioritário</span>
                                    </li>
                                </ul>
                                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                                    Escolher Plano
                                </Button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Empresarial</h3>
                                    <p className="text-gray-600 mb-4">Para grandes volumes</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">R$ 149,90</span>
                                        <span className="text-gray-600">/mês</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>Conexões ilimitadas</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>25.000 mensagens/mês</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>Dashboard empresarial</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>API completa + Webhooks</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>Cursos exclusivos</span>
                                    </li>
                                    <li className="flex items-center">
                                        <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                                        <span>Suporte 24/7</span>
                                    </li>
                                </ul>
                                <Button className="w-full">
                                    Escolher Plano
                                </Button>
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-gray-600">
                                Precisa de um plano personalizado para seu negócio?{' '}
                                <a href="#" className="text-blue-600 hover:underline">Fale com Vendas</a>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact/Demo Section */}
                <section id="contato" className="py-20 bg-gray-50 scroll-mt-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pronto para Começar?</h2>
                            <p className="text-xl text-gray-600">
                                Agende uma demonstração ou entre em contato com nossa equipe para descobrir como a ZapClass pode transformar seu negócio.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            {/* Demo Form */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Agendar Demo</h3>
                                <form className="space-y-6">
                                    <div>
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input
                                            id="name"
                                            placeholder="Seu nome completo"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="company">Empresa</Label>
                                        <Input
                                            id="company"
                                            placeholder="Nome da empresa"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input
                                            id="phone"
                                            placeholder="(11) 99999-9999"
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button className="w-full bg-gray-900 hover:bg-gray-800">
                                        Agendar Demo
                                    </Button>
                                </form>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-gray-900 text-white rounded-2xl p-8">
                                <h3 className="text-2xl font-bold mb-6">Entre em Contato</h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Resposta Rápida</h4>
                                        <p className="text-gray-300">
                                            Respondemos todas as consultas em até 24 horas
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Suporte Especializado</h4>
                                        <p className="text-gray-300">
                                            Segunda a sexta, das 9h às 18h
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-2">Demo Personalizada</h4>
                                        <p className="text-gray-300">
                                            Sessões de demonstração personalizadas às necessidades do seu negócio
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-2xl font-bold mb-4">ZapClass</div>
                                <p className="text-gray-400 mb-4">
                                    Transforme seu negócio com a plataforma mais completa de API WhatsApp e cursos educacionais do mercado.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <IconUsers className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white">Termos de Serviço</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                            <p className="text-gray-400">
                                © 2024 ZapClass. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}