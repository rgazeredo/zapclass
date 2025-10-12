import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { IconArrowLeft, IconEdit, IconPlus, IconTrash, IconWebhook } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WebhookDeleteDialog } from './WebhookDeleteDialog';
import { WebhookFormModal } from './WebhookFormModal';

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
    system_name: string;
    phone?: string;
    status?: string;
}

interface Props {
    connection: WhatsAppConnection;
}

export default function WebhooksIndex({ connection }: Props) {
    const { t } = useTranslation();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [webhookToDelete, setWebhookToDelete] = useState<Webhook | null>(null);

    const loadWebhooks = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/whatsapp/${connection.id}/webhooks`);

            if (response.data.success) {
                setWebhooks(response.data.webhooks);
            } else {
                throw new Error(response.data.message || t('whatsapp.webhooksIndex.errorLoading'));
            }
        } catch (error) {
            console.error('Error loading webhooks:', error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : t('whatsapp.webhooksIndex.errorLoading');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWebhooks();
    }, [connection.id]);

    const handleAddWebhook = () => {
        setEditingWebhook(null);
        setIsFormModalOpen(true);
    };

    const handleEditWebhook = (webhook: Webhook) => {
        setEditingWebhook(webhook);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingWebhook(null);
    };

    const handleWebhookSaved = () => {
        loadWebhooks();
        handleCloseFormModal();
    };

    const handleDeleteConfirm = async () => {
        if (!webhookToDelete) return;
        await loadWebhooks();
        setWebhookToDelete(null);
    };

    return (
        <AppLayout>
            <Head title={t('whatsapp.webhooksIndex.pageTitle', { name: connection.name })} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/whatsapp')}>
                            <IconArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <IconWebhook className="h-6 w-6 text-primary" />
                                <h1 className="text-2xl font-bold">{t('whatsapp.webhooksIndex.heading')}</h1>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('whatsapp.webhooksIndex.connection')} <strong>{connection.name}</strong> ({connection.system_name})
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleAddWebhook}>
                        <IconPlus className="mr-2 h-4 w-4" />
                        {t('whatsapp.webhooksIndex.addWebhook')}
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Webhooks List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                                    <p className="text-sm text-muted-foreground">{t('whatsapp.webhooksIndex.loading')}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : webhooks.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <IconWebhook className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">{t('whatsapp.webhooksIndex.noWebhooks')}</h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {t('whatsapp.webhooksIndex.noWebhooksDescription')}
                                </p>
                                <Button onClick={handleAddWebhook}>
                                    <IconPlus className="mr-2 h-4 w-4" />
                                    {t('whatsapp.webhooksIndex.addFirstWebhook')}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        webhooks.map((webhook) => (
                            <Card key={webhook.id} className="transition-shadow hover:shadow-md">
                                <CardContent>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* URL and Status Badges */}
                                            <div className="mb-3 flex items-center gap-2">
                                                <code className="rounded bg-muted px-3 py-1.5 text-sm font-medium">{webhook.url}</code>
                                                <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                                                    {webhook.enabled ? t('whatsapp.webhooksIndex.enabled') : t('whatsapp.webhooksIndex.disabled')}
                                                </Badge>
                                                <Badge variant={webhook.synced ? 'default' : 'destructive'}>
                                                    {webhook.synced ? t('whatsapp.webhooksIndex.synced') : t('whatsapp.webhooksIndex.notSynced')}
                                                </Badge>
                                            </div>

                                            {/* Events */}
                                            <div className="space-y-2">
                                                {webhook.events && webhook.events.length > 0 && (
                                                    <div>
                                                        <span className="text-xs font-medium text-muted-foreground">{t('whatsapp.webhooksIndex.events')}</span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {webhook.events.map((event) => (
                                                                <Badge key={event} variant="outline" className="text-xs">
                                                                    {event}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {webhook.exclude_events && webhook.exclude_events.length > 0 && (
                                                    <div>
                                                        <span className="text-xs font-medium text-muted-foreground">{t('whatsapp.webhooksIndex.filters')}</span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {webhook.exclude_events.map((event) => (
                                                                <Badge key={event} variant="outline" className="bg-red-50 text-xs text-red-700">
                                                                    {event}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Metadata */}
                                            <div className="mt-3 text-xs text-muted-foreground">
                                                {t('whatsapp.webhooksIndex.createdAt')} {new Date(webhook.created_at).toLocaleString('pt-BR')}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="ml-4 flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditWebhook(webhook)}>
                                                <IconEdit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setWebhookToDelete(webhook)}>
                                                <IconTrash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Form Modal */}
            <WebhookFormModal
                open={isFormModalOpen}
                onClose={handleCloseFormModal}
                connection={connection}
                webhook={editingWebhook}
                onSaved={handleWebhookSaved}
            />

            {/* Delete Dialog */}
            <WebhookDeleteDialog
                webhook={webhookToDelete}
                connection={connection}
                onClose={() => setWebhookToDelete(null)}
                onDeleted={handleDeleteConfirm}
            />
        </AppLayout>
    );
}
