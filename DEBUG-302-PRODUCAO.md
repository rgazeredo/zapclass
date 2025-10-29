# Debug do Erro 302 ao Criar Conexão WhatsApp

## Problema

Ao tentar criar uma nova conexão WhatsApp em produção, a request POST retorna status 302 (redirect) e a conexão não é criada.

## O que é o 302?

O status 302 é um redirect. O Laravel está redirecionando a requisição em vez de processar. Isso pode acontecer por:

1. **Erro de validação** - Laravel redireciona de volta com erros
2. **Limite de conexões atingido** - Redireciona com mensagem de erro
3. **Erro na API UAZ** - Redireciona com mensagem de erro
4. **Falha no DB transaction** - Redireciona com mensagem de erro

## Passos para Diagnosticar

### 1. Verificar os Logs do Laravel

No servidor de produção, execute:

```bash
# Ver os últimos logs
tail -n 100 storage/logs/laravel.log

# Ou acompanhar em tempo real
tail -f storage/logs/laravel.log
```

Procure por:
- Mensagens de erro relacionadas a "WhatsApp"
- Stack traces
- Mensagens com "Failed to create"
- Erros de validação
- Erros de conexão com banco de dados
- Erros de API (UAZ)

### 2. Verificar se Atingiu o Limite de Conexões

No servidor, execute via `php artisan tinker`:

```php
$user = User::where('email', 'seu-email@exemplo.com')->first();
$tenant = $user->tenant;

echo "Tenant: " . $tenant->name . "\n";
echo "Max Connections: " . $tenant->whatsapp_connections . "\n";
echo "Current Connections: " . $tenant->whatsappConnections()->count() . "\n";
```

Se `Current Connections >= Max Connections`, você atingiu o limite.

### 3. Verificar Erros de Validação

Os campos obrigatórios são:
- `name` (required, max 255)
- `admin_field_1` (nullable, max 255)
- `admin_field_2` (nullable, max 255)

Se algum campo estiver vazio ou muito longo, a validação falha.

### 4. Testar Criação Manualmente

No servidor, via `php artisan tinker`:

```php
use App\Models\WhatsAppConnection;
use App\Models\User;

$user = User::where('email', 'seu-email@exemplo.com')->first();
$tenant = $user->tenant;

// Tentar criar conexão
$connection = WhatsAppConnection::create([
    'tenant_id' => $tenant->id,
    'name' => 'Teste',
    'system_name' => 'ZapClass',
    'admin_field_1' => '',
    'admin_field_2' => '',
    'status' => 'creating',
]);

echo "Connection created with ID: " . $connection->id . "\n";
```

Se isso funcionar, o problema está na API UAZ.

### 5. Verificar Configuração do UAZ API Service

No servidor, via `php artisan tinker`:

```php
use App\Services\UazApiService;

$service = app(UazApiService::class);

// Verificar se tem contas UAZ configuradas
$accounts = \App\Models\UazApiAccount::all();
echo "Total de contas UAZ: " . $accounts->count() . "\n";

foreach ($accounts as $account) {
    echo "Conta: " . $account->id . "\n";
    echo "  URL: " . $account->api_url . "\n";
    echo "  Global API Key: " . ($account->global_api_key ? 'Configurado' : 'NÃO configurado') . "\n";
    echo "  Conexões ativas: " . $account->active_connections . "/" . $account->max_connections . "\n";
    echo "\n";
}
```

### 6. Testar API UAZ Diretamente

No servidor, via `php artisan tinker`:

```php
use App\Services\UazApiService;

$service = app(UazApiService::class);

try {
    $result = $service->createInstance([
        'name' => 'Teste API',
        'system_name' => 'ZapClass',
        'admin_field_1' => '',
        'admin_field_2' => '',
    ]);

    print_r($result);
} catch (\Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
```

### 7. Verificar Flash Messages

O Laravel usa flash messages para erros. No frontend (console do navegador), verifique:

```javascript
// Ver dados da página Inertia
console.log(usePage().props)

// Procurar por:
// - props.errors (erros de validação)
// - props.flash (mensagens de sucesso/erro)
```

### 8. Verificar Network Tab no DevTools

No navegador:
1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Tente criar a conexão
4. Clique na requisição POST `/whatsapp`
5. Veja:
   - **Response Headers** - procure por `Location` (URL do redirect)
   - **Response** - corpo da resposta (pode ter HTML com erro)
   - **Request Payload** - confirme que os dados estão sendo enviados

### 9. Habilitar Logging Detalhado Temporariamente

No `.env` de produção, temporariamente:

```env
LOG_LEVEL=debug
APP_DEBUG=true  # CUIDADO: só temporariamente!
```

Depois execute:
```bash
php artisan config:clear
```

Tente criar a conexão novamente e veja os logs.

**IMPORTANTE**: Após debugar, volte para:
```env
LOG_LEVEL=error
APP_DEBUG=false
```

## Possíveis Causas e Soluções

### Causa 1: Limite de Conexões Atingido

**Sintoma**: Redirect com mensagem "You have reached the maximum number of WhatsApp connections"

**Solução**:
- Deletar conexões antigas
- OU aumentar o limite no plano do tenant
- OU fazer upgrade do plano

```php
// Via tinker
$tenant = Tenant::find(1);
$tenant->whatsapp_connections = 10; // aumentar limite
$tenant->save();
```

### Causa 2: Falha na API UAZ

**Sintoma**: Logs mostram erro ao criar instância na API

**Soluções**:
- Verificar se a API UAZ está online
- Verificar credenciais (global_api_key)
- Verificar se a conta UAZ tem slots disponíveis
- Verificar conectividade de rede do servidor

### Causa 3: Erro no Banco de Dados

**Sintoma**: Logs mostram erro de SQL

**Soluções**:
- Verificar conexão com PostgreSQL
- Verificar se as migrations rodaram
- Verificar permissões do usuário do banco

```bash
# Verificar migrations
php artisan migrate:status

# Rodar migrations pendentes
php artisan migrate
```

### Causa 4: Session/CSRF Issues

**Sintoma**: Ainda recebe 419 ou 302 sem motivo claro

**Solução**: Verificar se aplicou todas as configurações de sessão do `.env`:

```env
SESSION_DOMAIN=.zapclass.com.br
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
```

E limpar cache novamente:
```bash
php artisan config:clear
php artisan cache:clear
php artisan session:table  # se tabela sessions não existe
php artisan migrate
```

## Código com Logging Adicional Adicionado

Adicionei logging no frontend para ajudar a debugar. Ao tentar criar uma conexão, verifique o console do navegador para mensagens como:

- `Success response:` - indica sucesso
- `Form errors:` - indica erros de validação
- `Full error object:` - JSON completo do erro
- `Request finished` - indica fim da requisição

## Próximos Passos

1. **Execute os comandos de verificação acima** no servidor de produção
2. **Tente criar uma conexão** e capture os logs
3. **Me envie os logs** para análise mais detalhada
4. **Verifique o console do navegador** para ver se há erros JavaScript

## Informações Úteis para Debug

Quando reportar o problema, inclua:

- ✅ Logs do Laravel (`storage/logs/laravel.log`)
- ✅ Output do console do navegador
- ✅ Headers da resposta HTTP (Network tab)
- ✅ Resultado dos comandos de verificação acima
- ✅ Limite de conexões atual vs máximo
- ✅ Status das contas UAZ API
