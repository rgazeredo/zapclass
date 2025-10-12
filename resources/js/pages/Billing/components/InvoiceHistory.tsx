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
import { IconDownload, IconExternalLink, IconReceipt } from '@tabler/icons-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

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

interface InvoiceHistoryProps {
    invoices: Invoice[];
}

export default function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
    const { t } = useTranslation();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="default" className="bg-green-500">{t('billing.invoiceHistory.statusPaid')}</Badge>;
            case 'open':
                return <Badge variant="secondary">{t('billing.invoiceHistory.statusOpen')}</Badge>;
            case 'void':
                return <Badge variant="destructive">{t('billing.invoiceHistory.statusVoid')}</Badge>;
            case 'uncollectible':
                return <Badge variant="destructive">{t('billing.invoiceHistory.statusUncollectible')}</Badge>;
            case 'draft':
                return <Badge variant="secondary">{t('billing.invoiceHistory.statusDraft')}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const handleDownload = (invoiceId: string) => {
        window.location.href = `/billing/invoice/${invoiceId}/download`;
    };

    if (invoices.length === 0) {
        return (
            <div className="text-center py-12">
                <IconReceipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                    {t('billing.invoiceHistory.noInvoices')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    {t('billing.invoiceHistory.noInvoicesDescription')}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('billing.invoiceHistory.tableHeaders.number')}</TableHead>
                        <TableHead>{t('billing.invoiceHistory.tableHeaders.date')}</TableHead>
                        <TableHead>{t('billing.invoiceHistory.tableHeaders.amount')}</TableHead>
                        <TableHead>{t('billing.invoiceHistory.tableHeaders.status')}</TableHead>
                        <TableHead className="text-right">{t('billing.invoiceHistory.tableHeaders.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                                {invoice.number || t('billing.invoiceHistory.invoiceNumber', { id: invoice.id.substring(0, 8) })}
                            </TableCell>
                            <TableCell>
                                {format(new Date(invoice.created), 'dd/MM/yyyy HH:mm', {
                                    locale: ptBR,
                                })}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {formatCurrency(invoice.amount_paid, invoice.currency)}
                                    </div>
                                    {invoice.amount_due > 0 && invoice.amount_due !== invoice.amount_paid && (
                                        <div className="text-xs text-gray-500">
                                            {t('billing.invoiceHistory.amountDue')} {formatCurrency(invoice.amount_due, invoice.currency)}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {invoice.hosted_invoice_url && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                                        >
                                            <IconExternalLink className="w-4 h-4 mr-2" />
                                            {t('billing.invoiceHistory.viewButton')}
                                        </Button>
                                    )}
                                    {invoice.invoice_pdf && invoice.status === 'paid' && (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleDownload(invoice.id)}
                                        >
                                            <IconDownload className="w-4 h-4 mr-2" />
                                            {t('billing.invoiceHistory.downloadButton')}
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t('billing.invoiceHistory.infoTitle')}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• {t('billing.invoiceHistory.infoList.automatic')}</li>
                    <li>• {t('billing.invoiceHistory.infoList.download')}</li>
                    <li>• {t('billing.invoiceHistory.infoList.failureNotification')}</li>
                    <li>• {t('billing.invoiceHistory.infoList.stripeStorage')}</li>
                </ul>
            </div>
        </div>
    );
}
