import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconLoader2, IconEye, IconEyeOff } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useHookForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { post, processing } = useForm();

    const registerSchema = z.object({
        name: z.string().min(1, t('auth.register.nameRequired')).min(2, t('auth.register.nameMinLength')),
        email: z.string().email(t('auth.register.emailInvalid')),
        password: z.string().min(8, t('auth.register.passwordMinLength')),
        password_confirmation: z.string(),
    }).refine((data) => data.password === data.password_confirmation, {
        message: t('auth.register.passwordsDontMatch'),
        path: ["password_confirmation"],
    });

    type RegisterFormValues = z.infer<typeof registerSchema>;

    const form = useHookForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = (data: any) => {
        post('/register', data);
    };

    return (
        <AuthLayout title={t('auth.register.title')} description={t('auth.register.description')}>
            <Head title={t('auth.register.pageTitle')} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('auth.register.nameLabel')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder={t('auth.register.namePlaceholder')}
                                            autoFocus
                                            autoComplete="name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('auth.register.emailLabel')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={t('auth.register.emailPlaceholder')}
                                            autoComplete="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('auth.register.passwordLabel')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={t('auth.register.passwordPlaceholder')}
                                                autoComplete="new-password"
                                                {...field}
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
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password_confirmation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('auth.register.confirmPasswordLabel')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <IconEyeOff className="h-4 w-4" />
                                                ) : (
                                                    <IconEye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('auth.register.createAccountButton')}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        {t('auth.register.haveAccount')}{' '}
                        <Link
                            href={login()}
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {t('auth.register.logIn')}
                        </Link>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    );
}
