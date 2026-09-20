# Páginas públicas dos apps — Libranium Tech

Repositório público com a página "sobre" e a política de privacidade de cada
app. Publicado via GitHub Pages.

A página inicial (`index.html`) é a vitrine da **Libranium Tech**: lista todos os
apps, com o ícone, o estado e os links de cada um.

Uma pasta por app:

```
jogo-da-velha/
  index.html          ← página "sobre" o jogo
  privacidade.html     ← política de privacidade
  assets/              ← imagens usadas nessas páginas (recortadas/otimizadas
                          a partir da arte do próprio jogo)
japamala/
  index.html          ← página "sobre" o Japamala (contador de mantras)
  privacidade.html     ← política de privacidade (ainda não criada)
  config.json          ← configuração remota lida pelo app (promoções)
  assets/              ← ícone, lótus e logo do app, em WebP
```

## Adicionar um novo app

1. Crie uma pasta com o nome do app.
2. Coloque a página "sobre" em `<app>/index.html` e a política em
   `<app>/privacidade.html`.
3. Adicione um card pra ele em `index.html` (raiz do repositório), com o ícone,
   a descrição, o estado ("Em desenvolvimento", "Publicado"…) e os links.

## Configuração remota do Japamala (`japamala/config.json`)

O app do Japamala lê este arquivo ao abrir (e ao abrir a tela Premium) para
mostrar uma **promoção** sem precisar de uma nova versão do app. Se estiver sem
internet ou o arquivo estiver inválido, o app usa a última versão que
conseguiu ler (ou nenhuma promoção).

Endereço lido pelo app:
`https://ricardodomingues27.github.io/politicas-apps-maju-e-maite/japamala/config.json`

| Campo (`premium.promo`) | O que faz |
|---|---|
| `active` | `true` liga a promoção; `false` desliga (o app não mostra nada) |
| `badge` | selo curto, ex.: `-30%` |
| `title` | título da faixa, ex.: `Promoção de lançamento` |
| `message` | frase da faixa |
| `originalPriceLabel` | preço "de" mostrado riscado (opcional), ex.: `R$ 27,90` |
| `startsAt` / `endsAt` | início e fim, com fuso (`-03:00` = Brasília). Fora desse período o app não mostra a promoção, mesmo com `active: true` |

**Para lançar uma promoção:** edite o arquivo (`active: true`, textos e datas),
faça o commit no `main` e aguarde alguns minutos (o GitHub Pages guarda o
arquivo em cache por até ~10 min). Para encerrar, `active: false`.

> **Importante:** este arquivo só controla o **aviso** da promoção. O valor
> **cobrado** é o da loja: o preço promocional (ou a oferta) precisa ser
> configurado também no Google Play Console / App Store Connect, com o mesmo
> período. Nunca deixe o aviso mostrar um valor diferente do cobrado.

O arquivo é público (qualquer pessoa pode lê-lo): **não coloque nada secreto**
nele. Como o app o baixa do GitHub, isso deve constar na política de
privacidade do Japamala (o GitHub recebe o endereço IP de quem abre o app).
