# Correção do Erro 419 "Page Expired" em Produção

## Problema

Ao tentar criar uma nova conexão WhatsApp em produção (https://beta.zapclass.com.br), o sistema retorna erro **419 Page Expired**.

## Causa

O erro 419 indica que o token CSRF expirou ou é inválido. Isso acontece porque as configurações de sessão e cookies não estão otimizadas para HTTPS em produção.

### Principais problemas identificados:

1. **SESSION_SECURE_COOKIE não está definido** - Em HTTPS, os cookies de sessão devem ter a flag `secure` ativada
2. **SESSION_DOMAIN não está configurado** - Para o domínio `beta.zapclass.com.br`
3. **APP_ENV está como `local`** - Deve ser `production` em produção

## Solução

Atualize as seguintes variáveis de ambiente no arquivo `.env` do servidor de produção:

```env
# Ambiente
APP_ENV=production
APP_DEBUG=false
APP_URL=https://beta.zapclass.com.br

# Configurações de Sessão para HTTPS
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.zapclass.com.br
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Tenant
TENANT_DOMAIN=beta.zapclass.com.br
```

### Explicação das configurações:

- **SESSION_DOMAIN=.zapclass.com.br**: O ponto inicial permite que o cookie funcione em todos os subdomínios (beta.zapclass.com.br, www.zapclass.com.br, etc.)
- **SESSION_SECURE_COOKIE=true**: Garante que o cookie só seja enviado via HTTPS
- **SESSION_HTTP_ONLY=true**: Previne acesso ao cookie via JavaScript (segurança contra XSS)
- **SESSION_SAME_SITE=lax**: Protege contra CSRF mantendo usabilidade

## Passos para Aplicar

1. **No servidor de produção**, edite o arquivo `.env`:
   ```bash
   nano /caminho/para/aplicacao/.env
   ```

2. **Atualize as variáveis** conforme indicado acima

3. **Limpe o cache** da aplicação:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   ```

4. **Reinicie os serviços**:
   ```bash
   # Se estiver usando PHP-FPM
   sudo systemctl restart php8.3-fpm

   # Se estiver usando Docker
   docker-compose restart

   # Reinicie o servidor web (Nginx/Apache)
   sudo systemctl restart nginx
   ```

5. **Teste novamente** criando uma conexão WhatsApp

## Verificação

Após aplicar as mudanças:

1. Limpe os cookies do navegador para o domínio `beta.zapclass.com.br`
2. Faça login novamente
3. Tente criar uma nova conexão WhatsApp
4. O erro 419 não deve mais aparecer

## Arquivo de Referência

Um arquivo `.env.production.example` foi criado no repositório com todas as configurações recomendadas para produção.

## Observações Importantes

- **NUNCA** commite o arquivo `.env` com credenciais reais no repositório
- Mantenha backup das configurações antes de fazer mudanças em produção
- Se estiver usando um proxy reverso (como Cloudflare), certifique-se de que o SSL/TLS está configurado corretamente
- O `SESSION_LIFETIME` está em minutos (120 = 2 horas)

## Troubleshooting

Se o erro persistir após aplicar as mudanças:

1. **Verifique os logs** do Laravel:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verifique se a tabela de sessões existe** no banco de dados:
   ```bash
   php artisan migrate:status
   ```

   Se necessário, crie a tabela:
   ```bash
   php artisan session:table
   php artisan migrate
   ```

3. **Verifique permissões** do diretório de storage:
   ```bash
   chmod -R 775 storage
   chown -R www-data:www-data storage
   ```

4. **Teste a configuração de sessão**:
   ```bash
   php artisan tinker
   >>> Session::put('test', 'value');
   >>> Session::get('test');
   ```
