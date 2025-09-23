import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, Link } from '@inertiajs/react';
import { IconApi, IconArrowLeft, IconCheck, IconCopy, IconInfoCircle, IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface ConnectionInfoProps {
    baseUrl: string;
    apiPrefix: string;
}

export default function ConnectionInfo({ baseUrl, apiPrefix }: ConnectionInfoProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const apiUrl = `${baseUrl}/${apiPrefix}`;

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(type);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const curlExample = `curl -X GET ${apiUrl}/v1/connection/info \\
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \\
  -H "Accept: application/json"`;

    const javascriptExample = `const response = await fetch('${apiUrl}/v1/connection/info', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_CLIENT_TOKEN',
    'Accept': 'application/json',
  }
});

const data = await response.json();
console.log(data);`;

    const phpExample = `<?php
$client = new GuzzleHttp\\Client();

$response = $client->get('${apiUrl}/v1/connection/info', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_CLIENT_TOKEN',
        'Accept' => 'application/json',
    ]
]);

$data = json_decode($response->getBody(), true);
print_r($data);`;

    const pythonExample = `import requests

response = requests.get('${apiUrl}/v1/connection/info',
    headers={
        'Authorization': 'Bearer YOUR_CLIENT_TOKEN',
        'Accept': 'application/json'
    }
)

data = response.json()
print(data)`;

    const successResponse = `{
  "success": true,
  "message": "Informações consultadas com sucesso",
  "data": {
    "connection_id": "zi_your_instance_id",
    "name": "WhatsApp Principal",
    "status": "connected",
    "phone": "5511999999999",
    "api_usage_count": 45,
    "api_rate_limit": 100,
    "api_last_used": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`;

    const errorResponse = `{
  "success": false,
  "error": "api_error",
  "message": "Erro ao obter informações da conexão",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Informações da Conexão - API ZapClass" />

            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/api-docs" className="text-blue-600 hover:text-blue-800">
                            <IconArrowLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <IconApi className="h-8 w-8 text-purple-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Informações da Conexão</h1>
                                <p className="text-gray-600">Obtenha informações sobre sua conexão WhatsApp e limites de uso</p>
                            </div>
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
                                    <CardTitle className="text-lg">Navegação</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <a href="#overview" className="block text-sm text-blue-600 hover:underline">Visão Geral</a>
                                    <a href="#examples" className="block text-sm text-blue-600 hover:underline">Exemplos de Código</a>
                                    <a href="#responses" className="block text-sm text-blue-600 hover:underline">Respostas</a>
                                    <a href="#fields" className="block text-sm text-blue-600 hover:underline">Campos da Resposta</a>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Endpoint</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">GET</Badge>
                                        </div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all block">
                                            /v1/connection/info
                                        </code>
                                    </div>
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
                                        <IconApi className="h-5 w-5 text-purple-600" />
                                        Visão Geral
                                    </CardTitle>
                                    <CardDescription>
                                        Este endpoint fornece informações detalhadas sobre sua conexão WhatsApp e uso da API
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                        <p className="text-sm">
                                            <strong>Útil para:</strong> Monitorar o uso da API, verificar limites de rate limit,
                                            confirmar o status da conexão e obter informações da instância.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Code Examples */}
                        <section id="examples">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Exemplos de Código</CardTitle>
                                    <CardDescription>
                                        Exemplos práticos de como obter informações da conexão
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="curl" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="curl">cURL</TabsTrigger>
                                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                            <TabsTrigger value="php">PHP</TabsTrigger>
                                            <TabsTrigger value="python">Python</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="curl">
                                            <div className="relative">
                                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                    <code>{curlExample}</code>
                                                </pre>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                                                    onClick={() => copyToClipboard(curlExample, 'curl')}
                                                >
                                                    {copiedCode === 'curl' ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="javascript">
                                            <div className="relative">
                                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                    <code>{javascriptExample}</code>
                                                </pre>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                                                    onClick={() => copyToClipboard(javascriptExample, 'javascript')}
                                                >
                                                    {copiedCode === 'javascript' ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="php">
                                            <div className="relative">
                                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                    <code>{phpExample}</code>
                                                </pre>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                                                    onClick={() => copyToClipboard(phpExample, 'php')}
                                                >
                                                    {copiedCode === 'php' ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="python">
                                            <div className="relative">
                                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                    <code>{pythonExample}</code>
                                                </pre>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                                                    onClick={() => copyToClipboard(pythonExample, 'python')}
                                                >
                                                    {copiedCode === 'python' ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Response Examples */}
                        <section id="responses">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Respostas</CardTitle>
                                    <CardDescription>
                                        Exemplos de respostas de sucesso e erro do endpoint
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="success" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="success" className="flex items-center gap-2">
                                                <IconCheck className="h-4 w-4" />
                                                Sucesso (200)
                                            </TabsTrigger>
                                            <TabsTrigger value="error" className="flex items-center gap-2">
                                                <IconX className="h-4 w-4" />
                                                Erro (401/500)
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="success">
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <pre className="bg-green-50 border border-green-200 p-4 rounded-lg overflow-x-auto text-sm">
                                                        <code>{successResponse}</code>
                                                    </pre>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => copyToClipboard(successResponse, 'success')}
                                                    >
                                                        {copiedCode === 'success' ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="error">
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <pre className="bg-red-50 border border-red-200 p-4 rounded-lg overflow-x-auto text-sm">
                                                        <code>{errorResponse}</code>
                                                    </pre>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => copyToClipboard(errorResponse, 'error')}
                                                    >
                                                        {copiedCode === 'error' ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Response Fields */}
                        <section id="fields">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campos da Resposta</CardTitle>
                                    <CardDescription>Descrição detalhada de cada campo retornado</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Campo</th>
                                                    <th className="text-left p-3">Tipo</th>
                                                    <th className="text-left p-3">Descrição</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">connection_id</code></td>
                                                    <td className="p-3">string</td>
                                                    <td className="p-3">ID único da sua instância</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">name</code></td>
                                                    <td className="p-3">string</td>
                                                    <td className="p-3">Nome da conexão definido por você</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">status</code></td>
                                                    <td className="p-3">string</td>
                                                    <td className="p-3">Status da conexão (connected, disconnected, error)</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">phone</code></td>
                                                    <td className="p-3">string|null</td>
                                                    <td className="p-3">Número do WhatsApp conectado</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">api_usage_count</code></td>
                                                    <td className="p-3">integer</td>
                                                    <td className="p-3">Número de requisições feitas no período atual</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">api_rate_limit</code></td>
                                                    <td className="p-3">integer</td>
                                                    <td className="p-3">Limite de requisições por minuto</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">api_last_used</code></td>
                                                    <td className="p-3">string|null</td>
                                                    <td className="p-3">Timestamp da última utilização da API</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Usage Example */}
                        <section>
                            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconInfoCircle className="h-5 w-5 text-purple-600" />
                                        Exemplo de Uso
                                    </CardTitle>
                                    <CardDescription>
                                        Como usar essas informações na sua aplicação
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <p><strong>Monitoramento de Rate Limit:</strong> Use api_usage_count e api_rate_limit para evitar atingir o limite</p>
                                        <p><strong>Status da Conexão:</strong> Verifique o campo status antes de enviar mensagens</p>
                                        <p><strong>Identificação:</strong> Use connection_id para logs e relatórios</p>
                                        <p><strong>Dashboard:</strong> Exiba essas informações em painéis de controle</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Back to overview */}
                        <div className="flex justify-center">
                            <Link href="/api-docs">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <IconArrowLeft className="h-4 w-4" />
                                    Voltar para Visão Geral
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}