import { Head } from '@inertiajs/react';
import { IconChartBar, IconCheck, IconHeadphones, IconLoader2, IconMenu2, IconShield, IconTrendingUp, IconUsers, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { usePricing } from '../../hooks/use-pricing';

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { plans, loading: plansLoading, error: plansError } = usePricing();

    const scrollToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false); // Close mobile menu after navigation
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const getPlanColorClasses = (type: string) => {
        switch (type) {
            case 'professional':
                return 'bg-gray-900 text-white';
            default:
                return 'bg-white border border-gray-200';
        }
    };
    return (
        <>
            <Head title="ZapClass - Transforme Seu Negócio com API WhatsApp" />

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-gray-900">ZapClass</div>

                            {/* Desktop Navigation */}
                            <nav className="hidden items-center space-x-8 md:flex">
                                <a
                                    href="#recursos"
                                    className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('recursos');
                                    }}
                                >
                                    Recursos
                                </a>
                                <a
                                    href="#precos"
                                    className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('precos');
                                    }}
                                >
                                    Preços
                                </a>
                                <a
                                    href="#contato"
                                    className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('contato');
                                    }}
                                >
                                    Contato
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                    EN
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-900">
                                    Entrar
                                </a>
                                <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => scrollToSection('contato')}>
                                    Demo Grátis
                                </Button>
                            </nav>

                            {/* Mobile Menu Button */}
                            <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                                {mobileMenuOpen ? <IconX className="h-6 w-6 text-gray-900" /> : <IconMenu2 className="h-6 w-6 text-gray-900" />}
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        {mobileMenuOpen && (
                            <nav className="mt-4 border-t border-gray-200 pt-4 pb-4 md:hidden">
                                <div className="flex flex-col space-y-4">
                                    <a
                                        href="#recursos"
                                        className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection('recursos');
                                        }}
                                    >
                                        Recursos
                                    </a>
                                    <a
                                        href="#precos"
                                        className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection('precos');
                                        }}
                                    >
                                        Preços
                                    </a>
                                    <a
                                        href="#contato"
                                        className="cursor-pointer text-gray-600 transition-colors hover:text-gray-900"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection('contato');
                                        }}
                                    >
                                        Contato
                                    </a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">
                                        EN
                                    </a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">
                                        Entrar
                                    </a>
                                    <Button className="w-fit bg-gray-900 hover:bg-gray-800" onClick={() => scrollToSection('contato')}>
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
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div>
                                <div className="mb-6 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                    Novo curso
                                </div>
                                <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900">Transforme Seu Negócio com API WhatsApp</h1>
                                <p className="mb-8 text-xl leading-relaxed text-gray-600">
                                    Conecte, automatize e faça seu negócio crescer com nossa poderosa plataforma de API WhatsApp. Inclui cursos
                                    exclusivos para maximizar seus resultados.
                                </p>
                                <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                                    <Button size="lg" className="bg-gray-900 hover:bg-gray-800" onClick={() => scrollToSection('contato')}>
                                        Começar Demo Grátis
                                    </Button>
                                    <Button variant="outline" size="lg" onClick={() => scrollToSection('precos')}>
                                        Ver Preços
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <IconCheck className="mr-2 h-4 w-4 text-green-500" />
                                        Sem configuração necessária
                                    </div>
                                    <div className="flex items-center">
                                        <IconCheck className="mr-2 h-4 w-4 text-green-500" />
                                        Suporte 24/7
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <IconHeadphones className="h-8 w-8 text-gray-600" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">Demo Interativo</h3>
                                        <p className="text-gray-600">Teste nossa plataforma gratuitamente</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Confiado por Milhares</h2>
                        <p className="mb-12 text-gray-600">Junte-se às empresas que já estão transformando seus negócios</p>

                        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                            <div>
                                <div className="mb-2 text-4xl font-bold text-gray-900">10.000+</div>
                                <div className="text-gray-600">Clientes Atendidos</div>
                            </div>
                            <div>
                                <div className="mb-2 text-4xl font-bold text-gray-900">5M+</div>
                                <div className="text-gray-600">Mensagens Enviadas</div>
                            </div>
                            <div>
                                <div className="mb-2 text-4xl font-bold text-gray-900">99.8%</div>
                                <div className="text-gray-600">Satisfação</div>
                            </div>
                            <div>
                                <div className="mb-2 text-4xl font-bold text-gray-900">99.9%</div>
                                <div className="text-gray-600">Uptime</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="recursos" className="scroll-mt-20 bg-gray-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Tudo que Você Precisa para Ter Sucesso</h2>
                            <p className="mx-auto max-w-3xl text-xl text-gray-600">
                                Desde integração WhatsApp até cursos exclusivos, fornecemos todas as ferramentas que seu negócio precisa para crescer.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                    <IconChartBar className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">Integração API WhatsApp</h3>
                                <p className="text-gray-600">
                                    Conecte múltiplas contas WhatsApp e automatize mensagens com uma API poderosa e confiável.
                                </p>
                            </div>

                            <div className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                    <IconCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">API Completa</h3>
                                <p className="text-gray-600">
                                    Acesso total à nossa API com webhooks, monitoramento em tempo real e documentação completa.
                                </p>
                            </div>

                            <div className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                                    <IconUsers className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">Cursos Exclusivos</h3>
                                <p className="text-gray-600">
                                    Aprenda a maximizar seus resultados com nossa biblioteca de cursos exclusivos sobre marketing e vendas.
                                </p>
                            </div>

                            <div className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                                    <IconShield className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">Segurança Empresarial</h3>
                                <p className="text-gray-600">
                                    Seus dados são protegidos com os mais altos padrões de segurança utilizados por grandes corporações.
                                </p>
                            </div>

                            <div className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                    <IconTrendingUp className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">Alta Performance</h3>
                                <p className="text-gray-600">
                                    99.9% de uptime garantido com infraestrutura proprietária para suportar grandes volumes.
                                </p>
                            </div>

                            <div className="p-6 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                                    <IconHeadphones className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-gray-900">Suporte Especializado</h3>
                                <p className="text-gray-600">
                                    Nossa equipe de especialistas está pronta para ajudar você a alcançar os melhores resultados.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="precos" className="scroll-mt-20 bg-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Escolha Seu Plano</h2>
                            <p className="text-xl text-gray-600">
                                Preços transparentes que crescem com seu negócio. Todos os planos incluem nossa biblioteca de cursos.
                            </p>
                        </div>

                        {plansLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <IconLoader2 className="h-8 w-8 animate-spin text-gray-400" />
                                <span className="ml-2 text-gray-600">Carregando planos...</span>
                            </div>
                        ) : plansError ? (
                            <div className="py-16 text-center">
                                <p className="mb-4 text-red-600">Erro ao carregar planos: {plansError}</p>
                                <p className="text-gray-600">Mostrando planos padrão</p>
                            </div>
                        ) : null}

                        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                            {plans.map((plan) => (
                                <div key={plan.id} className={`${getPlanColorClasses(plan.type)} relative rounded-2xl p-8`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                            <span className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white">Mais Popular</span>
                                        </div>
                                    )}

                                    <div className="mb-8 text-center">
                                        <h3 className={`mb-2 text-2xl font-bold ${plan.type === 'professional' ? 'text-white' : 'text-gray-900'}`}>
                                            {plan.name}
                                        </h3>
                                        <p className={`mb-4 ${plan.type === 'professional' ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {plan.description}
                                        </p>
                                        <div className="mb-4">
                                            <span className={`text-4xl font-bold ${plan.type === 'professional' ? 'text-white' : 'text-gray-900'}`}>
                                                {formatPrice(plan.price, plan.currency)}
                                            </span>
                                            <span className={`${plan.type === 'professional' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                /{plan.interval === 'month' ? 'mês' : 'ano'}
                                            </span>
                                        </div>
                                    </div>

                                    <ul className="mb-8 space-y-4">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <IconCheck
                                                    className={`mr-3 h-5 w-5 ${plan.type === 'professional' ? 'text-green-400' : 'text-green-500'}`}
                                                />
                                                <span className={plan.type === 'professional' ? 'text-white' : 'text-gray-900'}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full ${
                                            plan.type === 'professional'
                                                ? 'bg-white text-gray-900 hover:bg-gray-100'
                                                : plan.type === 'basic'
                                                  ? 'variant-outline'
                                                  : ''
                                        }`}
                                        variant={plan.type === 'basic' ? 'outline' : 'default'}
                                        onClick={() => {
                                            window.location.href = `/register-with-plan?plan=${plan.stripe_price_id}`;
                                        }}
                                    >
                                        Escolher Plano
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Precisa de um plano personalizado para seu negócio?{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    Fale com Vendas
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact/Demo Section */}
                <section id="contato" className="scroll-mt-20 bg-gray-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Pronto para Começar?</h2>
                            <p className="text-xl text-gray-600">
                                Agende uma demonstração ou entre em contato com nossa equipe para descobrir como a ZapClass pode transformar seu
                                negócio.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
                            {/* Demo Form */}
                            <div className="rounded-2xl bg-white p-8 shadow-lg">
                                <h3 className="mb-6 text-2xl font-bold text-gray-900">Agendar Demo</h3>
                                <form className="space-y-6">
                                    <div>
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input id="name" placeholder="Seu nome completo" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="seu@email.com" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="company">Empresa</Label>
                                        <Input id="company" placeholder="Nome da empresa" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input id="phone" placeholder="(11) 99999-9999" className="mt-1" />
                                    </div>
                                    <Button className="w-full bg-gray-900 hover:bg-gray-800">Agendar Demo</Button>
                                </form>
                            </div>

                            {/* Contact Info */}
                            <div className="rounded-2xl bg-gray-900 p-8 text-white">
                                <h3 className="mb-6 text-2xl font-bold">Entre em Contato</h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="mb-2 text-lg font-semibold">Resposta Rápida</h4>
                                        <p className="text-gray-300">Respondemos todas as consultas em até 24 horas</p>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 text-lg font-semibold">Suporte Especializado</h4>
                                        <p className="text-gray-300">Segunda a sexta, das 9h às 18h</p>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 text-lg font-semibold">Demo Personalizada</h4>
                                        <p className="text-gray-300">Sessões de demonstração personalizadas às necessidades do seu negócio</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 py-16 text-white">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-8 md:grid-cols-3">
                            <div>
                                <div className="mb-4 text-2xl font-bold">ZapClass</div>
                                <p className="mb-4 text-gray-400">
                                    Transforme seu negócio com a plataforma mais completa de API WhatsApp e cursos educacionais do mercado.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        <IconUsers className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-4 text-lg font-semibold">Links Rápidos</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            Recursos
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            Preços
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            Contato
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 text-lg font-semibold">Legal</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            Política de Privacidade
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            Termos de Serviço
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
                            <p className="text-gray-400">© 2024 ZapClass. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
