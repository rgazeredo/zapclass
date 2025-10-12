import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Webhook {
    id: number;
    url: string;
    events: string[];
}

interface WhatsAppConnection {
    id: number;
}

interface WebhookDeleteDialogProps {
    webhook: Webhook | null;
    connection: WhatsAppConnection;
    onClose: () => void;
    onDeleted: () => void;
}

export function WebhookDeleteDialog({ webhook, connection, onClose, onDeleted }: WebhookDeleteDialogProps) {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        return token || '';
    };

    const handleDelete = async () => {
        if (!webhook) return;

        setIsDeleting(true);

        try {
            const config = {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };

            const response = await axios.delete(`/whatsapp/${connection.id}/webhooks/${webhook.id}`, config);

            if (response.data.success) {
                onDeleted();
            } else {
                throw new Error(response.data.message || t('whatsapp.errorDeletingWebhook'));
            }
        } catch (error) {
            console.error('Error deleting webhook:', error);
            toast.error(t('whatsapp.errorDeletingWebhook'), {
                duration: 5000,
                description: error instanceof Error ? error.message : t('whatsapp.unknownError'),
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={!!webhook} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('whatsapp.webhookDelete.confirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p>{t('whatsapp.webhookDelete.confirmDescription')}</p>
                        {webhook && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <code className="text-sm font-medium text-red-900">{webhook.url}</code>
                                {webhook.events && webhook.events.length > 0 && (
                                    <p className="mt-2 text-xs text-red-700">
                                        {t('whatsapp.webhookDelete.events')} <strong>{webhook.events.join(', ')}</strong>
                                    </p>
                                )}
                            </div>
                        )}
                        <p className="text-sm text-gray-600">
                            {t('whatsapp.webhookDelete.warningDescription')}
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('whatsapp.webhookDelete.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? t('whatsapp.webhookDelete.deleting') : t('whatsapp.webhookDelete.deleteButton')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
