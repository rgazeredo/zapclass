import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, Link } from '@inertiajs/react';
import { IconApi, IconArrowLeft, IconCheck, IconCopy, IconInfoCircle, IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface MessageStatusProps {
    baseUrl: string;
    apiPrefix: string;
}

export default function MessageStatus({ baseUrl, apiPrefix }: MessageStatusProps) {
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

    const curlExample = `curl -X GET ${apiUrl}/v1/messages/status/msg_abc123def456ghi789 \\
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \\
  -H "Accept: application/json"`;

    const javascriptExample = `const messageId = 'msg_abc123def456ghi789';
const response = await fetch(\`${apiUrl}/v1/messages/status/\${messageId}\`, {
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
$messageId = 'msg_abc123def456ghi789';

$response = $client->get("${apiUrl}/v1/messages/status/{$messageId}", [
    'headers' => [
        'Authorization' => 'Bearer YOUR_CLIENT_TOKEN',
        'Accept' => 'application/json',
    ]
]);

$data = json_decode($response->getBody(), true);
print_r($data);`;

    const pythonExample = `import requests

message_id = 'msg_abc123def456ghi789'
response = requests.get(f'${apiUrl}/v1/messages/status/{message_id}',
    headers={
        'Authorization': 'Bearer YOUR_CLIENT_TOKEN',
        'Accept': 'application/json'
    }
)

data = response.json()
print(data)`;

    const successResponse = `{
  "success": true,
  "message": "Status consultado com sucesso",
  "data": {
    "message_id": "msg_abc123def456ghi789",
    "status": "delivered",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "connection_id": "zi_your_instance_id"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`;

    const errorResponse = `{
  "success": false,
  "error": "api_error",
  "message": "Mensagem não encontrada",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Status da Mensagem - API ZapClass" />

            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/api-docs" className="text-blue-600 hover:text-blue-800">
                            <IconArrowLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <IconInfoCircle className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Status da Mensagem</h1>
                                <p className="text-gray-600">Consulte o status de entrega de uma mensagem enviada</p>
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
                                    <a href="#status-values" className="block text-sm text-blue-600 hover:underline">Valores de Status</a>
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
                                            /v1/messages/status/{'{messageId}'}
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
                                        <IconInfoCircle className="h-5 w-5 text-blue-600" />
                                        Visão Geral
                                    </CardTitle>
                                    <CardDescription>
                                        Este endpoint permite consultar o status de entrega de uma mensagem enviada anteriormente
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                        <p className="text-sm">
                                            <strong>Nota:</strong> Este endpoint retorna atualmente um status genérico.
                                            O tracking em tempo real via webhooks será implementado em versões futuras.
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
                                        Parâmetros necessários para consultar o status da mensagem
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Parâmetro</th>
                                                    <th className="text-left p-3">Tipo</th>
                                                    <th className="text-left p-3">Local</th>
                                                    <th className="text-left p-3">Descrição</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded">messageId</code></td>
                                                    <td className="p-3">string</td>
                                                    <td className="p-3">URL Path</td>
                                                    <td className="p-3">
                                                        <div>
                                                            <p>ID da mensagem retornado no envio</p>
                                                            <p className="text-xs text-gray-500 mt-1">Formato: msg_xxxxxxxxxxxxxxxxxx</p>
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
                                        Exemplos práticos de como consultar o status das mensagens
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
                                                Erro (404/500)
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

                        {/* Status Values */}
                        <section id="status-values">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Valores de Status</CardTitle>
                                    <CardDescription>Possíveis valores para o campo status da mensagem</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Status</th>
                                                    <th className="text-left p-3">Descrição</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="default" className="bg-blue-600">sent</Badge></td>
                                                    <td className="p-3">Mensagem enviada para o WhatsApp</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="default" className="bg-green-600">delivered</Badge></td>
                                                    <td className="p-3">Mensagem entregue ao destinatário</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="default" className="bg-purple-600">read</Badge></td>
                                                    <td className="p-3">Mensagem lida pelo destinatário</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="p-3"><Badge variant="destructive">failed</Badge></td>
                                                    <td className="p-3">Falha no envio da mensagem</td>
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