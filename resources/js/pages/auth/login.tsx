import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconLoader2, IconEye, IconEyeOff } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useHookForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const loginSchema = z.object({
        email: z.string().email(t('auth.login.emailRequired')),
        password: z.string().min(1, t('auth.login.passwordRequired')),
        remember: z.boolean().optional().default(false),
    });

    type LoginFormValues = z.infer<typeof loginSchema>;

    const form = useHookForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const onSubmit = (formData: LoginFormValues) => {
        post('/login');
    };

    return (
        <AuthLayout title={t('auth.login.title')} description={t('auth.login.description')}>
            <Head title={t('auth.login.pageTitle')} />

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('auth.login.emailLabel')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={t('auth.login.emailPlaceholder')}
                                            autoFocus
                                            autoComplete="email"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setData('email', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center">
                                        <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
                                            >
                                                {t('auth.login.forgotPassword')}
                                            </Link>
                                        )}
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={t('auth.login.passwordPlaceholder')}
                                                autoComplete="current-password"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setData('password', e.target.value);
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <IconEyeOff className="h-4 w-4" />
                                                ) : (
                                                    <IconEye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remember"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                setData('remember', !!checked);
                                            }}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>{t('auth.login.rememberMe')}</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('auth.login.loginButton')}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        {t('auth.login.noAccount')}{' '}
                        <Link
                            href={register()}
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {t('auth.login.signUp')}
                        </Link>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    );
}
