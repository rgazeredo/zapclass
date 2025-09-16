import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type WhatsAppConnection } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WhatsAppEditProps {
    connection: WhatsAppConnection;
}

export default function WhatsAppEdit({ connection }: WhatsAppEditProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: connection.name,
        system_name: connection.system_name,
        admin_field_1: connection.admin_field_1 || '',
        admin_field_2: connection.admin_field_2 || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: '/dashboard',
        },
        {
            title: t('whatsapp.title'),
            href: '/whatsapp',
        },
        {
            title: t('whatsapp.editConnection'),
            href: `/whatsapp/${connection.id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.patch(`/whatsapp/${connection.id}`, formData, {
            onSuccess: () => {
                // Redirect handled by controller
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('whatsapp.editConnection')} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <IconBrandWhatsapp className="h-6 w-6 text-green-600" />
                    <h1 className="text-2xl font-bold">{t('whatsapp.editConnection')}</h1>
                </div>

                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>{connection.name}</CardTitle>
                            <CardDescription>
                                Edite os dados da conexão WhatsApp
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                    <Link href="/whatsapp">
                                        <Button type="button" variant="outline">
                                            {t('whatsapp.cancel')}
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}