import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconApi, IconCopy, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type WhatsAppConnection } from '@/types';

interface ApiDataModalProps {
    open: boolean;
    onClose: () => void;
    connection: WhatsAppConnection | null;
}

export function ApiDataModal({ open, onClose, connection }: ApiDataModalProps) {
    const { t } = useTranslation();
    const [showToken, setShowToken] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    // Dados da API (estes valores devem vir de configurações do sistema)
    const API_URL = 'https://w4digital.uazapi.com';

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            onClose();
        }
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyFeedback(`${type} copiado!`);
            setTimeout(() => setCopyFeedback(null), 2000);
        } catch (error) {
            setCopyFeedback('Erro ao copiar');
            setTimeout(() => setCopyFeedback(null), 2000);
        }
    };

    const maskToken = (token: string) => {
        if (!token) return '';
        const start = token.substring(0, 8);
        const end = token.substring(token.length - 8);
        const middle = '*'.repeat(Math.max(0, token.length - 16));
        return `${start}${middle}${end}`;
    };

    if (!connection) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconApi className="h-5 w-5 text-blue-600" />
                        {t('whatsapp.apiData')} - {connection.name}
                    </DialogTitle>
                    <DialogDescription>
                        {t('whatsapp.apiConnectionInfo')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* URL da API */}
                    <div className="space-y-2">
                        <Label htmlFor="api-url">{t('whatsapp.apiUrl')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="api-url"
                                value={API_URL}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(API_URL, 'URL')}
                                title={t('whatsapp.copyUrl')}
                            >
                                <IconCopy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Token da Instância */}
                    <div className="space-y-2">
                        <Label htmlFor="instance-token">{t('whatsapp.instanceToken')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="instance-token"
                                value={showToken ? (connection.token || 'Token não disponível') : maskToken(connection.token || '')}
                                readOnly
                                className="flex-1 font-mono text-sm"
                                type={showToken ? 'text' : 'password'}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowToken(!showToken)}
                                title={showToken ? t('whatsapp.hideToken') : t('whatsapp.showToken')}
                            >
                                {showToken ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(connection.token || '', t('whatsapp.token'))}
                                title={t('whatsapp.copyToken')}
                                disabled={!connection.token}
                            >
                                <IconCopy className="h-4 w-4" />
                            </Button>
                        </div>
                        {!connection.token && (
                            <p className="text-sm text-red-600">
                                {t('whatsapp.tokenNotAvailable')}
                            </p>
                        )}
                    </div>

                    {/* ID da Instância */}
                    {connection.instance_id && (
                        <div className="space-y-2">
                            <Label htmlFor="instance-id">{t('whatsapp.instanceId')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="instance-id"
                                    value={connection.instance_id}
                                    readOnly
                                    className="flex-1 font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(connection.instance_id || '', 'ID')}
                                    title={t('whatsapp.copyId')}
                                >
                                    <IconCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Informações Adicionais */}
                    <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                        <h4 className="font-medium text-blue-900">{t('whatsapp.connectionInfo')}</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p><strong>{t('whatsapp.status')}:</strong> {connection.status || t('whatsapp.notDefined')}</p>
                            {connection.phone && <p><strong>{t('whatsapp.phone')}:</strong> {connection.phone}</p>}
                            <p><strong>{t('whatsapp.system')}:</strong> {connection.system_name || 'ZapClass'}</p>
                            {connection.admin_field_1 && <p><strong>{t('whatsapp.adminField1')}:</strong> {connection.admin_field_1}</p>}
                            {connection.admin_field_2 && <p><strong>{t('whatsapp.adminField2')}:</strong> {connection.admin_field_2}</p>}
                        </div>
                    </div>

                    {/* Feedback de cópia */}
                    {copyFeedback && (
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="text-sm font-medium text-green-800">
                                ✓ {copyFeedback}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-4">
                    <Button onClick={() => handleOpenChange(false)}>
                        {t('whatsapp.close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}