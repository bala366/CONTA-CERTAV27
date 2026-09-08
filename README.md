# Conta Certa Android Independente V027

Projeto Android criado a partir dos arquivos recuperados do Conta Certa que estava funcionando no celular: `index.html`, `style.css`, `app.js`, `manifest.json`, `seed.json`, ícones e o estado atual do banco local.

## IMPORTANTE — repositório PRIVADO

Este projeto contém `current_db.json`, recuperado do aplicativo em funcionamento. Ele pode conter dados reais de clientes, fornecedores e lançamentos. Crie o repositório do GitHub como **Private**.

## O que foi preservado

- Interface HTML/CSS original recuperada do PWA.
- JavaScript original recuperado do PWA.
- Ícones/logomarca recuperados.
- Cadastros, estoque, contas a pagar/receber, vendas, boletos, fiado, cheques, DRE, livros, balancete, relatórios, backup e auditoria existentes no código recuperado.
- Estado atual capturado em `current_db.json` usado somente na primeira abertura; depois os dados ficam no armazenamento local do app.

## Adaptações Android

- O PWA deixa de depender de Chrome e de `127.0.0.1:8080`.
- Os arquivos web ficam dentro do próprio APK.
- Botões PDF/IMPRIMIR usam a impressão nativa do Android e permitem Salvar como PDF.
- Exportar backup grava JSON em `Downloads/ContaCerta`.
- Restaurar backup abre o seletor de arquivo JSON do Android.

## Compilar

O workflow `.github/workflows/android.yml` usa Java 17, Gradle 8.9 e:

```bash
gradle clean :app:assembleDebug --stacktrace
```

O artefato final é `Conta_Certa_Original_V027.apk`.
