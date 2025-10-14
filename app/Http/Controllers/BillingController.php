<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Invoice;
use Stripe\PaymentMethod;
use Stripe\SetupIntent;

class BillingController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('cashier.secret'));
    }

    /**
     * Display billing overview page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return redirect()->route('dashboard')
                ->with('error', 'Tenant não encontrado');
        }

        // Get all subscriptions
        $subscriptions = $tenant->subscriptions()
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'stripe_id' => $subscription->stripe_id,
                    'type' => $subscription->type,
                    'status' => $subscription->stripe_status,
                    'stripe_price' => $subscription->stripe_price,
                    'quantity' => $subscription->quantity,
                    'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
                    'ends_at' => $subscription->ends_at?->toISOString(),
                    'created_at' => $subscription->created_at->toISOString(),
                    'is_active' => $subscription->active(),
                    'on_trial' => $subscription->onTrial(),
                    'cancelled' => $subscription->canceled(),
                    'on_grace_period' => $subscription->onGracePeriod(),
                ];
            });

        // Get payment methods
        $paymentMethods = [];
        $defaultPaymentMethod = null;

        if ($tenant->hasStripeId()) {
            try {
                $stripePaymentMethods = $tenant->paymentMethods();
                $paymentMethods = collect($stripePaymentMethods)->map(function ($pm) {
                    return [
                        'id' => $pm->id,
                        'type' => $pm->type,
                        'brand' => $pm->card->brand ?? null,
                        'last4' => $pm->card->last4 ?? null,
                        'exp_month' => $pm->card->exp_month ?? null,
                        'exp_year' => $pm->card->exp_year ?? null,
                    ];
                })->toArray();

                $defaultPaymentMethod = $tenant->defaultPaymentMethod();
                if ($defaultPaymentMethod) {
                    $defaultPaymentMethod = [
                        'id' => $defaultPaymentMethod->id,
                        'type' => $defaultPaymentMethod->type,
                        'brand' => $defaultPaymentMethod->card->brand ?? null,
                        'last4' => $defaultPaymentMethod->card->last4 ?? null,
                        'exp_month' => $defaultPaymentMethod->card->exp_month ?? null,
                        'exp_year' => $defaultPaymentMethod->card->exp_year ?? null,
                    ];
                }
            } catch (\Exception $e) {
                // Silently fail if there's an issue fetching payment methods
            }
        }

        // Get invoices (payment history)
        $invoices = [];
        if ($tenant->hasStripeId()) {
            try {
                $stripeInvoices = Invoice::all([
                    'customer' => $tenant->stripe_id,
                    'limit' => 20,
                ]);

                $invoices = collect($stripeInvoices->data)->map(function ($invoice) {
                    return [
                        'id' => $invoice->id,
                        'number' => $invoice->number,
                        'amount_paid' => $invoice->amount_paid / 100, // Convert from cents
                        'amount_due' => $invoice->amount_due / 100,
                        'currency' => strtoupper($invoice->currency),
                        'status' => $invoice->status,
                        'created' => date('Y-m-d H:i:s', $invoice->created),
                        'hosted_invoice_url' => $invoice->hosted_invoice_url,
                        'invoice_pdf' => $invoice->invoice_pdf,
                    ];
                })->toArray();
            } catch (\Exception $e) {
                // Silently fail if there's an issue fetching invoices
            }
        }

        return Inertia::render('Billing/Index', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'stripe_id' => $tenant->stripe_id,
            ],
            'subscriptions' => $subscriptions,
            'paymentMethods' => $paymentMethods,
            'defaultPaymentMethod' => $defaultPaymentMethod,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Create a setup intent for adding payment method
     */
    public function createSetupIntent(Request $request)
    {
        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return response()->json(['error' => 'Tenant não encontrado'], 404);
        }

        try {
            $setupIntent = $tenant->createSetupIntent();

            return response()->json([
                'client_secret' => $setupIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao criar setup intent: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a new payment method
     */
    public function addPaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return back()->with('error', 'Tenant não encontrado');
        }

        try {
            $tenant->addPaymentMethod($request->payment_method);

            return back()->with('success', 'Método de pagamento adicionado com sucesso');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao adicionar método de pagamento: ' . $e->getMessage());
        }
    }

    /**
     * Update default payment method
     */
    public function updateDefaultPaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return back()->with('error', 'Tenant não encontrado');
        }

        try {
            $tenant->updateDefaultPaymentMethod($request->payment_method);

            return back()->with('success', 'Método de pagamento padrão atualizado com sucesso');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao atualizar método de pagamento: ' . $e->getMessage());
        }
    }

    /**
     * Remove a payment method
     */
    public function removePaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return back()->with('error', 'Tenant não encontrado');
        }

        try {
            $paymentMethod = PaymentMethod::retrieve($request->payment_method);
            $paymentMethod->detach();

            return back()->with('success', 'Método de pagamento removido com sucesso');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao remover método de pagamento: ' . $e->getMessage());
        }
    }

    /**
     * Cancel a subscription
     */
    public function cancelSubscription(Request $request, $subscriptionId)
    {
        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return back()->with('error', 'Tenant não encontrado');
        }

        $subscription = $tenant->subscriptions()->where('id', $subscriptionId)->first();

        if (!$subscription) {
            return back()->with('error', 'Assinatura não encontrada');
        }

        try {
            $subscription->cancel();

            return back()->with('success', 'Assinatura cancelada com sucesso. Você continuará tendo acesso até o final do período pago.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao cancelar assinatura: ' . $e->getMessage());
        }
    }

    /**
     * Resume a cancelled subscription
     */
    public function resumeSubscription(Request $request, $subscriptionId)
    {
        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant) {
            return back()->with('error', 'Tenant não encontrado');
        }

        $subscription = $tenant->subscriptions()->where('id', $subscriptionId)->first();

        if (!$subscription) {
            return back()->with('error', 'Assinatura não encontrada');
        }

        try {
            $subscription->resume();

            return back()->with('success', 'Assinatura reativada com sucesso.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao reativar assinatura: ' . $e->getMessage());
        }
    }

    /**
     * Download invoice PDF
     */
    public function downloadInvoice(Request $request, $invoiceId)
    {
        $user = Auth::user();
        $tenant = $user->tenant;

        if (!$tenant || !$tenant->hasStripeId()) {
            return back()->with('error', 'Tenant não encontrado');
        }

        try {
            return $tenant->downloadInvoice($invoiceId, [
                'vendor' => config('app.name'),
                'product' => 'Assinatura',
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao baixar fatura: ' . $e->getMessage());
        }
    }
}
