# Feature: Desconexão Automática de Instâncias em Assinaturas Vencidas

## Visão Geral

Esta feature implementa a desconexão automática de instâncias WhatsApp quando a assinatura de um tenant vence ou é cancelada.

## Componentes Implementados

### 1. Event Listeners (app/Listeners/)

#### HandleSubscriptionDeleted
- **Evento**: `customer.subscription.deleted` (Stripe Webhook)
- **Ação**: Dispara job de desconexão quando uma assinatura é deletada
- **Arquivo**: `app/Listeners/HandleSubscriptionDeleted.php`

#### HandleSubscriptionUpdated
- **Evento**: `customer.subscription.updated` (Stripe Webhook)
- **Ação**: Monitora mudanças de status e dispara desconexão quando status muda para inativo
- **Status inativos**: `canceled`, `unpaid`, `past_due`, `incomplete_expired`
- **Arquivo**: `app/Listeners/HandleSubscriptionUpdated.php`

### 2. Job de Desconexão (app/Jobs/)

#### DisconnectExpiredSubscriptionInstances
- **Função**: Desconecta todas as instâncias WhatsApp de um tenant
- **Características**:
  - 3 tentativas automáticas em caso de falha
  - Backoff progressivo: 30s, 60s, 120s
  - Desabilita API das instâncias
  - Atualiza status para `disconnected`
  - Desativa o tenant (`is_active = false`)
  - Logging detalhado de todas as operações
- **Arquivo**: `app/Jobs/DisconnectExpiredSubscriptionInstances.php`

### 3. Middlewares (app/Http/Middleware/)

#### CheckSubscriptionActive
- **Função**: Protege rotas web autenticadas
- **Verificações**:
  - Permite acesso durante período de trial
  - Requer assinatura ativa para acesso
  - Redireciona para página de billing se assinatura vencida
- **Arquivo**: `app/Http/Middleware/CheckSubscriptionActive.php`
- **Uso**: Adicionar às rotas: `->middleware(['auth', 'subscription.active'])`

#### ApiAuthentication (Atualizado)
- **Nova verificação**: Bloqueia chamadas de API se assinatura vencida
- **HTTP Status**: 402 Payment Required
- **Arquivo**: `app/Http/Middleware/ApiAuthentication.php`

### 4. Command Artisan (app/Console/Commands/)

#### subscriptions:disconnect-expired
- **Função**: Processa manualmente assinaturas vencidas
- **Opções**:
  - `--tenant=ID`: Processar tenant específico
  - `--dry-run`: Simular sem realizar alterações
- **Uso dentro do container**:
```bash
docker-compose exec app php artisan subscriptions:disconnect-expired
docker-compose exec app php artisan subscriptions:disconnect-expired --dry-run
docker-compose exec app php artisan subscriptions:disconnect-expired --tenant=123
```
- **Arquivo**: `app/Console/Commands/DisconnectExpiredSubscriptions.php`

## Configuração

### 1. Webhook do Stripe

Configure o webhook do Stripe para apontar para:
```
https://seu-dominio.com/stripe/webhook
```

**Eventos necessários**:
- `customer.subscription.deleted`
- `customer.subscription.updated`

**Configuração no Stripe Dashboard**:
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/stripe/webhook`
4. Selecione os eventos listados acima
5. Copie o "Signing secret" e adicione ao `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 2. Configuração de Fila (Queue)

O Job de desconexão usa filas. Configure no `.env`:

```env
QUEUE_CONNECTION=database
# ou
QUEUE_CONNECTION=redis
```

**Iniciar worker** (dentro do container):
```bash
docker-compose exec app php artisan queue:work
```

**Para produção**, use supervisor ou similar para manter o worker rodando.

### 3. Cron Job (Opcional - Backup)

Adicione ao cron para processar assinaturas caso webhooks falhem:

```cron
# Verificar assinaturas vencidas a cada hora
0 * * * * cd /var/www && php artisan subscriptions:disconnect-expired >> /dev/null 2>&1
```

**No Laravel**, adicione ao `routes/console.php`:
```php
Schedule::command('subscriptions:disconnect-expired')
    ->hourly()
    ->withoutOverlapping();
```

## Fluxo de Funcionamento

### Cenário 1: Assinatura Vencida via Webhook

1. Stripe envia webhook `customer.subscription.deleted` ou `customer.subscription.updated`
2. Laravel Cashier processa webhook e dispara evento `WebhookReceived`
3. Listener detecta o evento e verifica o tipo
4. Job `DisconnectExpiredSubscriptionInstances` é adicionado à fila
5. Worker processa o job:
   - Verifica se tenant realmente não tem assinatura ativa
   - Busca todas instâncias conectadas do tenant
   - Chama `UazApiService::disconnectInstance()` para cada instância
   - Atualiza status no banco para `disconnected`
   - Desabilita API das instâncias
   - Desativa o tenant
6. Logs são gerados em cada etapa

### Cenário 2: Usuário Tenta Usar API com Assinatura Vencida

1. Cliente faz request para `/api/v1/*` com API key
2. Middleware `ApiAuthentication` valida token
3. Middleware verifica se tenant tem assinatura ativa
4. Se vencida, retorna HTTP 402 com mensagem de erro
5. Log de tentativa é gerado

### Cenário 3: Usuário Tenta Acessar Dashboard com Assinatura Vencida

1. Usuário acessa rota protegida com middleware `subscription.active`
2. Middleware verifica assinatura
3. Se vencida, redireciona para `/billing` com mensagem
4. Usuário pode renovar assinatura na página de billing

## Testando a Implementação

### 1. Testar Command Artisan

```bash
# Modo dry-run (não faz alterações)
docker-compose exec app php artisan subscriptions:disconnect-expired --dry-run

# Processar realmente
docker-compose exec app php artisan subscriptions:disconnect-expired
```

### 2. Testar Webhook Localmente

Use o Stripe CLI para simular webhooks:

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks para local
stripe listen --forward-to http://localhost/stripe/webhook

# Simular evento
stripe trigger customer.subscription.deleted
stripe trigger customer.subscription.updated
```

### 3. Testar Middleware de API

```bash
# Com assinatura ativa (deve funcionar)
curl -X GET http://localhost/api/v1/check \
  -H "Authorization: Bearer zc_..."

# Com assinatura vencida (deve retornar 402)
# (Primeiro cancelar assinatura no Stripe ou usar tenant sem assinatura)
curl -X GET http://localhost/api/v1/check \
  -H "Authorization: Bearer zc_..."
```

### 4. Verificar Logs

```bash
# Logs Laravel
docker-compose exec app tail -f storage/logs/laravel.log

# Filtrar logs específicos
docker-compose exec app grep "subscription" storage/logs/laravel.log
docker-compose exec app grep "Desconectando instâncias" storage/logs/laravel.log
```

## Estrutura de Logs

Todos os logs seguem um padrão estruturado para facilitar monitoramento:

```
[INFO] Processando webhook subscription.deleted
  - subscription_id: sub_xxx

[INFO] Job de desconexão disparado
  - tenant_id: 123
  - subscription_id: sub_xxx

[INFO] Iniciando desconexão de instâncias por assinatura vencida
  - tenant_id: 123

[INFO] Desconectando instâncias
  - tenant_id: 123
  - total_connections: 3

[INFO] Instância desconectada com sucesso
  - connection_id: 456
  - connection_name: "Conexão Principal"
  - tenant_id: 123

[INFO] Processo de desconexão finalizado
  - tenant_id: 123
  - total_connections: 3
  - success_count: 3
  - error_count: 0
```

## Aplicando o Middleware nas Rotas

### Rotas Web (routes/web.php)

```php
// Proteger grupo de rotas
Route::middleware(['auth', 'subscription.active'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/whatsapp', [WhatsAppController::class, 'index']);
    // ... outras rotas
});
```

### Rotas API (routes/api.php)

O middleware já está aplicado automaticamente em `ApiAuthentication`.

## Monitoramento e Alertas

### Métricas Importantes

1. **Número de jobs falhados** - Indica problemas na API UazAPI
2. **Tempo de processamento** - Jobs demorados podem indicar problemas
3. **Taxa de erro por tenant** - Identificar tenants problemáticos

### Queries Úteis

```sql
-- Tenants com assinatura vencida e instâncias ativas
SELECT t.id, t.name, COUNT(wc.id) as active_connections
FROM tenants t
LEFT JOIN whatsapp_connections wc ON wc.tenant_id = t.id AND wc.status = 'connected'
WHERE t.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.tenant_id = t.id
    AND s.stripe_status = 'active'
  )
GROUP BY t.id, t.name
HAVING COUNT(wc.id) > 0;

-- Últimas desconexões (via activity log se implementado)
SELECT * FROM activity_log
WHERE description LIKE '%desconecta%'
ORDER BY created_at DESC
LIMIT 20;
```

## Troubleshooting

### Job não está sendo processado

```bash
# Verificar se worker está rodando
docker-compose exec app php artisan queue:work --once

# Verificar jobs falhados
docker-compose exec app php artisan queue:failed

# Reprocessar job falhado
docker-compose exec app php artisan queue:retry {id}
```

### Webhook não está chegando

1. Verifique URL no dashboard do Stripe
2. Verifique `STRIPE_WEBHOOK_SECRET` no `.env`
3. Teste com Stripe CLI: `stripe listen --forward-to ...`
4. Verifique logs do webhook no Stripe Dashboard

### Instância não desconecta

1. Verifique logs: `docker-compose exec app tail -f storage/logs/laravel.log`
2. Verifique se UazAPI está respondendo
3. Verifique token da instância no banco
4. Tente desconectar manualmente via UazApiService

## Rollback

Se precisar reverter a feature:

```bash
git checkout main
```

## Próximos Passos

- [ ] Adicionar notificação por email antes de desconectar
- [ ] Implementar grace period de X dias após vencimento
- [ ] Dashboard de monitoramento de assinaturas
- [ ] Webhook status endpoint para Stripe validar configuração
- [ ] Testes automatizados (Unit e Feature tests)

## Arquivos Modificados/Criados

```
app/
├── Console/Commands/
│   └── DisconnectExpiredSubscriptions.php        [NOVO]
├── Http/Middleware/
│   ├── ApiAuthentication.php                     [MODIFICADO]
│   └── CheckSubscriptionActive.php               [NOVO]
├── Jobs/
│   └── DisconnectExpiredSubscriptionInstances.php [NOVO]
├── Listeners/
│   ├── HandleSubscriptionDeleted.php             [NOVO]
│   └── HandleSubscriptionUpdated.php             [NOVO]
└── Providers/
    └── EventServiceProvider.php                  [NOVO]

bootstrap/
├── app.php                                       [MODIFICADO]
└── providers.php                                 [MODIFICADO]

FEATURE_AUTO_DISCONNECT_SUBSCRIPTIONS.md          [NOVO]
```

## Suporte

Para dúvidas ou problemas:
1. Verificar logs em `storage/logs/laravel.log`
2. Verificar webhooks no Stripe Dashboard
3. Usar command com `--dry-run` para simular
