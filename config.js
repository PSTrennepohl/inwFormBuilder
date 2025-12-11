// Configuração do INW Form Builder/Render
// - libs: permite importar bibliotecas externas (CSS/JS) em ordem
// - palette: scripts de componentes
window.INW_FORMBUILDER_CONFIG = {
    libs: {
        css: [
            // Bootstrap CSS (opcional se já existir na página)
            'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css'
        ],
        js: [
            // jQuery (opcional se já existir na página)
            'https://code.jquery.com/jquery-3.6.0.min.js',
            // Bootstrap Bundle (opcional se já existir na página)
            'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
            // html2pdf para exportação de PDF no render
            'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js'
        ]
    },
    palette: [
        './palette/input.js',
        './palette/textarea.js', 
        './palette/select.js',
        './palette/radio.js',
        './palette/checkbox.js',
        './palette/label.js'
    ]
};