import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import { useForm as useHookForm } from 'react-hook-form';
import { useState } from 'react';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const { post, processing } = useForm();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.profile.title'),
            href: edit().url,
        },
    ];

    const profileSchema = z.object({
        name: z.string().min(1, t('settings.profile.nameRequired')).min(2, t('settings.profile.nameMinLength')),
        email: z.string().email(t('settings.profile.emailInvalid')),
    });

    type ProfileFormValues = z.infer<typeof profileSchema>;

    const form = useHookForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: auth.user.name || '',
            email: auth.user.email || '',
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        post(edit().url, {
            ...data,
            preserveScroll: true,
            onSuccess: () => {
                setRecentlySuccessful(true);
                setTimeout(() => setRecentlySuccessful(false), 2000);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.profile.pageTitle')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('settings.profile.heading')} description={t('settings.profile.description')} />

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('settings.profile.nameLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('settings.profile.namePlaceholder')}
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
                                        <FormLabel>{t('settings.profile.emailLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t('settings.profile.emailPlaceholder')}
                                                autoComplete="username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        {t('settings.profile.emailUnverified')}{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            {t('settings.profile.resendVerification')}
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            {t('settings.profile.verificationSent')}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing} data-test="update-profile-button">
                                    {processing && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('settings.profile.saveButton')}
                                </Button>

                                {recentlySuccessful && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <IconCheck className="h-4 w-4" />
                                        {t('settings.profile.saved')}
                                    </div>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
