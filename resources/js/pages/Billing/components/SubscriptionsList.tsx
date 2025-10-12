import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

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

interface SubscriptionsListProps {
    subscriptions: Subscription[];
}

export default function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
    const { t } = useTranslation();

    const getStatusBadge = (subscription: Subscription) => {
        if (subscription.on_trial) {
            return <Badge variant="secondary">{t('billing.subscriptionsList.statusOnTrial')}</Badge>;
        }

        if (subscription.cancelled && subscription.on_grace_period) {
            return <Badge variant="destructive">{t('billing.subscriptionsList.statusCancelledGrace')}</Badge>;
        }

        if (subscription.cancelled) {
            return <Badge variant="destructive">{t('billing.subscriptionsList.statusCancelled')}</Badge>;
        }

        switch (subscription.status) {
            case 'active':
                return <Badge variant="default" className="bg-green-500">{t('billing.subscriptionsList.statusActive')}</Badge>;
            case 'past_due':
                return <Badge variant="destructive">{t('billing.subscriptionsList.statusPastDue')}</Badge>;
            case 'unpaid':
                return <Badge variant="destructive">{t('billing.subscriptionsList.statusUnpaid')}</Badge>;
            case 'incomplete':
                return <Badge variant="secondary">{t('billing.subscriptionsList.statusIncomplete')}</Badge>;
            default:
                return <Badge variant="secondary">{subscription.status}</Badge>;
        }
    };

    const handleCancelSubscription = (subscriptionId: number) => {
        router.post(
            `/billing/subscription/${subscriptionId}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash
                },
            }
        );
    };

    const handleResumeSubscription = (subscriptionId: number) => {
        router.post(
            `/billing/subscription/${subscriptionId}/resume`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash
                },
            }
        );
    };

    if (subscriptions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                    {t('billing.subscriptionsList.noSubscriptions')}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('billing.subscriptionsList.tableHeaders.type')}</TableHead>
                        <TableHead>{t('billing.subscriptionsList.tableHeaders.status')}</TableHead>
                        <TableHead>{t('billing.subscriptionsList.tableHeaders.startDate')}</TableHead>
                        <TableHead>{t('billing.subscriptionsList.tableHeaders.trialEnd')}</TableHead>
                        <TableHead>{t('billing.subscriptionsList.tableHeaders.endDate')}</TableHead>
                        <TableHead className="text-right">{t('billing.subscriptionsList.tableHeaders.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                            <TableCell className="font-medium">
                                {subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)}
                            </TableCell>
                            <TableCell>{getStatusBadge(subscription)}</TableCell>
                            <TableCell>
                                {format(new Date(subscription.created_at), 'dd/MM/yyyy', {
                                    locale: ptBR,
                                })}
                            </TableCell>
                            <TableCell>
                                {subscription.trial_ends_at
                                    ? format(new Date(subscription.trial_ends_at), 'dd/MM/yyyy', {
                                          locale: ptBR,
                                      })
                                    : '-'}
                            </TableCell>
                            <TableCell>
                                {subscription.ends_at
                                    ? format(new Date(subscription.ends_at), 'dd/MM/yyyy', {
                                          locale: ptBR,
                                      })
                                    : '-'}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                {subscription.cancelled && subscription.on_grace_period ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleResumeSubscription(subscription.id)}
                                    >
                                        {t('billing.subscriptionsList.resumeButton')}
                                    </Button>
                                ) : subscription.is_active && !subscription.cancelled ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                {t('billing.subscriptionsList.cancelButton')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {t('billing.subscriptionsList.cancelDialogTitle')}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('billing.subscriptionsList.cancelDialogDescription')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('billing.subscriptionsList.cancelDialogBack')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleCancelSubscription(subscription.id)
                                                    }
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {t('billing.subscriptionsList.cancelDialogConfirm')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
