import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { IconApi, IconBolt, IconCheck, IconInfoCircle, IconMessage2, IconShield, IconArrowRight, IconKey } from '@tabler/icons-react';

interface ApiDocumentationProps {
    baseUrl: string;
    apiPrefix: string;
}

export default function ApiDocumentation({ baseUrl, apiPrefix }: ApiDocumentationProps) {
    const apiUrl = `${baseUrl}/${apiPrefix}`;

    const endpoints = [
        {
            title: 'Enviar Mensagem',
            description: 'Envie mensagens de texto via WhatsApp para qualquer número brasileiro',
            method: 'POST',
            path: '/v1/messages/send-text',
            href: '/api-docs/send-message',
            icon: IconMessage2,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
        },
        {
            title: 'Status da Mensagem',
            description: 'Consulte o status de entrega de uma mensagem enviada',
            method: 'GET',
            path: '/v1/messages/status/{messageId}',
            href: '/api-docs/message-status',
            icon: IconInfoCircle,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        },
        {
            title: 'Informações da Conexão',
            description: 'Obtenha informações sobre sua conexão WhatsApp e limites de uso',
            method: 'GET',
            path: '/v1/connection/info',
            href: '/api-docs/connection-info',
            icon: IconApi,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Documentação da API - ZapClass" />

            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <IconApi className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Documentação da API ZapClass</h1>
                            <p className="text-gray-600">Integre WhatsApp ao seu sistema de forma simples e eficiente</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Navegação Rápida</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <a href="#overview" className="block text-sm text-blue-600 hover:underline">Visão Geral</a>
                                    <a href="#authentication" className="block text-sm text-blue-600 hover:underline">Autenticação</a>
                                    <a href="#endpoints" className="block text-sm text-blue-600 hover:underline">Endpoints</a>
                                    <a href="#rate-limits" className="block text-sm text-blue-600 hover:underline">Rate Limits</a>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Endpoints</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {endpoints.map((endpoint, index) => (
                                        <Link key={index} href={endpoint.href} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded transition-colors">
                                            <endpoint.icon className={`h-4 w-4 ${endpoint.iconColor}`} />
                                            <span>{endpoint.title}</span>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <IconBolt className="h-5 w-5 text-yellow-500" />
                                        Base URL
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                                        {apiUrl}
                                    </code>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Overview */}
                        <section id="overview">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconMessage2 className="h-5 w-5 text-green-600" />
                                        Visão Geral
                                    </CardTitle>
                                    <CardDescription>
                                        A API ZapClass permite enviar mensagens WhatsApp de forma programática
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <IconShield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <h3 className="font-semibold">Segura</h3>
                                            <p className="text-sm text-gray-600">Autenticação via Bearer Token</p>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <IconBolt className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <h3 className="font-semibold">Rápida</h3>
                                            <p className="text-sm text-gray-600">Respostas em milissegundos</p>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <IconCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                            <h3 className="font-semibold">Confiável</h3>
                                            <p className="text-sm text-gray-600">99.9% de uptime</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Authentication */}
                        <section id="authentication">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconKey className="h-5 w-5 text-orange-600" />
                                        Autenticação
                                    </CardTitle>
                                    <CardDescription>
                                        Todas as requisições devem incluir um token de autenticação no header
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <p className="text-sm mb-2 font-medium">Header de Autenticação:</p>
                                        <code className="text-sm">Authorization: Bearer YOUR_CLIENT_TOKEN</code>
                                    </div>
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                        <p className="text-sm">
                                            <strong>Importante:</strong> Seu token de cliente é diferente do token UAZ.
                                            Use apenas o token fornecido pela ZapClass para autenticação na API.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Endpoints */}
                        <section id="endpoints">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Endpoints Disponíveis</CardTitle>
                                    <CardDescription>
                                        Clique em qualquer endpoint abaixo para ver a documentação completa
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4">
                                        {endpoints.map((endpoint, index) => (
                                            <Link key={index} href={endpoint.href}>
                                                <Card className={`cursor-pointer transition-all hover:shadow-md border ${endpoint.borderColor} ${endpoint.bgColor} hover:scale-[1.02]`}>
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-4 flex-1">
                                                                <div className={`p-2 rounded-lg ${endpoint.bgColor}`}>
                                                                    <endpoint.icon className={`h-6 w-6 ${endpoint.iconColor}`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h3 className="font-semibold text-lg">{endpoint.title}</h3>
                                                                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                                                                            endpoint.method === 'POST'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-blue-100 text-blue-800'
                                                                        }`}>
                                                                            {endpoint.method}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-600 mb-3">{endpoint.description}</p>
                                                                    <code className="text-sm bg-white px-2 py-1 rounded border">
                                                                        {endpoint.path}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                            <IconArrowRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Rate Limits */}
                        <section id="rate-limits">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rate Limits</CardTitle>
                                    <CardDescription>Limites de uso da API</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Limite Padrão</h4>
                                            <p className="text-sm text-gray-600">100 requisições por minuto por token</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Headers de Resposta</h4>
                                            <p className="text-sm text-gray-600">X-RateLimit-Remaining indica requisições restantes</p>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                                        <p className="text-sm">
                                            <strong>Dica:</strong> Monitore os headers de rate limit em suas requisições
                                            para evitar erros 429 (Too Many Requests).
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Getting Started */}
                        <section>
                            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconBolt className="h-5 w-5 text-blue-600" />
                                        Comece Agora
                                    </CardTitle>
                                    <CardDescription>
                                        Comece a integrar a API ZapClass em poucos minutos
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href="/api-docs/send-message">
                                            <Button className="w-full sm:w-auto">
                                                <IconMessage2 className="h-4 w-4 mr-2" />
                                                Ver Exemplo de Envio
                                            </Button>
                                        </Link>
                                        <Link href="/whatsapp">
                                            <Button variant="outline" className="w-full sm:w-auto">
                                                <IconApi className="h-4 w-4 mr-2" />
                                                Gerenciar Conexões
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}