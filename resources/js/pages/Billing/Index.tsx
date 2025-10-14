import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionsList from './components/SubscriptionsList';
import PaymentMethodsManager from './components/PaymentMethodsManager';
import InvoiceHistory from './components/InvoiceHistory';

interface Subscription {
    id: number;
    stripe_id: string;
    type: string;
    status: string;
    stripe_price: string | null;
    quantity: number | null;
    trial_ends_at: string | null;
    ends_at: string | null;
    created_at: string;
    is_active: boolean;
    on_trial: boolean;
    cancelled: boolean;
    on_grace_period: boolean;
}

interface PaymentMethod {
    id: string;
    type: string;
    brand: string | null;
    last4: string | null;
    exp_month: number | null;
    exp_year: number | null;
}

interface Invoice {
    id: string;
    number: string;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: string;
    created: string;
    hosted_invoice_url: string;
    invoice_pdf: string;
}

interface Tenant {
    id: number;
    name: string;
    stripe_id: string | null;
}

interface BillingProps {
    tenant: Tenant;
    subscriptions: Subscription[];
    paymentMethods: PaymentMethod[];
    defaultPaymentMethod: PaymentMethod | null;
    invoices: Invoice[];
}

export default function BillingIndex({
    tenant,
    subscriptions,
    paymentMethods,
    defaultPaymentMethod,
    invoices,
}: BillingProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('subscriptions');

    return (
        <AppLayout>
            <Head title={t('billing.billingIndex.pageTitle')} />

            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {t('billing.billingIndex.heading')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {t('billing.billingIndex.description')}
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="subscriptions">{t('billing.billingIndex.tabSubscriptions')}</TabsTrigger>
                        <TabsTrigger value="payment-methods">{t('billing.billingIndex.tabPaymentMethods')}</TabsTrigger>
                        <TabsTrigger value="invoices">{t('billing.billingIndex.tabInvoices')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="subscriptions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('billing.subscriptionsList.title')}</CardTitle>
                                <CardDescription>
                                    {t('billing.subscriptionsList.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SubscriptionsList subscriptions={subscriptions} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payment-methods" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('billing.paymentMethods.title')}</CardTitle>
                                <CardDescription>
                                    {t('billing.paymentMethods.title')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PaymentMethodsManager
                                    paymentMethods={paymentMethods}
                                    defaultPaymentMethod={defaultPaymentMethod}
                                    tenant={tenant}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="invoices" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('billing.invoiceHistory.title')}</CardTitle>
                                <CardDescription>
                                    {t('billing.invoiceHistory.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InvoiceHistory invoices={invoices} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
