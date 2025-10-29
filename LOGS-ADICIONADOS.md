# Logs Adicionados para Debugging - Criação de Conexão WhatsApp

## Resumo

Foram adicionados logs detalhados em **3 pontos críticos** do fluxo de criação de conexão WhatsApp para facilitar o debugging do erro 302 em produção.

## Arquivos Modificados

### 1. WhatsAppConnectionController.php (Backend)

**Método**: `store()` - Criação de nova conexão

**Logs adicionados**:

- ✅ **Início da requisição** - Dados recebidos e timestamp
- ✅ **Verificação de limites** - Tenant, conexões atuais vs máximas
- ✅ **Validação** - Se passou ou falhou, com detalhes dos erros
- ✅ **Criação no banco** - ID da conexão criada
- ✅ **Chamada à API UAZ** - Nome da instância sendo criada
- ✅ **Resposta da API** - Dados completos retornados
- ✅ **Atualização da conexão** - Token e instance_id recebidos
- ✅ **Sucesso final** - ID e nome da conexão criada
- ✅ **Erros detalhados** - Message, file, line, stack trace completo
- ✅ **Rollback** - Quando executado
- ✅ **Cleanup** - Tentativa de deletar instância após erro

### 2. UazApiService.php (Serviço de API)

**Método**: `getAvailableAccount()` - Busca conta UAZ disponível

**Logs adicionados**:

- ✅ **Início da busca** - Quando começa a procurar conta
- ✅ **Conta encontrada** - ID, nome, URL, conexões ativas/máximas
- ✅ **Nenhuma conta disponível** - Lista de todas as contas e seus limites

**Método**: `createInstance()` - Cria instância na API UAZ

**Logs adicionados**:

- ✅ **Início da criação** - Opções recebidas
- ✅ **Requisição HTTP** - URL, payload, headers (token mascarado)
- ✅ **Resposta HTTP** - Status code, se foi bem-sucedida, preview do body
- ✅ **Sucesso** - Dados completos da resposta
- ✅ **Falha HTTP** - Status e body da resposta de erro
- ✅ **Exceção** - Message, file, line do erro

### 3. form-connection-modal.tsx (Frontend)

**Método**: `handleSubmit()` - Envio do formulário

**Logs adicionados**:

- ✅ **Success response** - Dados da página retornada em caso de sucesso
- ✅ **Form errors** - Erros de validação detalhados
- ✅ **Full error object** - JSON completo do erro
- ✅ **Request finished** - Indicação de fim da requisição

## Como Usar os Logs

### 1. No Servidor de Produção

Execute:

```bash
tail -f storage/logs/laravel.log
```

Depois tente criar uma conexão. Você verá algo como:

```
[2025-10-18 02:00:00] local.INFO: === INÍCIO: Criação de nova conexão WhatsApp === {"user_id":1,"request_data":{"name":"AZHost","admin_field_1":"","admin_field_2":""},"timestamp":"2025-10-18 02:00:00"}

[2025-10-18 02:00:00] local.INFO: Verificando limites de conexão {"tenant_id":1,"tenant_name":"Meu Tenant","current_connections":0,"max_connections":5}

[2025-10-18 02:00:00] local.INFO: Validando dados do formulário

[2025-10-18 02:00:00] local.INFO: Validação passou com sucesso

[2025-10-18 02:00:00] local.INFO: Iniciando transação do banco de dados

[2025-10-18 02:00:00] local.INFO: Criando registro da conexão no banco de dados {"name":"AZHost","tenant_id":1}

[2025-10-18 02:00:00] local.INFO: Conexão criada no banco com sucesso {"connection_id":123}

[2025-10-18 02:00:00] local.INFO: Chamando API UAZ para criar instância {"connection_name":"AZHost"}

[2025-10-18 02:00:00] local.INFO: === UAZ API: Iniciando criação de instância === {"options":{"name":"AZHost","system_name":"ZapClass",...}}

[2025-10-18 02:00:00] local.INFO: === UAZ API: Buscando conta disponível ===

[2025-10-18 02:00:00] local.INFO: === UAZ API: Conta disponível encontrada === {"account_id":1,"account_name":"W4Digital","base_url":"https://w4digital.uazapi.com","active_connections":5,"max_connections":10}

[2025-10-18 02:00:00] local.INFO: === UAZ API: Fazendo requisição para criar instância === {"url":"https://w4digital.uazapi.com/instance/init","payload":{...}}

[2025-10-18 02:00:01] local.INFO: === UAZ API: Resposta recebida === {"status_code":200,"successful":true,"body_preview":"..."}

[2025-10-18 02:00:01] local.INFO: === UAZ API: Instância criada com sucesso === {"response_data":{...}}

[2025-10-18 02:00:01] local.INFO: Resposta da API UAZ recebida {"api_response":{...}}

[2025-10-18 02:00:01] local.INFO: Conexão atualizada com dados da API {"connection_id":123,"token":"abc123...","instance_id":"456"}

[2025-10-18 02:00:01] local.INFO: Habilitando API da conexão

[2025-10-18 02:00:01] local.INFO: Commitando transação do banco de dados

[2025-10-18 02:00:01] local.INFO: === SUCESSO: Conexão WhatsApp criada com sucesso === {"connection_id":123,"connection_name":"AZHost"}
```

### 2. No Console do Navegador

Ao tentar criar uma conexão, você verá:

```javascript
Success response: {...}  // Se deu certo
// OU
Form errors: {...}       // Se teve erro de validação
Full error object: {...} // JSON completo do erro
Request finished         // Sempre ao final
```

## O Que os Logs Vão Revelar

Os logs irão mostrar **exatamente** onde o processo está falhando:

### Cenário 1: Limite de Conexões Atingido

```
[WARNING] Limite de conexões atingido {"tenant_id":1,"current":5,"max":5}
```

### Cenário 2: Erro de Validação

```
[ERROR] Erro de validação {"errors":{"name":["The name field is required."]}}
```

### Cenário 3: Nenhuma Conta UAZ Disponível

```
[ERROR] === UAZ API: Nenhuma conta disponível === {"total_accounts":1,"all_accounts":[{"id":1,"name":"W4Digital","active_connections":10,"max_connections":10,"available":false}]}
```

### Cenário 4: Erro na API UAZ

```
[ERROR] === UAZ API: Falha na criação da instância === {"status_code":500,"response_body":"Internal Server Error"}
```

### Cenário 5: Erro no Banco de Dados

```
[ERROR] === ERRO: Falha ao criar conexão WhatsApp === {"error_message":"SQLSTATE[23000]: Integrity constraint violation...","error_file":"/var/www/app/Models/WhatsAppConnection.php","error_line":45}
```

## Próximos Passos

1. **Faça deploy** das alterações para produção
2. **Tente criar** uma conexão WhatsApp
3. **Capture os logs** com `tail -f storage/logs/laravel.log`
4. **Capture o console** do navegador (F12 → Console)
5. **Me envie** os logs para análise

## Observações

- Os logs estão marcados com `===` para facilitar identificação
- Tokens e credenciais são mascarados nos logs por segurança
- Todos os erros incluem stack trace completo
- Os logs seguem o fluxo cronológico da execução

## Removendo os Logs Depois

Após resolver o problema, se quiser remover os logs extras (opcional):

1. Procure por linhas que começam com `Log::info('===`
2. Procure por `console.log` adicionados no frontend
3. Remova conforme necessário

**Recomendação**: Manter os logs de erro (ERROR) e warning (WARNING), remover apenas os INFO extras.
