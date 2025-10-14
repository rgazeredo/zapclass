import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type WhatsAppConnection } from '@/types';
import { IconCheck, IconEdit, IconInfoCircle, IconPlus, IconTrash, IconWebhook, IconX } from '@tabler/icons-react';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Webhook {
    id: number;
    url: string;
    webhook_code: string;
    events: string[];
    exclude_events: string[];
    enabled: boolean;
    synced: boolean;
    created_at: string;
    updated_at: string;
}

interface WebhookManagementModalProps {
    open: boolean;
    onClose: () => void;
    connection: WhatsAppConnection | null;
}

// Informações detalhadas sobre cada evento
const eventInfo: Record<string, { title: string; description: string; examples: string[] }> = {
    connection: {
        title: 'Conexão',
        description: 'Disparado quando o status da conexão com WhatsApp muda',
        examples: ['Conectado', 'Desconectado', 'QR Code gerado', 'Autenticado'],
    },
    history: {
        title: 'Histórico (⚠️ Alto Volume)',
        description: 'Sincroniza todo o histórico de mensagens antigas quando a instância conecta',
        examples: ['Pode enviar centenas/milhares de mensagens de uma vez', 'Útil para sincronização inicial', 'Cuidado com sobrecarga do servidor'],
    },
    messages: {
        title: 'Mensagens',
        description: 'Disparado quando uma nova mensagem é recebida ou enviada',
        examples: ['Nova mensagem recebida', 'Mensagem enviada', 'Mensagens de texto, áudio, imagem, vídeo, documento'],
    },
    messages_update: {
        title: 'Atualização de Mensagens',
        description: 'Disparado quando o status de uma mensagem muda',
        examples: ['Mensagem enviada', 'Mensagem entregue', 'Mensagem lida', 'Mensagem deletada'],
    },
    call: {
        title: 'Chamadas',
        description: 'Disparado quando há uma chamada de voz ou vídeo',
        examples: ['Chamada recebida', 'Chamada perdida', 'Chamada em andamento'],
    },
    contacts: {
        title: 'Contatos',
        description: 'Disparado quando informações de contato são atualizadas',
        examples: ['Novo contato adicionado', 'Nome do contato alterado', 'Foto de perfil atualizada'],
    },
    presence: {
        title: 'Presença (⚠️ Alto Volume)',
        description: 'Disparado quando alguém fica online/offline ou está digitando',
        examples: ['Contato ficou online', 'Contato está digitando', 'Contato parou de digitar', 'Pode gerar milhares de eventos por dia'],
    },
    groups: {
        title: 'Grupos',
        description: 'Disparado quando há mudanças em grupos',
        examples: ['Adicionado a um grupo', 'Removido de um grupo', 'Participante adicionado/removido', 'Configurações do grupo alteradas'],
    },
    labels: {
        title: 'Etiquetas',
        description: 'Disparado quando etiquetas (labels) são criadas ou modificadas',
        examples: ['Nova etiqueta criada', 'Etiqueta editada', 'Etiqueta deletada'],
    },
    chats: {
        title: 'Conversas',
        description: 'Disparado quando há mudanças em conversas',
        examples: ['Nova conversa iniciada', 'Conversa arquivada', 'Conversa deletada', 'Conversa fixada'],
    },
    chat_labels: {
        title: 'Etiquetas de Conversas',
        description: 'Disparado quando etiquetas são adicionadas ou removidas de conversas',
        examples: ['Etiqueta adicionada à conversa', 'Etiqueta removida da conversa'],
    },
    blocks: {
        title: 'Bloqueios',
        description: 'Disparado quando um contato é bloqueado ou desbloqueado',
        examples: ['Contato bloqueado', 'Contato desbloqueado'],
    },
    leads: {
        title: 'Leads',
        description: 'Disparado quando há interação com leads do WhatsApp Business',
        examples: ['Novo lead capturado', 'Lead respondeu', 'Lead qualificado'],
    },
    sender: {
        title: 'Remetente',
        description: 'Disparado quando há mudanças nas informações do remetente',
        examples: ['Informações do perfil atualizadas', 'Status atualizado'],
    },
};

// Informações sobre excludeMessages
const excludeMessagesInfo: Record<string, { title: string; description: string; useCase: string }> = {
    wasSentByApi: {
        title: 'Mensagem Enviada via API',
        description: 'Exclui mensagens que foram enviadas através da API',
        useCase: 'Útil para evitar loops: seu webhook não será disparado para mensagens que você mesmo enviou via API',
    },
    wasNotSentByApi: {
        title: 'Mensagem NÃO Enviada via API',
        description: 'Exclui mensagens que NÃO foram enviadas através da API',
        useCase: 'Se você quer processar APENAS mensagens enviadas via API, use este filtro',
    },
    fromMeYes: {
        title: 'Minhas Mensagens',
        description: 'Exclui mensagens que você enviou (do seu WhatsApp)',
        useCase: 'Para processar apenas mensagens RECEBIDAS, não as que você enviou',
    },
    fromMeNo: {
        title: 'Mensagens de Outros',
        description: 'Exclui mensagens que outras pessoas enviaram',
        useCase: 'Para processar apenas as mensagens que VOCÊ enviou',
    },
    isGroupYes: {
        title: 'Mensagens de Grupo',
        description: 'Exclui mensagens que vieram de grupos',
        useCase: 'Para processar apenas conversas privadas (1:1)',
    },
    isGroupNo: {
        title: 'Mensagens Privadas',
        description: 'Exclui mensagens de conversas privadas',
        useCase: 'Para processar apenas mensagens de grupos',
    },
};

export function WebhookManagementModal({ open, onClose, connection }: WebhookManagementModalProps) {
    const { t } = useTranslation();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isAddingWebhook, setIsAddingWebhook] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | React.ReactNode | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [webhookToDelete, setWebhookToDelete] = useState<Webhook | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        url: '',
        events: [] as string[],
        exclude_events: [] as string[],
        enabled: true,
    });

    // Todos os eventos disponíveis
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

    // Eventos padrão (sem os de alto volume)
    const defaultEvents = [
        'connection',
        'messages',
        'messages_update',
        'call',
        'contacts',
        'groups',
        'labels',
        'chats',
        'chat_labels',
        'blocks',
        'leads',
        'sender',
    ];

    // Eventos de alto volume (alertar usuário)
    const highVolumeEvents = ['presence', 'history'];

    const availableExcludeMessages = ['wasSentByApi', 'wasNotSentByApi', 'fromMeYes', 'fromMeNo', 'isGroupYes', 'isGroupNo'];

    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.warn('CSRF token not found in meta tag');
        }
        return token || '';
    };

    const loadWebhooks = useCallback(async () => {
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
        } catch (error) {
            console.error('Error loading webhooks:', error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Erro ao carregar webhooks';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [connection]);

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
    }, [open, connection, loadWebhooks]);

    const handleAddWebhook = () => {
        setIsAddingWebhook(true);
        setShowAdvanced(false);
        setFormData({
            url: '',
            events: defaultEvents, // Select default events (without high volume ones)
            exclude_events: ['wasSentByApi'], // Por padrão, exclui mensagens enviadas via API para evitar loops
            enabled: true,
        });
    };

    const handleEditWebhook = (webhook: Webhook) => {
        setEditingWebhook(webhook);

        // If not all events are selected, show advanced mode automatically
        const webhookEvents = webhook.events || [];
        const hasAllEvents = availableEvents.every((event) => webhookEvents.includes(event));
        setShowAdvanced(!hasAllEvents);

        setFormData({
            url: webhook.url,
            events: webhook.events || [],
            exclude_events: webhook.exclude_events || [],
            enabled: webhook.enabled,
        });
    };

    const handleCancelForm = () => {
        setIsAddingWebhook(false);
        setEditingWebhook(null);
        setShowAdvanced(false);
        setFormData({
            url: '',
            events: [],
            exclude_events: ['wasSentByApi'], // Manter filtro padrão mesmo ao cancelar
            enabled: true,
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
            // If Advanced is not checked, send default events and wasSentByApi filter
            const eventsToSend = showAdvanced ? formData.events : defaultEvents;
            const excludeEventsToSend = showAdvanced ? formData.exclude_events : ['wasSentByApi'];

            const webhookData = {
                url: formData.url,
                events: eventsToSend,
                exclude_events: excludeEventsToSend,
                enabled: formData.enabled,
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
        } catch (error) {
            console.error('Error saving webhook:', error);

            // Verificar se é erro de URL duplicada (409 Conflict)
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                const existingWebhook = error.response.data.existing_webhook;
                const suggestion = error.response.data.suggestion;

                setError(
                    <div className="space-y-2">
                        <p className="font-medium">{error.response.data.message}</p>
                        {existingWebhook && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-medium text-amber-900">Webhook existente:</p>
                                <code className="mt-1 block text-xs text-amber-700">{existingWebhook.url}</code>
                                {existingWebhook.events && existingWebhook.events.length > 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                        Eventos: {existingWebhook.events.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                        <p className="text-sm text-gray-600">{suggestion}</p>
                        {existingWebhook && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    handleEditWebhook(existingWebhook);
                                    setError(null);
                                }}
                                className="mt-2"
                            >
                                <IconEdit className="mr-2 h-4 w-4" />
                                Editar Webhook Existente
                            </Button>
                        )}
                    </div>,
                );
            } else {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.message
                    : 'Erro ao salvar webhook';
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteWebhook = async () => {
        if (!connection || !webhookToDelete) return;

        setIsLoading(true);
        setError(null);

        try {
            const config = {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };

            const response = await axios.delete(`/whatsapp/${connection.id}/webhooks/${webhookToDelete.id}`, config);

            if (response.data.success) {
                // Recarregar a lista de webhooks
                await loadWebhooks();
                setWebhookToDelete(null); // Fechar o dialog
            } else {
                throw new Error(response.data.message || 'Erro ao deletar webhook');
            }
        } catch (error) {
            console.error('Error deleting webhook:', error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Erro ao deletar webhook';
            setError(errorMessage);
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
                            <div className="flex items-start gap-2">
                                <IconX className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                <div className="flex-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Lista de Webhooks */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Webhooks Cadastrados</h3>
                            <Button onClick={handleAddWebhook} disabled={isAddingWebhook || !!editingWebhook}>
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
                                                        <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                                                            {webhook.enabled ? 'Habilitado' : 'Desabilitado'}
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
                                                        {webhook.exclude_events && webhook.exclude_events.length > 0 && (
                                                            <Badge variant="outline" className="bg-red-50 text-xs text-red-700">
                                                                Exclude: {webhook.exclude_events.join(', ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditWebhook(webhook)}
                                                        disabled={isAddingWebhook || !!editingWebhook}
                                                    >
                                                        <IconEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setWebhookToDelete(webhook)}
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
                                    <p className="mt-1 text-xs text-gray-500">
                                        Esta é a URL do seu servidor onde você receberá os eventos do WhatsApp
                                    </p>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="webhook-enabled">Webhook Habilitado</Label>
                                        <p className="text-sm text-gray-500">Quando desabilitado, o webhook não receberá eventos</p>
                                    </div>
                                    <Switch
                                        id="webhook-enabled"
                                        checked={formData.enabled}
                                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enabled: checked }))}
                                    />
                                </div>

                                <div className="space-y-4">
                                    {/* Advanced Options Checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="advanced-options"
                                            checked={showAdvanced}
                                            onCheckedChange={(checked) => {
                                                setShowAdvanced(!!checked);
                                                // If unchecking advanced, select default events and keep wasSentByApi filter
                                                if (!checked) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        events: defaultEvents,
                                                        exclude_events: ['wasSentByApi'], // Sempre manter este filtro por padrão
                                                    }));
                                                }
                                            }}
                                        />
                                        <Label
                                            htmlFor="advanced-options"
                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Avançado
                                        </Label>
                                        <p className="text-sm text-gray-500">
                                            Selecionar eventos específicos e filtros de mensagens (por padrão, eventos recomendados sem alto volume)
                                        </p>
                                    </div>

                                    {/* Events Section - Only show when Advanced is checked */}
                                    {showAdvanced && (
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Label>Escutar eventos</Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <IconInfoCircle className="h-4 w-4 cursor-help text-gray-400" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="max-w-sm">
                                                            <p className="text-xs">
                                                                Clique em cada evento para ver detalhes sobre quando ele é disparado. Eventos marcados
                                                                com ⚠️ geram alto volume de requisições.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <p className="mb-2 text-sm text-gray-500">
                                                Clique nos eventos para selecioná-los. Passe o mouse para ver detalhes.
                                            </p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableEvents.map((event) => {
                                                    const isHighVolume = highVolumeEvents.includes(event);
                                                    const isSelected = formData.events.includes(event);
                                                    const info = eventInfo[event];

                                                    return (
                                                        <TooltipProvider key={event}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className={`cursor-pointer rounded border p-2 text-sm transition-colors ${
                                                                            isSelected
                                                                                ? isHighVolume
                                                                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                                                    : 'border-blue-500 bg-blue-50 text-blue-700'
                                                                                : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                        onClick={() => toggleEventSelection(event, 'events')}
                                                                    >
                                                                        <div className="flex items-center justify-between gap-1">
                                                                            <span className="text-xs font-medium">{event}</span>
                                                                            {isHighVolume && !isSelected && (
                                                                                <span className="text-[10px] font-semibold text-amber-600">⚠️</span>
                                                                            )}
                                                                            {isSelected && <IconCheck className="h-3 w-3" />}
                                                                        </div>
                                                                        {isHighVolume && (
                                                                            <p className="mt-0.5 text-[10px] text-gray-600">Alto volume</p>
                                                                        )}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                {info && (
                                                                    <TooltipContent side="top" className="max-w-md">
                                                                        <div className="space-y-2">
                                                                            <p className="text-sm font-semibold">{info.title}</p>
                                                                            <p className="text-xs">{info.description}</p>
                                                                            <div className="text-xs">
                                                                                <p className="mb-1 font-medium">Exemplos:</p>
                                                                                <ul className="list-inside list-disc space-y-0.5 text-gray-300">
                                                                                    {info.examples.map((example, idx) => (
                                                                                        <li key={idx}>{example}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                )}
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    );
                                                })}
                                            </div>

                                            {/* Warning when high volume events are selected */}
                                            {formData.events.some((event) => highVolumeEvents.includes(event)) && (
                                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                                    <div className="flex items-start gap-2">
                                                        <IconX className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-900">
                                                                ⚠️ Eventos de alto volume selecionados
                                                            </p>
                                                            <div className="mt-1 space-y-1 text-xs text-amber-700">
                                                                {formData.events.includes('presence') && (
                                                                    <p>
                                                                        <strong>presence:</strong> Dispara toda vez que alguém digita, fica
                                                                        online/offline. Pode gerar milhares de webhooks por dia e sobrecarregar seu
                                                                        servidor.
                                                                    </p>
                                                                )}
                                                                {formData.events.includes('history') && (
                                                                    <p>
                                                                        <strong>history:</strong> Sincroniza histórico completo de mensagens. Pode
                                                                        enviar centenas de mensagens antigas de uma vez.
                                                                    </p>
                                                                )}
                                                                <p className="mt-2 font-medium">
                                                                    ⚠️ Use apenas se realmente necessário para sua automação.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Show events summary when Advanced is not checked */}
                                    {!showAdvanced && (
                                        <div className="space-y-3">
                                            <div className="rounded-lg bg-blue-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <IconCheck className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">
                                                        Eventos recomendados serão escutados (sem eventos de alto volume)
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-blue-600">{defaultEvents.join(', ')}</p>
                                                <p className="mt-2 text-xs text-gray-600">
                                                    💡 Eventos de alto volume como <strong>presence</strong> e <strong>history</strong> foram
                                                    excluídos para evitar sobrecarga. Ative o modo Avançado se precisar deles.
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <IconCheck className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">Proteção contra loops ativada</span>
                                                </div>
                                                <p className="mt-1 text-xs text-green-700">
                                                    Mensagens enviadas via API (<strong>wasSentByApi</strong>) serão filtradas automaticamente para
                                                    evitar loops infinitos. Ative o modo Avançado para personalizar filtros.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Exclude Messages Section - Inside Advanced */}
                                    {showAdvanced && (
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Label>Filtros de Mensagens</Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <IconInfoCircle className="h-4 w-4 cursor-help text-gray-400" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="max-w-sm">
                                                            <p className="text-xs">
                                                                Use filtros para EXCLUIR mensagens específicas dos webhooks. Útil para evitar loops
                                                                infinitos e controlar quais tipos de mensagens processar.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            {/* Info box explaining default filter */}
                                            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                                <div className="flex items-start gap-2">
                                                    <IconCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                                    <div>
                                                        <p className="text-xs font-medium text-amber-900">Recomendado: wasSentByApi</p>
                                                        <p className="mt-1 text-xs text-amber-700">
                                                            Por padrão, filtramos mensagens enviadas via API para evitar loops infinitos. Você pode
                                                            personalizar os filtros abaixo.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mb-3 text-sm text-gray-500">
                                                Selecione os tipos de mensagem que deseja EXCLUIR. Passe o mouse para ver detalhes.
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {availableExcludeMessages.map((filter) => {
                                                    const isSelected = formData.exclude_events.includes(filter);
                                                    const info = excludeMessagesInfo[filter];

                                                    return (
                                                        <TooltipProvider key={filter}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className={`cursor-pointer rounded border p-3 text-sm transition-colors ${
                                                                            isSelected
                                                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                                                : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                        onClick={() => toggleEventSelection(filter, 'exclude_events')}
                                                                    >
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <div className="flex-1">
                                                                                <span className="block text-xs font-medium">{filter}</span>
                                                                                {info && (
                                                                                    <span className="mt-0.5 block text-[10px] text-gray-500">
                                                                                        {info.title}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {isSelected && <IconCheck className="h-3 w-3 flex-shrink-0" />}
                                                                        </div>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                {info && (
                                                                    <TooltipContent side="top" className="max-w-md">
                                                                        <div className="space-y-2">
                                                                            <p className="text-sm font-semibold">{info.title}</p>
                                                                            <p className="text-xs">{info.description}</p>
                                                                            <div className="mt-2 rounded bg-blue-500/10 p-2">
                                                                                <p className="text-xs font-medium text-blue-200">Caso de uso:</p>
                                                                                <p className="mt-1 text-xs text-gray-300">{info.useCase}</p>
                                                                            </div>
                                                                        </div>
                                                                    </TooltipContent>
                                                                )}
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    );
                                                })}
                                            </div>

                                            {/* Info box when filters are selected */}
                                            {formData.exclude_events.length > 0 && (
                                                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                    <div className="flex items-start gap-2">
                                                        <IconCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-900">Filtros ativos</p>
                                                            <p className="mt-1 text-xs text-blue-700">
                                                                Você não receberá webhooks para: <strong>{formData.exclude_events.join(', ')}</strong>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

            {/* Alert Dialog para confirmar exclusão */}
            <AlertDialog open={!!webhookToDelete} onOpenChange={(open) => !open && setWebhookToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>Tem certeza que deseja excluir este webhook?</p>
                            {webhookToDelete && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <code className="text-sm font-medium text-red-900">{webhookToDelete.url}</code>
                                    {webhookToDelete.events && webhookToDelete.events.length > 0 && (
                                        <p className="mt-2 text-xs text-red-700">
                                            Eventos: <strong>{webhookToDelete.events.join(', ')}</strong>
                                        </p>
                                    )}
                                </div>
                            )}
                            <p className="text-sm text-gray-600">
                                Esta ação não pode ser desfeita. O webhook será removido permanentemente e parará de receber eventos.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteWebhook();
                            }}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? 'Excluindo...' : 'Excluir Webhook'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}
