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
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="default" className="bg-green-500">Pago</Badge>;
            case 'open':
                return <Badge variant="secondary">Em Aberto</Badge>;
            case 'void':
                return <Badge variant="destructive">Cancelado</Badge>;
            case 'uncollectible':
                return <Badge variant="destructive">Não Cobrável</Badge>;
            case 'draft':
                return <Badge variant="secondary">Rascunho</Badge>;
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
                    Nenhuma fatura encontrada
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Suas faturas aparecerão aqui assim que forem geradas
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                                {invoice.number || `Fatura ${invoice.id.substring(0, 8)}`}
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
                                            Devido: {formatCurrency(invoice.amount_due, invoice.currency)}
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
                                            Visualizar
                                        </Button>
                                    )}
                                    {invoice.invoice_pdf && invoice.status === 'paid' && (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleDownload(invoice.id)}
                                        >
                                            <IconDownload className="w-4 h-4 mr-2" />
                                            Download
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
                    Informações sobre as Faturas
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• As faturas são geradas automaticamente no início de cada ciclo de cobrança</li>
                    <li>• Você pode baixar o PDF das faturas pagas a qualquer momento</li>
                    <li>• Em caso de falha no pagamento, você receberá uma notificação por email</li>
                    <li>• Todas as faturas são armazenadas de forma segura no Stripe</li>
                </ul>
            </div>
        </div>
    );
}
