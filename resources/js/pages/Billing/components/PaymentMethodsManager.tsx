import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { IconCreditCard, IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
import { toast } from 'sonner';

interface PaymentMethod {
    id: string;
    type: string;
    brand: string | null;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
}

interface Tenant {
    id: number;
    name: string;
    stripe_id: string | null;
}

interface PaymentMethodsManagerProps {
    paymentMethods: PaymentMethod[];
    defaultPaymentMethod: PaymentMethod | null;
    tenant: Tenant;
}

export default function PaymentMethodsManager({
    paymentMethods,
    defaultPaymentMethod,
    tenant,
}: PaymentMethodsManagerProps) {
    const { t } = useTranslation();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getBrandIcon = (brand: string | null) => {
        // You can add specific brand icons here
        return <IconCreditCard className="w-6 h-6" />;
    };

    const handleSetDefault = (paymentMethodId: string) => {
        router.put(
            '/billing/payment-method/default',
            { payment_method: paymentMethodId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash
                },
            }
        );
    };

    const handleRemove = (paymentMethodId: string) => {
        router.delete('/billing/payment-method', {
            data: { payment_method: paymentMethodId },
            preserveScroll: true,
            onSuccess: () => {
                // Success message will be shown via flash
            },
        });
    };

    const handleAddPaymentMethod = async () => {
        setIsLoading(true);

        try {
            // Get setup intent from backend
            const response = await fetch('/billing/setup-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
            });

            const data = await response.json();

            if (data.client_secret) {
                // Redirect to Stripe's hosted page or implement Stripe Elements here
                // For simplicity, we'll show a message
                toast.info(t('billing.paymentMethods.stripeRedirectToast'), {
                    duration: 5000,
                });
                // In a real implementation, you would use Stripe Elements here
            }
        } catch (error) {
            console.error('Error creating setup intent:', error);
            toast.error(t('billing.paymentMethods.errorCreatingMethod'), {
                duration: 5000,
                description: error instanceof Error ? error.message : t('whatsapp.unknownError'),
            });
        } finally {
            setIsLoading(false);
            setIsAddDialogOpen(false);
        }
    };

    if (!tenant.stripe_id) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                    {t('billing.paymentMethods.accountNotConfigured')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {paymentMethods.length > 0
                        ? t('billing.paymentMethods.youHaveMethods', { count: paymentMethods.length })
                        : t('billing.paymentMethods.noMethods')}
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="w-4 h-4 mr-2" />
                            {t('billing.paymentMethods.addMethod')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('billing.paymentMethods.addMethod')}</DialogTitle>
                            <DialogDescription>
                                {t('billing.paymentMethods.addNewCard')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('billing.paymentMethods.stripeRedirectInfo')}
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                                disabled={isLoading}
                            >
                                {t('billing.paymentMethods.cancel')}
                            </Button>
                            <Button onClick={handleAddPaymentMethod} disabled={isLoading}>
                                {isLoading ? t('billing.paymentMethods.processing') : t('billing.paymentMethods.continue')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {paymentMethods.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <IconCreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('billing.paymentMethods.noMethods')}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        {t('billing.paymentMethods.addCardPrompt')}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {paymentMethods.map((pm) => (
                        <Card
                            key={pm.id}
                            className={
                                defaultPaymentMethod?.id === pm.id
                                    ? 'border-primary border-2'
                                    : ''
                            }
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {getBrandIcon(pm.brand)}
                                        <div>
                                            <CardTitle className="text-base">
                                                {pm.brand?.toUpperCase() || t('billing.paymentMethods.card')} •••• {pm.last4}
                                            </CardTitle>
                                            <CardDescription>
                                                {t('billing.paymentMethods.expiresIn')} {pm.exp_month}/{pm.exp_year}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {defaultPaymentMethod?.id === pm.id && (
                                        <Badge variant="default" className="bg-green-500">
                                            <IconCheck className="w-3 h-3 mr-1" />
                                            {t('billing.paymentMethods.default')}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex gap-2">
                                    {defaultPaymentMethod?.id !== pm.id && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleSetDefault(pm.id)}
                                        >
                                            {t('billing.paymentMethods.setAsDefault')}
                                        </Button>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className={defaultPaymentMethod?.id !== pm.id ? '' : 'flex-1'}
                                            >
                                                <IconTrash className="w-4 h-4 mr-2" />
                                                {t('billing.paymentMethods.remove')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {t('billing.paymentMethods.removeMethodTitle')}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('billing.paymentMethods.removeMethodDescription')}
                                                    {defaultPaymentMethod?.id === pm.id && (
                                                        <span className="block mt-2 text-yellow-600 dark:text-yellow-500 font-medium">
                                                            {t('billing.paymentMethods.removeDefaultWarning')}
                                                        </span>
                                                    )}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('billing.paymentMethods.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemove(pm.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {t('billing.paymentMethods.yesRemove')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
