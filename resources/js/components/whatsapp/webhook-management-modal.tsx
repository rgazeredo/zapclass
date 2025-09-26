import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type WhatsAppConnection } from '@/types';
import { IconCheck, IconEdit, IconPlus, IconTrash, IconWebhook, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Webhook {
    id: number;
    url: string;
    events: string[];
    exclude_events: string[];
    status: 'active' | 'inactive';
    synced: boolean;
    created_at: string;
    updated_at: string;
}

interface WebhookManagementModalProps {
    open: boolean;
    onClose: () => void;
    connection: WhatsAppConnection | null;
}

export function WebhookManagementModal({ open, onClose, connection }: WebhookManagementModalProps) {
    const { t } = useTranslation();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isAddingWebhook, setIsAddingWebhook] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        url: '',
        events: [] as string[],
        exclude_events: [] as string[],
        status: 'active' as 'active' | 'inactive',
    });

    // Opções disponíveis
    const availableEvents = [
        'connection',
        'history',
        'messages',
        'messages_update',
        'call',
        'contacts',
        'presence',
        'groups',
        'labels',
        'chats',
        'chat_labels',
        'blocks',
        'leads',
        'sender',
    ];

    const availableExcludeMessages = ['wasSentByApi', 'wasNotSentByApi', 'fromMeYes', 'fromMeNo', 'isGroupYes', 'isGroupNo'];

    // Configurar Axios com token CSRF
    useEffect(() => {
        const token = getCsrfToken();
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            // Também configurar para requisições específicas
            axios.defaults.headers.post['X-CSRF-TOKEN'] = token;
            axios.defaults.headers.put['X-CSRF-TOKEN'] = token;
            axios.defaults.headers.delete['X-CSRF-TOKEN'] = token;
        }
    }, []);

    // Carregar webhooks quando o modal abre
    useEffect(() => {
        if (open && connection) {
            loadWebhooks();
        }
    }, [open, connection]);

    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.warn('CSRF token not found in meta tag');
        }
        return token || '';
    };

    const loadWebhooks = async () => {
        if (!connection) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/whatsapp/${connection.id}/webhooks`);

            if (response.data.success) {
                setWebhooks(response.data.webhooks);
            } else {
                throw new Error(response.data.message || 'Erro ao carregar webhooks');
            }
        } catch (error: any) {
            console.error('Error loading webhooks:', error);
            setError(error.response?.data?.message || error.message || 'Erro ao carregar webhooks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddWebhook = () => {
        setIsAddingWebhook(true);
        setShowAdvanced(false);
        setFormData({
            url: '',
            events: availableEvents, // Select all events by default
            exclude_events: [],
            status: 'active',
        });
    };

    const handleEditWebhook = (webhook: Webhook) => {
        setEditingWebhook(webhook);

        // If not all events are selected, show advanced mode automatically
        const webhookEvents = webhook.events || [];
        const hasAllEvents = availableEvents.every(event => webhookEvents.includes(event));
        setShowAdvanced(!hasAllEvents);

        setFormData({
            url: webhook.url,
            events: webhook.events || [],
            exclude_events: webhook.exclude_events || [],
            status: webhook.status,
        });
    };

    const handleCancelForm = () => {
        setIsAddingWebhook(false);
        setEditingWebhook(null);
        setShowAdvanced(false);
        setFormData({
            url: '',
            events: [],
            exclude_events: [],
            status: 'active',
        });
    };

    const toggleEventSelection = (event: string, type: 'events' | 'exclude_events') => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].includes(event) ? prev[type].filter((e) => e !== event) : [...prev[type], event],
        }));
    };

    const handleSaveWebhook = async () => {
        if (!connection) return;

        setIsLoading(true);
        setError(null);

        try {
            // If Advanced is not checked, send all events
            const eventsToSend = showAdvanced ? formData.events : availableEvents;

            const webhookData = {
                url: formData.url,
                events: eventsToSend,
                exclude_events: formData.exclude_events,
                status: formData.status,
            };

            const config = {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
            };

            let response;
            if (editingWebhook) {
                response = await axios.put(`/whatsapp/${connection.id}/webhooks/${editingWebhook.id}`, webhookData, config);
            } else {
                response = await axios.post(`/whatsapp/${connection.id}/webhooks`, webhookData, config);
            }

            if (response.data.success) {
                // Recarregar a lista de webhooks
                await loadWebhooks();
                handleCancelForm();
            } else {
                throw new Error(response.data.message || 'Erro ao salvar webhook');
            }
        } catch (error: any) {
            console.error('Error saving webhook:', error);
            setError(error.response?.data?.message || error.message || 'Erro ao salvar webhook');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteWebhook = async (webhookId: number) => {
        if (!connection) return;

        setIsLoading(true);
        setError(null);

        try {
            const config = {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };

            const response = await axios.delete(`/whatsapp/${connection.id}/webhooks/${webhookId}`, config);

            if (response.data.success) {
                // Recarregar a lista de webhooks
                await loadWebhooks();
            } else {
                throw new Error(response.data.message || 'Erro ao deletar webhook');
            }
        } catch (error: any) {
            console.error('Error deleting webhook:', error);
            setError(error.response?.data?.message || error.message || 'Erro ao deletar webhook');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] !w-[80vw] !max-w-[1000px] overflow-y-auto" style={{ width: '80vw', maxWidth: '1000px' }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconWebhook className="h-5 w-5" />
                        {t('whatsapp.webhooks')} - {connection?.name}
                    </DialogTitle>
                    <DialogDescription>Gerencie os webhooks para receber eventos em tempo real desta instância do WhatsApp</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Exibir erro se houver */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2">
                                <IconX className="h-5 w-5 text-red-600" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Lista de Webhooks */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Webhooks Cadastrados</h3>
                            <Button onClick={handleAddWebhook} disabled={isAddingWebhook || editingWebhook}>
                                <IconPlus className="mr-2 h-4 w-4" />
                                Adicionar Webhook
                            </Button>
                        </div>

                        {webhooks.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <IconWebhook className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">Nenhum webhook cadastrado</p>
                                    <p className="text-sm text-gray-400">Clique em "Adicionar Webhook" para começar</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {webhooks.map((webhook) => (
                                    <Card key={webhook.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">{webhook.url}</code>
                                                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                                                            {webhook.status}
                                                        </Badge>
                                                        <Badge variant={webhook.synced ? 'default' : 'destructive'}>
                                                            {webhook.synced ? 'Sincronizado' : 'Não Sincronizado'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {webhook.events && webhook.events.length > 0 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Events: {webhook.events.join(', ')}
                                                            </Badge>
                                                        )}
                                                        {/* TODO: Reativar quando API corrigir o excludeMessages */}
                                                        {/* {webhook.exclude_events && webhook.exclude_events.length > 0 && (
                                                            <Badge variant="outline" className="bg-red-50 text-xs text-red-700">
                                                                Exclude: {webhook.exclude_events.join(', ')}
                                                            </Badge>
                                                        )} */}
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditWebhook(webhook)}
                                                        disabled={isAddingWebhook || editingWebhook}
                                                    >
                                                        <IconEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteWebhook(webhook.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <IconTrash className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Formulário de Adicionar/Editar Webhook */}
                    {(isAddingWebhook || editingWebhook) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingWebhook ? 'Editar Webhook' : 'Adicionar Novo Webhook'}</CardTitle>
                                <CardDescription>Configure a URL e os eventos que deseja receber</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                                    <Input
                                        id="webhook-url"
                                        type="url"
                                        placeholder="https://seu-site.com/webhook"
                                        value={formData.url}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: 'active' | 'inactive') => setFormData((prev) => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Ativo</SelectItem>
                                            <SelectItem value="inactive">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    {/* Advanced Options Checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="advanced-options"
                                            checked={showAdvanced}
                                            onCheckedChange={(checked) => {
                                                setShowAdvanced(!!checked);
                                                // If unchecking advanced, select all events
                                                if (!checked) {
                                                    setFormData(prev => ({ ...prev, events: availableEvents }));
                                                }
                                            }}
                                        />
                                        <Label htmlFor="advanced-options" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Avançado
                                        </Label>
                                        <p className="text-sm text-gray-500">
                                            Selecionar eventos específicos (por padrão, todos os eventos são escutados)
                                        </p>
                                    </div>

                                    {/* Events Section - Only show when Advanced is checked */}
                                    {showAdvanced && (
                                        <div>
                                            <Label>Escutar eventos</Label>
                                            <p className="mb-2 text-sm text-gray-500">Selecione os eventos que deseja escutar</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableEvents.map((event) => (
                                                    <div
                                                        key={event}
                                                        className={`cursor-pointer rounded border p-2 text-sm transition-colors ${
                                                            formData.events.includes(event)
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        onClick={() => toggleEventSelection(event, 'events')}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{event}</span>
                                                            {formData.events.includes(event) && <IconCheck className="h-3 w-3 text-blue-600" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show events summary when Advanced is not checked */}
                                    {!showAdvanced && (
                                        <div className="rounded-lg bg-blue-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <IconCheck className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-800">
                                                    Todos os eventos serão escutados
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-blue-600">
                                                {availableEvents.join(', ')}
                                            </p>
                                        </div>
                                    )}

                                    {/* TODO: Reativar quando API corrigir o excludeMessages */}
                                    {/* <div>
                                        <Label>Excluir dos eventos escutados</Label>
                                        <p className="mb-2 text-sm text-gray-500">Selecione os eventos que deseja excluir</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableExcludeMessages.map((event) => (
                                                <div
                                                    key={event}
                                                    className={`cursor-pointer rounded border p-2 text-sm transition-colors ${
                                                        formData.exclude_events.includes(event)
                                                            ? 'border-red-500 bg-red-50 text-red-700'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => toggleEventSelection(event, 'exclude_events')}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{event}</span>
                                                        {formData.exclude_events.includes(event) && <IconCheck className="h-3 w-3 text-red-600" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-gray-500">
                                                <strong>wasSentByApi/wasNotSentByApi:</strong> Para evitar que sua automação fique em loop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                <strong>isGroupYes/isGroupNo:</strong> Para controlar recebimento de mensagens de grupos
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                <strong>fromMeYes/fromMeNo:</strong> Para controlar mensagens enviadas por você
                                            </p>
                                        </div>
                                    </div> */}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleSaveWebhook} disabled={isLoading || !formData.url}>
                                        {isLoading ? 'Salvando...' : 'Salvar Webhook'}
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelForm}>
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
