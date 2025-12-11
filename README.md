# INW Form Builder & Renderer

Construtor e renderizador avançado de formulários responsivos, com
suporte a:

-   Montagem visual por drag-and-drop\
-   Colunas totalmente responsivas (Bootstrap)\
-   Renderização de formulários para preenchimento\
-   Coleta de dados estruturados\
-   Exportação avançada para PDF\
-   Componentes dinâmicos carregados via `config.js`\
-   Funciona 100% offline (sem necessidade de servidor)

------------------------------------------------------------------------

## Demonstração Online

Clique no botão abaixo para abrir o exemplo funcionando hospedado no
GitHub Pages:

[![Abrir
Exemplo](https://img.shields.io/badge/ABRIR%20EXEMPLO-005fed?style=for-the-badge)](https://pstrennepohl.github.io/inwFormBuilder/)

------------------------------------------------------------------------

## Estrutura Geral do Projeto

    /
    ├── index.html                 # Página demo com builder + renderer
    ├── inwformbuilder.js          # Motor do Builder (drag/drop, UI, JSON)
    ├── inwformrender.js           # Motor do Renderer (inputs, coleta, PDF)
    ├── config.js                  # Configurações + lista de componentes extras
    ├── /palette                   # (opcional) pastas com componentes customizados
    ├── bootstrap.min.css
    ├── jquery-3.6.0.min.js
    └── sweetalert2.min.js

------------------------------------------------------------------------

## Funcionalidades

### **1. Builder**

-   Interface visual de arrastar e soltar\
-   Linhas (`row`) e colunas (`col`) responsivas\
-   Componentes configuráveis\
-   JSON exibido ao vivo para depuração\
-   Paleta dinâmica carregada via `config.js`

### **2. Renderer**

-   Renderização fiel do JSON\
-   Suporte a:
    -   Input\
    -   Textarea\
    -   Select\
    -   Radio (com opção "Outros")\
    -   Checkbox\
    -   Labels estilizados\
-   Leitura de valores preenchidos\
-   Modo ReadOnly\
-   Re-renderização direta do JSON

### **3. PDF**

-   Geração de PDF baseada no layout do Builder\
-   Agrupamento de colunas conforme largura LG\
-   Estilos interpretados:
    -   `fw-bold`
    -   `h5`, `h4`, `h3`
    -   `text-muted`, `text-primary`
-   Suporte completo a campos "Outros" de radio/checkbox\
-   Compatível com **pdfMake**

------------------------------------------------------------------------

## Como Usar

### **1. Inclusão no HTML**

``` html
<link rel="stylesheet" href="bootstrap.min.css">
<link rel="stylesheet" href="sweetalert2.min.css">
<script src="jquery-3.6.0.min.js"></script>
<script src="bootstrap.bundle.min.js"></script>
<script src="sweetalert2.min.js"></script>

<script src="inwformbuilder.js"></script>
<script src="inwformrender.js"></script>
```

### **2. Inicializando o Builder**

``` javascript
$('#inw-form').INWformBuilder({
    debugJson: true,
    showWindowColSize: true
});
```

### **3. Inicializando o Renderer**

``` javascript
$('#renderer').INWformRender({
    formData: jsonDoBuilder
});
```

------------------------------------------------------------------------

## Exemplo Completo

O projeto inclui o arquivo principal:

    index.html

Ele demonstra:

-   Builder\
-   Renderer\
-   Preview em HTML\
-   Exportação para PDF\
-   Importação e carregamento de JSON\
-   Re-renderização

Use este arquivo como referência oficial.

------------------------------------------------------------------------

## Carregamento de Componentes via `config.js`

``` javascript
window.INW_FORMBUILDER_CONFIG = {
    palette: [
        "palette/campo_texto.js",
        "palette/campo_data.js"
    ]
};
```

Cada componente deve registrar:

``` javascript
window.INW_COMPONENTS['meuComponente'] = {
    label: "...",
    icon: "...",
    includeInPalette: true,
    btnClass: "btn-outline-primary",

    render: function(data, container) {},
    getData: function(element) {},
    editComponent: function() {}
};
```

------------------------------------------------------------------------

## Licença

Este projeto pode ser utilizado livremente, modificado e integrado em
sistemas proprietários.\
Se publicar melhorias, considere contribuir de volta.

------------------------------------------------------------------------

## Autor

Desenvolvido por **Paulo Trennepohl**
