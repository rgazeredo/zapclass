# Guia de Deploy para Produção

## Pré-requisitos

- Docker e Docker Compose instalados
- Git instalado
- Acesso SSH ao servidor

## Deploy no Servidor de Produção

### 1. Parar containers antigos (se existirem)

```bash
docker-compose down
```

### 2. Fazer pull das últimas mudanças

```bash
git pull origin main
```

### 3. Rebuild da imagem Docker

É **ESSENCIAL** fazer rebuild da imagem após essas mudanças, pois alteramos:
- Configurações do PHP-FPM
- Configurações do PHP (php.ini)
- Dockerfile

```bash
# Rebuild forçado da imagem
docker-compose build --no-cache app

# Ou rebuild de todos os services
docker-compose build --no-cache
```

### 4. Subir os containers

```bash
docker-compose up -d
```

### 5. Gerar tipos do Wayfinder (necessário antes do primeiro acesso)

```bash
docker-compose exec app php artisan wayfinder:generate --with-form
```

### 6. Verificar se está funcionando

```bash
# Ver logs
docker-compose logs -f app
docker-compose logs -f nginx

# Ver status dos containers
docker-compose ps

# Testar conexão PHP-FPM
docker-compose exec app php -v
docker-compose exec app php -m | grep opcache
```

## O que foi corrigido?

### Problema: Erro 502 Bad Gateway Intermitente

**Causas identificadas:**
1. PHP-FPM usando configurações padrão muito limitadas
2. Poucos processos PHP disponíveis (padrão: ~5)
3. Sem timeouts configurados adequadamente
4. Memória PHP insuficiente (128M por padrão)

**Soluções implementadas:**

### 1. Configuração PHP-FPM (`php-fpm/www.conf`)
```
pm.max_children = 50        (antes: 5)
pm.start_servers = 10       (antes: 2)
pm.min_spare_servers = 5    (antes: 1)
pm.max_spare_servers = 20   (antes: 3)
request_terminate_timeout = 120s
memory_limit = 256M         (antes: 128M)
```

### 2. Configuração Nginx (`nginx/default.conf`)
```
fastcgi_connect_timeout = 120s
fastcgi_send_timeout = 120s
fastcgi_read_timeout = 120s
client_max_body_size = 64M
```

### 3. PHP Otimizado (`php-fpm/php.ini`)
```
opcache.enable = 1          (cache de bytecode)
memory_limit = 256M
max_execution_time = 120s
```

## Monitoramento

### Ver logs em tempo real
```bash
# Logs do PHP-FPM (erros da aplicação)
docker-compose logs -f app

# Logs do Nginx (erros de conexão)
docker-compose logs -f nginx
```

### Verificar uso de recursos
```bash
# CPU e memória dos containers
docker stats

# Processos PHP-FPM ativos
docker-compose exec app ps aux | grep php-fpm
```

### Verificar configurações aplicadas
```bash
# Ver configuração do PHP-FPM
docker-compose exec app cat /usr/local/etc/php-fpm.d/www.conf

# Ver configuração do PHP
docker-compose exec app php -i | grep -E "(memory_limit|max_execution_time|opcache)"
```

## Troubleshooting

### Se ainda houver 502 errors:

1. **Aumentar processos PHP-FPM**
   - Editar `php-fpm/www.conf`
   - Aumentar `pm.max_children` para 100
   - Fazer rebuild: `docker-compose build --no-cache app`

2. **Verificar memória do servidor**
   ```bash
   free -h
   ```
   Se estiver sem memória, reduzir `pm.max_children`

3. **Ver logs de erro específicos**
   ```bash
   docker-compose logs app | grep -i error
   docker-compose logs nginx | grep -i error
   ```

4. **Verificar se o banco está respondendo**
   ```bash
   docker-compose exec app php artisan tinker
   >>> DB::connection()->getPdo();
   ```

### Rollback em caso de problemas

```bash
# Voltar para versão anterior
git checkout HEAD~1

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

## Performance Esperada

Após essas otimizações:

✅ Até 50 requisições PHP simultâneas
✅ Sem timeouts em operações normais
✅ 15-30% mais rápido com opcache
✅ Suporte a uploads de até 64MB
✅ Sem erros 502 em carga normal

## Notas Importantes

⚠️ **SEMPRE fazer rebuild da imagem** após alterar:
- `Dockerfile`
- `php-fpm/www.conf`
- `php-fpm/php.ini`

⚠️ **Gerar tipos do Wayfinder** antes do primeiro acesso após deploy:
```bash
docker-compose exec app php artisan wayfinder:generate --with-form
```

⚠️ **Limpar cache** após mudanças no código:
```bash
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan view:clear
```
