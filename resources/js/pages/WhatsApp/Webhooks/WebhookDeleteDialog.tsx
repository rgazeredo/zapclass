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
                throw new Error(response.data.message || 'Erro ao deletar webhook');
            }
        } catch (error) {
            console.error('Error deleting webhook:', error);
            alert('Erro ao deletar webhook. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={!!webhook} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p>Tem certeza que deseja excluir este webhook?</p>
                        {webhook && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <code className="text-sm font-medium text-red-900">{webhook.url}</code>
                                {webhook.events && webhook.events.length > 0 && (
                                    <p className="mt-2 text-xs text-red-700">
                                        Eventos: <strong>{webhook.events.join(', ')}</strong>
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
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? 'Excluindo...' : 'Excluir Webhook'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
