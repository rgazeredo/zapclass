import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type WhatsAppConnection } from '@/types';
import { router } from '@inertiajs/react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FormConnectionModalProps {
    open: boolean;
    onClose: () => void;
    connection?: WhatsAppConnection; // Se undefined = criar, se definido = editar
}

export function FormConnectionModal({ open, onClose, connection }: FormConnectionModalProps) {
    const { t } = useTranslation();
    const isEditing = !!connection;

    const [formData, setFormData] = useState({
        name: '',
        system_name: '',
        admin_field_1: '',
        admin_field_2: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Preencher form quando é edição
    useEffect(() => {
        if (connection) {
            setFormData({
                name: connection.name,
                system_name: connection.system_name,
                admin_field_1: connection.admin_field_1 || '',
                admin_field_2: connection.admin_field_2 || '',
            });
        } else {
            // Limpar form quando é criação
            setFormData({
                name: '',
                system_name: '',
                admin_field_1: '',
                admin_field_2: '',
            });
        }
    }, [connection, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (isEditing) {
            // Editar conexão existente
            router.patch(`/whatsapp/${connection.id}`, formData, {
                onSuccess: () => {
                    onClose();
                },
                onError: (errors) => {
                    console.error('Form errors:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } else {
            // Criar nova conexão
            router.post('/whatsapp', formData, {
                onSuccess: () => {
                    onClose();
                },
                onError: (errors) => {
                    console.error('Form errors:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
                        {isEditing ? t('whatsapp.editConnection') : t('whatsapp.createConnection')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? `Edite os dados da conexão ${connection.name}`
                            : 'Preencha os dados para criar uma nova conexão WhatsApp'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="name">{t('whatsapp.connectionName')} *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ex: WhatsApp Principal"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="system_name">{t('whatsapp.systemName')} *</Label>
                            <Input
                                id="system_name"
                                type="text"
                                value={formData.system_name}
                                onChange={(e) => handleInputChange('system_name', e.target.value)}
                                placeholder="Ex: whatsapp_main"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="admin_field_1">{t('whatsapp.adminField1')}</Label>
                            <Input
                                id="admin_field_1"
                                type="text"
                                value={formData.admin_field_1}
                                onChange={(e) => handleInputChange('admin_field_1', e.target.value)}
                                placeholder="Campo administrativo opcional"
                            />
                        </div>

                        <div>
                            <Label htmlFor="admin_field_2">{t('whatsapp.adminField2')}</Label>
                            <Input
                                id="admin_field_2"
                                type="text"
                                value={formData.admin_field_2}
                                onChange={(e) => handleInputChange('admin_field_2', e.target.value)}
                                placeholder="Campo administrativo opcional"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : t('whatsapp.save')}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('whatsapp.cancel')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}