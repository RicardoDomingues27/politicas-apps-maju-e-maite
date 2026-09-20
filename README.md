# Páginas públicas dos apps

Repositório público com a página "sobre" e a política de privacidade de cada
app. Publicado via GitHub Pages.

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
  assets/              ← ícone, lótus e logo do app, em WebP
```

## Adicionar um novo app

1. Crie uma pasta com o nome do app.
2. Coloque a página "sobre" em `<app>/index.html` e a política em
   `<app>/privacidade.html`.
3. Adicione um card pra ele em `index.html` (raiz do repositório).
