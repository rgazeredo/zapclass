import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IconCheck, IconEdit, IconInfoCircle, IconWebhook, IconX } from '@tabler/icons-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

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

interface WhatsAppConnection {
    id: number;
    name: string;
}

interface WebhookFormModalProps {
    open: boolean;
    onClose: () => void;
    connection: WhatsAppConnection;
    webhook: Webhook | null;
    onSaved: () => void;
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
const excludeMessagesInfo: Record<string, { title: string; description: string; useCase: string; conflictsWith?: string }> = {
    wasSentByApi: {
        title: 'Mensagem Enviada via API',
        description: 'Exclui mensagens que foram enviadas através da API',
        useCase: 'Útil para evitar loops: seu webhook não será disparado para mensagens que você mesmo enviou via API',
        conflictsWith: 'wasNotSentByApi',
    },
    wasNotSentByApi: {
        title: 'Mensagem NÃO Enviada via API',
        description: 'Exclui mensagens que NÃO foram enviadas através da API',
        useCase: 'Se você quer processar APENAS mensagens enviadas via API, use este filtro',
        conflictsWith: 'wasSentByApi',
    },
    fromMeYes: {
        title: 'Minhas Mensagens',
        description: 'Exclui mensagens que você enviou (do seu WhatsApp)',
        useCase: 'Para processar apenas mensagens RECEBIDAS, não as que você enviou',
        conflictsWith: 'fromMeNo',
    },
    fromMeNo: {
        title: 'Mensagens de Outros',
        description: 'Exclui mensagens que outras pessoas enviaram',
        useCase: 'Para processar apenas as mensagens que VOCÊ enviou',
        conflictsWith: 'fromMeYes',
    },
    isGroupYes: {
        title: 'Mensagens de Grupo',
        description: 'Exclui mensagens que vieram de grupos',
        useCase: 'Para processar apenas conversas privadas (1:1)',
        conflictsWith: 'isGroupNo',
    },
    isGroupNo: {
        title: 'Mensagens Privadas',
        description: 'Exclui mensagens de conversas privadas',
        useCase: 'Para processar apenas mensagens de grupos',
        conflictsWith: 'isGroupYes',
    },
};

export function WebhookFormModal({ open, onClose, connection, webhook, onSaved }: WebhookFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | React.ReactNode | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        url: '',
        events: [] as string[],
        exclude_events: ['wasSentByApi'] as string[],
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

    useEffect(() => {
        if (open) {
            if (webhook) {
                // Editando webhook existente
                const webhookEvents = webhook.events || [];
                const hasAllEvents = availableEvents.every((event) => webhookEvents.includes(event));
                setShowAdvanced(!hasAllEvents);

                setFormData({
                    url: webhook.url,
                    events: webhook.events || [],
                    exclude_events: webhook.exclude_events || [],
                    enabled: webhook.enabled,
                });
            } else {
                // Novo webhook
                setShowAdvanced(false);
                setFormData({
                    url: '',
                    events: defaultEvents,
                    exclude_events: ['wasSentByApi'],
                    enabled: true,
                });
            }
            setError(null);
        }
    }, [open, webhook]);

    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return token || '';
    };

    // Pares de filtros mutuamente exclusivos
    const conflictingPairs: Record<string, string> = {
        wasSentByApi: 'wasNotSentByApi',
        wasNotSentByApi: 'wasSentByApi',
        fromMeYes: 'fromMeNo',
        fromMeNo: 'fromMeYes',
        isGroupYes: 'isGroupNo',
        isGroupNo: 'isGroupYes',
    };

    const toggleEventSelection = (event: string, type: 'events' | 'exclude_events') => {
        setFormData((prev) => {
            const currentList = prev[type];
            const isCurrentlySelected = currentList.includes(event);

            // Se estiver desmarcando, apenas remover
            if (isCurrentlySelected) {
                return {
                    ...prev,
                    [type]: currentList.filter((e) => e !== event),
                };
            }

            // Se estiver marcando um filtro de exclude_events, verificar conflitos
            if (type === 'exclude_events' && conflictingPairs[event]) {
                const conflictingFilter = conflictingPairs[event];

                // Se o filtro conflitante estiver selecionado, removê-lo automaticamente
                if (currentList.includes(conflictingFilter)) {
                    return {
                        ...prev,
                        [type]: [...currentList.filter((e) => e !== conflictingFilter), event],
                    };
                }
            }

            // Adicionar o evento normalmente
            return {
                ...prev,
                [type]: [...currentList, event],
            };
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);

        try {
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
            if (webhook) {
                response = await axios.put(`/whatsapp/${connection.id}/webhooks/${webhook.id}`, webhookData, config);
            } else {
                response = await axios.post(`/whatsapp/${connection.id}/webhooks`, webhookData, config);
            }

            if (response.data.success) {
                onSaved();
            } else {
                throw new Error(response.data.message || 'Erro ao salvar webhook');
            }
        } catch (error) {
            console.error('Error saving webhook:', error);

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    // Conflito de URL duplicada
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
                                        <p className="mt-1 text-xs text-amber-600">Eventos: {existingWebhook.events.join(', ')}</p>
                                    )}
                                </div>
                            )}
                            <p className="text-sm text-gray-600">{suggestion}</p>
                        </div>,
                    );
                } else if (error.response?.status === 422) {
                    // Erro de validação (incluindo filtros conflitantes)
                    const message = error.response.data.message;
                    const conflictingFilters = error.response.data.conflicting_filters;

                    if (conflictingFilters) {
                        setError(
                            <div className="space-y-2">
                                <p className="font-medium">{message}</p>
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <p className="text-sm font-medium text-red-900">Filtros conflitantes:</p>
                                    <div className="mt-2 flex gap-2">
                                        {conflictingFilters.map((filter: string) => (
                                            <code key={filter} className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                                                {filter}
                                            </code>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    💡 Esses filtros excluem tipos opostos de mensagens. Ativar ambos significa que nenhuma mensagem seria recebida.
                                </p>
                            </div>,
                        );
                    } else {
                        setError(message || 'Erro de validação');
                    }
                } else {
                    const errorMessage = error.response?.data?.message || error.message;
                    setError(errorMessage);
                }
            } else {
                setError('Erro ao salvar webhook. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] !w-[800px] !max-w-[90vw] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconWebhook className="h-5 w-5" />
                        {webhook ? 'Editar Webhook' : 'Adicionar Novo Webhook'}
                    </DialogTitle>
                    <DialogDescription>Configure a URL e os eventos que deseja receber</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-2">
                                <IconX className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                <div className="flex-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Info about proxy */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <div className="flex items-start gap-2">
                            <IconWebhook className="mt-0.5 h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Sistema de Proxy de Webhooks</p>
                                <p className="mt-1 text-xs text-blue-700">
                                    Os webhooks são recebidos primeiro pelo nosso servidor e depois encaminhados para sua URL. Isso garante segurança e
                                    permite filtros adicionais.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* URL Field */}
                    <div>
                        <Label htmlFor="webhook-url">URL do Webhook</Label>
                        <Input
                            id="webhook-url"
                            type="url"
                            placeholder="https://seu-site.com/webhook"
                            value={formData.url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        />
                        <p className="mt-1 text-xs text-gray-500">Esta é a URL do seu servidor onde você receberá os eventos do WhatsApp</p>
                    </div>

                    {/* Enabled Toggle */}
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

                    {/* Advanced Options */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="advanced-options"
                                checked={showAdvanced}
                                onCheckedChange={(checked) => {
                                    setShowAdvanced(!!checked);
                                    if (!checked) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            events: defaultEvents,
                                            exclude_events: ['wasSentByApi'],
                                        }));
                                    }
                                }}
                            />
                            <Label htmlFor="advanced-options" className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Avançado
                            </Label>
                            <p className="text-sm text-gray-500">Selecionar eventos específicos e filtros de mensagens</p>
                        </div>

                        {/* Events Section */}
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
                                                    Clique em cada evento para ver detalhes. Eventos com ⚠️ geram alto volume de requisições.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="mb-2 text-sm text-gray-500">Clique nos eventos para selecioná-los. Passe o mouse para ver detalhes.</p>
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
                                                                {isHighVolume && !isSelected && <span className="text-[10px] font-semibold text-amber-600">⚠️</span>}
                                                                {isSelected && <IconCheck className="h-3 w-3" />}
                                                            </div>
                                                            {isHighVolume && <p className="mt-0.5 text-[10px] text-gray-600">Alto volume</p>}
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

                                {/* High volume warning */}
                                {formData.events.some((event) => highVolumeEvents.includes(event)) && (
                                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <div className="flex items-start gap-2">
                                            <IconX className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-900">⚠️ Eventos de alto volume selecionados</p>
                                                <div className="mt-1 space-y-1 text-xs text-amber-700">
                                                    {formData.events.includes('presence') && (
                                                        <p>
                                                            <strong>presence:</strong> Pode gerar milhares de webhooks por dia e sobrecarregar seu servidor.
                                                        </p>
                                                    )}
                                                    {formData.events.includes('history') && (
                                                        <p>
                                                            <strong>history:</strong> Pode enviar centenas de mensagens antigas de uma vez.
                                                        </p>
                                                    )}
                                                    <p className="mt-2 font-medium">⚠️ Use apenas se realmente necessário.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Default events summary */}
                        {!showAdvanced && (
                            <div className="space-y-3">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <IconCheck className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Eventos recomendados serão escutados</span>
                                    </div>
                                    <p className="mt-1 text-xs text-blue-600">{defaultEvents.join(', ')}</p>
                                    <p className="mt-2 text-xs text-gray-600">
                                        💡 Eventos de alto volume foram excluídos. Ative o modo Avançado se precisar deles.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <IconCheck className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Proteção contra loops ativada</span>
                                    </div>
                                    <p className="mt-1 text-xs text-green-700">
                                        Mensagens via API (<strong>wasSentByApi</strong>) filtradas automaticamente. Ative o modo Avançado para personalizar.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Exclude Messages Section */}
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
                                                <p className="text-xs">Use filtros para EXCLUIR mensagens específicas. Útil para evitar loops infinitos.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <div className="flex items-start gap-2">
                                        <IconCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                        <div>
                                            <p className="text-xs font-medium text-amber-900">Recomendado: wasSentByApi</p>
                                            <p className="mt-1 text-xs text-amber-700">
                                                Filtramos mensagens via API para evitar loops. Personalize os filtros abaixo.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="mb-3 text-sm text-gray-500">Selecione tipos de mensagem para EXCLUIR. Passe o mouse para detalhes.</p>
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
                                                                isSelected ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                            onClick={() => toggleEventSelection(filter, 'exclude_events')}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <span className="block text-xs font-medium">{filter}</span>
                                                                    {info && <span className="mt-0.5 block text-[10px] text-gray-500">{info.title}</span>}
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
                                                                {info.conflictsWith && (
                                                                    <div className="mt-2 rounded bg-amber-500/10 p-2">
                                                                        <p className="text-xs font-medium text-amber-200">⚠️ Mutuamente exclusivo com:</p>
                                                                        <code className="mt-1 block text-xs text-amber-300">{info.conflictsWith}</code>
                                                                        <p className="mt-1 text-[10px] text-gray-400">
                                                                            Ao selecionar este filtro, o conflitante será automaticamente desmarcado
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        );
                                    })}
                                </div>

                                {/* Active filters info */}
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

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleSave} disabled={isLoading || !formData.url}>
                            {isLoading ? 'Salvando...' : webhook ? 'Atualizar Webhook' : 'Criar Webhook'}
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
