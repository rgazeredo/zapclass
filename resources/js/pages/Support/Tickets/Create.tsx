import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconArrowLeft } from '@tabler/icons-react';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Props {
    categories: Category[];
}

export default function Create({ categories }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        subject: '',
        description: '',
        priority: 'medium',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/support/tickets');
    };

    return (
        <AppLayout>
            <Head title="Criar Novo Ticket" />

            <div className="container mx-auto py-8 px-4 max-w-3xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/support/tickets">
                            <IconArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para tickets
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Criar Novo Ticket</h1>
                    <p className="text-muted-foreground mt-1">
                        Descreva seu problema ou solicitação
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Ticket</CardTitle>
                        <CardDescription>
                            Preencha todos os campos para criar seu ticket de suporte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Categoria *</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(value) => setData('category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && (
                                    <p className="text-sm text-destructive">{errors.category_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) => setData('priority', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baixa</SelectItem>
                                        <SelectItem value="medium">Média</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.priority && (
                                    <p className="text-sm text-destructive">{errors.priority}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Assunto *</Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="Título breve do problema"
                                    className={errors.subject ? 'border-destructive' : ''}
                                />
                                {errors.subject && (
                                    <p className="text-sm text-destructive">{errors.subject}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Descreva detalhadamente o problema ou solicitação..."
                                    rows={8}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Mínimo de 10 caracteres
                                </p>
                            </div>

                            <div className="flex gap-4 justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/support/tickets">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Criando...' : 'Criar Ticket'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
