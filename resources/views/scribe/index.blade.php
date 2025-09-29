<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>ZapClass API Documentation</title>

    <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset("/vendor/scribe/css/theme-default.style.css") }}" media="screen">
    <link rel="stylesheet" href="{{ asset("/vendor/scribe/css/theme-default.print.css") }}" media="print">

    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.10/lodash.min.js"></script>

    <link rel="stylesheet"
          href="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/styles/obsidian.min.css">
    <script src="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/highlight.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jets/0.14.1/jets.min.js"></script>

    <style id="language-style">
        /* starts out as display none and is replaced with js later  */
                    body .content .bash-example code { display: none; }
                    body .content .javascript-example code { display: none; }
            </style>

    <script>
        var tryItOutBaseUrl = "http://localhost";
        var useCsrf = Boolean();
        var csrfUrl = "/sanctum/csrf-cookie";
    </script>
    <script src="{{ asset("/vendor/scribe/js/tryitout-5.3.0.js") }}"></script>

    <script src="{{ asset("/vendor/scribe/js/theme-default-5.3.0.js") }}"></script>

</head>

<body data-languages="[&quot;bash&quot;,&quot;javascript&quot;]">

<a href="#" id="nav-button">
    <span>
        MENU
        <img src="{{ asset("/vendor/scribe/images/navbar.png") }}" alt="navbar-image"/>
    </span>
</a>
<div class="tocify-wrapper">
    
            <div class="lang-selector">
                                            <button type="button" class="lang-button" data-language-name="bash">bash</button>
                                            <button type="button" class="lang-button" data-language-name="javascript">javascript</button>
                    </div>
    
    <div class="search">
        <input type="text" class="search" id="input-search" placeholder="Search">
    </div>

    <div id="toc">
                    <ul id="tocify-header-introduction" class="tocify-header">
                <li class="tocify-item level-1" data-unique="introduction">
                    <a href="#introduction">Introduction</a>
                </li>
                            </ul>
                    <ul id="tocify-header-authenticating-requests" class="tocify-header">
                <li class="tocify-item level-1" data-unique="authenticating-requests">
                    <a href="#authenticating-requests">Authenticating requests</a>
                </li>
                            </ul>
                    <ul id="tocify-header-endpoints" class="tocify-header">
                <li class="tocify-item level-1" data-unique="endpoints">
                    <a href="#endpoints">Endpoints</a>
                </li>
                                    <ul id="tocify-subheader-endpoints" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="endpoints-POSTapi-v1-messages-send-text">
                                <a href="#endpoints-POSTapi-v1-messages-send-text">Mensagem de texto</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="endpoints-GETapi-v1-messages-status--messageId-">
                                <a href="#endpoints-GETapi-v1-messages-status--messageId-">Consultar status de uma mensagem enviada</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="endpoints-GETapi-v1-connection-info">
                                <a href="#endpoints-GETapi-v1-connection-info">Obter informações da conexão WhatsApp</a>
                            </li>
                                                                        </ul>
                            </ul>
            </div>

    <ul class="toc-footer" id="toc-footer">
                    <li style="padding-bottom: 5px;"><a href="{{ route("scribe.postman") }}">View Postman collection</a></li>
                            <li style="padding-bottom: 5px;"><a href="{{ route("scribe.openapi") }}">View OpenAPI spec</a></li>
                <li><a href="http://github.com/knuckleswtf/scribe">Documentation powered by Scribe ✍</a></li>
    </ul>

    <ul class="toc-footer" id="last-updated">
        <li>Last updated: September 29, 2025</li>
    </ul>
</div>

<div class="page-wrapper">
    <div class="dark-box"></div>
    <div class="content">
        <h1 id="introduction">Introduction</h1>
<p>API oficial do ZapClass para integração com WhatsApp.</p>
<aside>
    <strong>Base URL</strong>: <code>http://localhost</code>
</aside>
<pre><code>Esta documentação fornece todas as informações necessárias para trabalhar com a API do ZapClass.

**Autenticação:** Todas as rotas da API requerem autenticação via token Bearer no header Authorization.

&lt;aside&gt;Conforme você rola a página, verá exemplos de código para trabalhar com a API em diferentes linguagens de programação na área escura à direita (ou como parte do conteúdo no mobile).
Você pode trocar a linguagem usando as abas no canto superior direito (ou no menu de navegação superior esquerdo no mobile).&lt;/aside&gt;</code></pre>

        <h1 id="authenticating-requests">Authenticating requests</h1>
<p>To authenticate requests, include an <strong><code>Authorization</code></strong> header with the value <strong><code>"Bearer zt_your_api_token_here"</code></strong>.</p>
<p>All authenticated endpoints are marked with a <code>requires authentication</code> badge in the documentation below.</p>
<p>Você pode obter seu token de API acessando seu painel do ZapClass e clicando em <b>Gerar Token de API</b>. O token deve começar com &quot;zt_&quot;.</p>

        <h1 id="endpoints">Endpoints</h1>

    

                                <h2 id="endpoints-POSTapi-v1-messages-send-text">Mensagem de texto</h2>

<p>
<small class="badge badge-darkred">requires authentication</small>
</p>

<p>Envia uma mensagem de texto para um número específico.</p>

<span id="example-requests-POSTapi-v1-messages-send-text">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request POST \
    "http://localhost/api/v1/messages/send-text" \
    --header "Authorization: Bearer zt_your_api_token_here" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"recipient\": \"553642559314\",
    \"text_message\": \"k\",
    \"linkPreview\": true,
    \"delayMessage\": 14,
    \"mentionEveryone\": false,
    \"mentioned\": [
        \"553642559314\"
    ],
    \"messageToReply\": \"k\",
    \"trackingId\": \"h\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://localhost/api/v1/messages/send-text"
);

const headers = {
    "Authorization": "Bearer zt_your_api_token_here",
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "recipient": "553642559314",
    "text_message": "k",
    "linkPreview": true,
    "delayMessage": 14,
    "mentionEveryone": false,
    "mentioned": [
        "553642559314"
    ],
    "messageToReply": "k",
    "trackingId": "h"
};

fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-POSTapi-v1-messages-send-text">
</span>
<span id="execution-results-POSTapi-v1-messages-send-text" hidden>
    <blockquote>Received response<span
                id="execution-response-status-POSTapi-v1-messages-send-text"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-POSTapi-v1-messages-send-text"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-POSTapi-v1-messages-send-text" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POSTapi-v1-messages-send-text">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-POSTapi-v1-messages-send-text" data-method="POST"
      data-path="api/v1/messages/send-text"
      data-authed="1"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('POSTapi-v1-messages-send-text', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-POSTapi-v1-messages-send-text"
                    onclick="tryItOut('POSTapi-v1-messages-send-text');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-POSTapi-v1-messages-send-text"
                    onclick="cancelTryOut('POSTapi-v1-messages-send-text');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-POSTapi-v1-messages-send-text"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-black">POST</small>
            <b><code>api/v1/messages/send-text</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Authorization</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Authorization" class="auth-value"               data-endpoint="POSTapi-v1-messages-send-text"
               value="Bearer zt_your_api_token_here"
               data-component="header">
    <br>
<p>Example: <code>Bearer zt_your_api_token_here</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="POSTapi-v1-messages-send-text"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="POSTapi-v1-messages-send-text"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>recipient</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="recipient"                data-endpoint="POSTapi-v1-messages-send-text"
               value="553642559314"
               data-component="body">
    <br>
<p>Must match the regex /^55[1-9][0-9]{9,10}$/. Example: <code>553642559314</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>text_message</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="text_message"                data-endpoint="POSTapi-v1-messages-send-text"
               value="k"
               data-component="body">
    <br>
<p>Must not be greater than 4096 characters. Example: <code>k</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>linkPreview</code></b>&nbsp;&nbsp;
<small>boolean</small>&nbsp;
<i>optional</i> &nbsp;
                <label data-endpoint="POSTapi-v1-messages-send-text" style="display: none">
            <input type="radio" name="linkPreview"
                   value="true"
                   data-endpoint="POSTapi-v1-messages-send-text"
                   data-component="body"             >
            <code>true</code>
        </label>
        <label data-endpoint="POSTapi-v1-messages-send-text" style="display: none">
            <input type="radio" name="linkPreview"
                   value="false"
                   data-endpoint="POSTapi-v1-messages-send-text"
                   data-component="body"             >
            <code>false</code>
        </label>
    <br>
<p>Example: <code>true</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>delayMessage</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
                <input type="number" style="display: none"
               step="any"               name="delayMessage"                data-endpoint="POSTapi-v1-messages-send-text"
               value="14"
               data-component="body">
    <br>
<p>Must be at least 0. Must not be greater than 3600. Example: <code>14</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>mentionEveryone</code></b>&nbsp;&nbsp;
<small>boolean</small>&nbsp;
<i>optional</i> &nbsp;
                <label data-endpoint="POSTapi-v1-messages-send-text" style="display: none">
            <input type="radio" name="mentionEveryone"
                   value="true"
                   data-endpoint="POSTapi-v1-messages-send-text"
                   data-component="body"             >
            <code>true</code>
        </label>
        <label data-endpoint="POSTapi-v1-messages-send-text" style="display: none">
            <input type="radio" name="mentionEveryone"
                   value="false"
                   data-endpoint="POSTapi-v1-messages-send-text"
                   data-component="body"             >
            <code>false</code>
        </label>
    <br>
<p>Example: <code>false</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>mentioned</code></b>&nbsp;&nbsp;
<small>string[]</small>&nbsp;
<i>optional</i> &nbsp;
                <input type="text" style="display: none"
                              name="mentioned[0]"                data-endpoint="POSTapi-v1-messages-send-text"
               data-component="body">
        <input type="text" style="display: none"
               name="mentioned[1]"                data-endpoint="POSTapi-v1-messages-send-text"
               data-component="body">
    <br>
<p>Must match the regex /^55[1-9][0-9]{9,10}$/.</p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>messageToReply</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
                <input type="text" style="display: none"
                              name="messageToReply"                data-endpoint="POSTapi-v1-messages-send-text"
               value="k"
               data-component="body">
    <br>
<p>Must not be greater than 100 characters. Example: <code>k</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>trackingId</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
                <input type="text" style="display: none"
                              name="trackingId"                data-endpoint="POSTapi-v1-messages-send-text"
               value="h"
               data-component="body">
    <br>
<p>Must match the regex /^[a-zA-Z0-9_-]+$/. Must not be greater than 50 characters. Example: <code>h</code></p>
        </div>
        </form>

                    <h2 id="endpoints-GETapi-v1-messages-status--messageId-">Consultar status de uma mensagem enviada</h2>

<p>
<small class="badge badge-darkred">requires authentication</small>
</p>

<p>Retorna o status atual de uma mensagem específica identificada pelo message_id.
Útil para rastrear se a mensagem foi entregue ao destinatário.</p>

<span id="example-requests-GETapi-v1-messages-status--messageId-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://localhost/api/v1/messages/status/architecto" \
    --header "Authorization: Bearer zt_your_api_token_here" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://localhost/api/v1/messages/status/architecto"
);

const headers = {
    "Authorization": "Bearer zt_your_api_token_here",
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-v1-messages-status--messageId-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;success&quot;: true,
    &quot;message&quot;: &quot;Opera&ccedil;&atilde;o realizada com sucesso&quot;,
    &quot;data&quot;: {
        &quot;message_id&quot;: &quot;msg_abc123def456ghi789&quot;,
        &quot;status&quot;: &quot;delivered&quot;,
        &quot;timestamp&quot;: &quot;2024-01-15T10:35:20.000000Z&quot;,
        &quot;connection_id&quot;: &quot;zapclass_123&quot;
    },
    &quot;timestamp&quot;: &quot;2024-01-15T10:35:20.000000Z&quot;
}</code>
 </pre>
            <blockquote>
            <p>Example response (401):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;success&quot;: false,
    &quot;error&quot;: &quot;api_error&quot;,
    &quot;message&quot;: &quot;Token de API inv&aacute;lido ou expirado&quot;,
    &quot;timestamp&quot;: &quot;2024-01-15T10:35:20.000000Z&quot;
}</code>
 </pre>
            <blockquote>
            <p>Example response (500):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;success&quot;: false,
    &quot;error&quot;: &quot;api_error&quot;,
    &quot;message&quot;: &quot;Erro ao consultar status da mensagem&quot;,
    &quot;timestamp&quot;: &quot;2024-01-15T10:35:20.000000Z&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-v1-messages-status--messageId-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-v1-messages-status--messageId-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-v1-messages-status--messageId-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-v1-messages-status--messageId-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-v1-messages-status--messageId-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-v1-messages-status--messageId-" data-method="GET"
      data-path="api/v1/messages/status/{messageId}"
      data-authed="1"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-v1-messages-status--messageId-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-v1-messages-status--messageId-"
                    onclick="tryItOut('GETapi-v1-messages-status--messageId-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-v1-messages-status--messageId-"
                    onclick="cancelTryOut('GETapi-v1-messages-status--messageId-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-v1-messages-status--messageId-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/v1/messages/status/{messageId}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Authorization</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Authorization" class="auth-value"               data-endpoint="GETapi-v1-messages-status--messageId-"
               value="Bearer zt_your_api_token_here"
               data-component="header">
    <br>
<p>Example: <code>Bearer zt_your_api_token_here</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-v1-messages-status--messageId-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-v1-messages-status--messageId-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>messageId</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="messageId"                data-endpoint="GETapi-v1-messages-status--messageId-"
               value="architecto"
               data-component="url">
    <br>
<p>Example: <code>architecto</code></p>
            </div>
                    </form>

                    <h2 id="endpoints-GETapi-v1-connection-info">Obter informações da conexão WhatsApp</h2>

<p>
<small class="badge badge-darkred">requires authentication</small>
</p>

<p>Retorna detalhes sobre a conexão WhatsApp associada ao token de API,
incluindo status, telefone conectado e informações de uso da API.</p>

<span id="example-requests-GETapi-v1-connection-info">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://localhost/api/v1/connection/info" \
    --header "Authorization: Bearer zt_your_api_token_here" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://localhost/api/v1/connection/info"
);

const headers = {
    "Authorization": "Bearer zt_your_api_token_here",
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-v1-connection-info">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;success&quot;: true,
    &quot;message&quot;: &quot;Opera&ccedil;&atilde;o realizada com sucesso&quot;,
    &quot;data&quot;: {
        &quot;connection_id&quot;: &quot;zapclass_123&quot;,
        &quot;name&quot;: &quot;Conex&atilde;o Principal&quot;,
        &quot;status&quot;: &quot;connected&quot;,
        &quot;phone&quot;: &quot;5511999999999&quot;,
        &quot;api_usage_count&quot;: 42,
        &quot;api_rate_limit&quot;: 1000,
        &quot;api_last_used&quot;: &quot;2024-01-15T10:25:30.000000Z&quot;
    },
    &quot;timestamp&quot;: &quot;2024-01-15T10:30:45.000000Z&quot;
}</code>
 </pre>
            <blockquote>
            <p>Example response (401):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;success&quot;: false,
    &quot;error&quot;: &quot;api_error&quot;,
    &quot;message&quot;: &quot;Token de API inv&aacute;lido ou expirado&quot;,
    &quot;timestamp&quot;: &quot;2024-01-15T10:30:45.000000Z&quot;
}</code>
 </pre>
            <blockquote>
            <p>Example response (500):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;success&quot;: false,
    &quot;error&quot;: &quot;api_error&quot;,
    &quot;message&quot;: &quot;Erro ao obter informa&ccedil;&otilde;es da conex&atilde;o&quot;,
    &quot;timestamp&quot;: &quot;2024-01-15T10:30:45.000000Z&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-v1-connection-info" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-v1-connection-info"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-v1-connection-info"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-v1-connection-info" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-v1-connection-info">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-v1-connection-info" data-method="GET"
      data-path="api/v1/connection/info"
      data-authed="1"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-v1-connection-info', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-v1-connection-info"
                    onclick="tryItOut('GETapi-v1-connection-info');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-v1-connection-info"
                    onclick="cancelTryOut('GETapi-v1-connection-info');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-v1-connection-info"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/v1/connection/info</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Authorization</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Authorization" class="auth-value"               data-endpoint="GETapi-v1-connection-info"
               value="Bearer zt_your_api_token_here"
               data-component="header">
    <br>
<p>Example: <code>Bearer zt_your_api_token_here</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-v1-connection-info"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-v1-connection-info"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        </form>

            

        
    </div>
    <div class="dark-box">
                    <div class="lang-selector">
                                                        <button type="button" class="lang-button" data-language-name="bash">bash</button>
                                                        <button type="button" class="lang-button" data-language-name="javascript">javascript</button>
                            </div>
            </div>
</div>
</body>
</html>
