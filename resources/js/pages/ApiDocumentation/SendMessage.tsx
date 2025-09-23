import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, Link } from '@inertiajs/react';
import { IconApi, IconArrowLeft, IconCheck, IconCopy, IconMessage2, IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface SendMessageProps {
    baseUrl: string;
    apiPrefix: string;
}

export default function SendMessage({ baseUrl, apiPrefix }: SendMessageProps) {
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

    const curlExample = `curl -X POST ${apiUrl}/v1/messages/send-text \\
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste."
  }'`;

    const javascriptExample = `const response = await fetch('${apiUrl}/v1/messages/send-text', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_CLIENT_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone_number: '5511999999999',
    message: 'Olá! Esta é uma mensagem de teste.'
  })
});

const data = await response.json();
console.log(data);`;

    const phpExample = `<?php
$client = new GuzzleHttp\\Client();

$response = $client->post('${apiUrl}/v1/messages/send-text', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_CLIENT_TOKEN',
        'Content-Type' => 'application/json',
    ],
    'json' => [
        'phone_number' => '5511999999999',
        'message' => 'Olá! Esta é uma mensagem de teste.'
    ]
]);

$data = json_decode($response->getBody(), true);
print_r($data);`;

    const pythonExample = `import requests

response = requests.post('${apiUrl}/v1/messages/send-text',
    headers={
        'Authorization': 'Bearer YOUR_CLIENT_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'phone_number': '5511999999999',
        'message': 'Olá! Esta é uma mensagem de teste.'
    }
)

data = response.json()
print(data)`;

    const successResponse = `{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "message_id": "msg_abc123def456ghi789",
    "status": "sent",
    "recipient": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste.",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "connection_id": "zi_your_instance_id"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`;

    const errorResponse = `{
  "success": false,
  "error": "api_error",
  "message": "O número deve estar no formato brasileiro com DDI (ex: 5511999999999)",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Enviar Mensagem - API ZapClass" />

            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/api-docs" className="text-blue-600 hover:text-blue-800">
                            <IconArrowLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <IconMessage2 className="h-8 w-8 text-green-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Enviar Mensagem</h1>
                                <p className="text-gray-600">Endpoint para envio de mensagens de texto via WhatsApp</p>
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
                                    <a href="#parameters" className="block text-sm text-blue-600 hover:underline">Parâmetros</a>
                                    <a href="#examples" className="block text-sm text-blue-600 hover:underline">Exemplos de Código</a>
                                    <a href="#responses" className="block text-sm text-blue-600 hover:underline">Respostas</a>
                                    <a href="#errors" className="block text-sm text-blue-600 hover:underline">Códigos de Erro</a>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Endpoint</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-green-600">POST</Badge>
                                        </div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all block">
                                            /v1/messages/send-text
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
                                        <IconMessage2 className="h-5 w-5 text-green-600" />
                                        Visão Geral
                                    </CardTitle>
                                    <CardDescription>
                                        Este endpoint permite enviar mensagens de texto via WhatsApp para qualquer número brasileiro
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                        <p className="text-sm">
                                            <strong>Importante:</strong> Certifique-se de que sua conexão WhatsApp esteja ativa e conectada
                                            antes de enviar mensagens. Você pode verificar o status na seção de conexões.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Parameters */}
                        <section id="parameters">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parâmetros</CardTitle>
                                    <CardDescription>
                                        Parâmetros obrigatórios e opcionais para o envio de mensagens
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Parâmetro</th>
                                                    <th className="text-left p-3">Tipo</th>
                                                    <th className="text-left p-3">Obrigatório</th>
                                                    <th className="text-left p-3">Descrição</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">phone_number</code></td>
                                                    <td className="p-3">string</td>
                                                    <td className="p-3"><IconCheck className="h-4 w-4 text-green-600" /></td>
                                                    <td className="p-3">
                                                        <div>
                                                            <p>Número no formato brasileiro com DDI</p>
                                                            <p className="text-xs text-gray-500 mt-1">Exemplo: 5511999999999</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">message</code></td>
                                                    <td className="p-3">string</td>
                                                    <td className="p-3"><IconCheck className="h-4 w-4 text-green-600" /></td>
                                                    <td className="p-3">
                                                        <div>
                                                            <p>Texto da mensagem</p>
                                                            <p className="text-xs text-gray-500 mt-1">Entre 1 e 4096 caracteres</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
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
                                        Exemplos práticos de como enviar mensagens em diferentes linguagens
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
                                                Erro (400/500)
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
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <h4 className="font-semibold text-green-800 mb-2">Campos da Resposta:</h4>
                                                    <ul className="text-sm text-green-700 space-y-1">
                                                        <li><strong>message_id:</strong> ID único da mensagem para rastreamento</li>
                                                        <li><strong>status:</strong> Status atual da mensagem (sent, delivered, read, failed)</li>
                                                        <li><strong>recipient:</strong> Número de destino da mensagem</li>
                                                        <li><strong>connection_id:</strong> ID da sua instância</li>
                                                    </ul>
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

                        {/* Error Codes */}
                        <section id="errors">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Códigos de Status HTTP</CardTitle>
                                    <CardDescription>Códigos de resposta específicos deste endpoint</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Código</th>
                                                    <th className="text-left p-3">Status</th>
                                                    <th className="text-left p-3">Descrição</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="default" className="bg-green-600">200</Badge></td>
                                                    <td className="p-3">OK</td>
                                                    <td className="p-3">Mensagem enviada com sucesso</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="destructive">400</Badge></td>
                                                    <td className="p-3">Bad Request</td>
                                                    <td className="p-3">Parâmetros inválidos (número mal formatado, mensagem vazia, etc.)</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="destructive">401</Badge></td>
                                                    <td className="p-3">Unauthorized</td>
                                                    <td className="p-3">Token de autenticação inválido ou ausente</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="destructive">429</Badge></td>
                                                    <td className="p-3">Too Many Requests</td>
                                                    <td className="p-3">Rate limit excedido</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="destructive">500</Badge></td>
                                                    <td className="p-3">Internal Server Error</td>
                                                    <td className="p-3">Erro interno (conexão WhatsApp desconectada, etc.)</td>
                                                </tr>
                                            </tbody>
                                        </table>
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