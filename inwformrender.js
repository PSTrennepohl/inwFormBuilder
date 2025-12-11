// plugins/inwformrender.js
(function(){ 
    delete window.INWformRender;
    window.INWformRender = window.INWformRender || 

(function($) {
    'use strict';
    let GSDebug =false;
    // Função para gerar IDs únicos
    function generateRenderId(originalId) {
        return 'render_' + (originalId || Math.random().toString(36).substr(2, 9));
    }
    // GERAR PDF
        // Funções auxiliares independentes para geração de PDF
        function buildPrintablePDFFromJSON(formData) {
            const content = [];

            function getLgSize(classList) {
                const match = classList.match(/col-lg-(\d+)/);
                return match ? parseInt(match[1], 10) : 12;
            }

            function processField(component) {
                switch(component.type) {
                    case 'label':
                        // Extrair classes e aplicar estilos condicionais
                        const classList = component.attributes?.class || '';
                        const labelStyle = {
                            text: removeQuebras(component.label) || '',
                            style: 'label',
                            margin: [0, 5, 0, 2] // Reduzir margem inferior
                        };

                        // Aplicar estilos baseados nas classes
                        if (classList.includes('fw-bold')) {
                            labelStyle.bold = true;
                        }
                        if (classList.includes('h5')) {
                            labelStyle.fontSize = 14;
                            labelStyle.bold = true;
                        }
                        if (classList.includes('h4')) {
                            labelStyle.fontSize = 16;
                            labelStyle.bold = true;
                        }
                        if (classList.includes('h3')) {
                            labelStyle.fontSize = 18;
                            labelStyle.bold = true;
                        }
                        if (classList.includes('text-muted')) {
                            labelStyle.color = '#6c757d';
                        }
                        if (classList.includes('text-primary')) {
                            labelStyle.color = '#0d6efd';
                        }

                        return [labelStyle];
                    case 'input':
                    case 'textarea':
                        /*return [
                            { text: component.label || '', style: 'question' },
                            { text: component.value || '', style: 'answer' }
                        ];*/
                        return [
                            { 
                                text: removeQuebras(component.label) || '', 
                                style: 'question',
                                margin: [0, 10, 0, 2]
                            },
                            { 
                                text: component.value || '', 
                                style: 'answer',
                                margin: [0, 0, 0, 5] // Reduzir margem
                            }
                        ];
                    case 'select':
                        const selectedOption = (component.options || []).find(opt => opt.value === component.value);
                        return [
                            { text: removeQuebras(component.label) || '', style: 'question' },
                            { text: selectedOption ? selectedOption.label : '', style: 'answer' }
                        ];
                    case 'radio':
                        const radio = [{ text: removeQuebras(component.label) || '', style: 'question' }];
                        (component.options || []).forEach(opt => {
                            const marker = component.value === opt.value ? '(X)' : '(   )';
                            let optionText = opt.label;
                            
                            // ADICIONAR: Verificar se é opção "Outros" com valor personalizado
                            if (component.value === opt.value && opt.other && opt.otherValue) {
                                optionText += `: ${opt.otherValue}`;
                            }
                            
                            radio.push({ text: `${marker} ${optionText}`, style: 'option' });
                        });
                        return radio;
                        /*const radio = [{ text: removeQuebras(component.label) || '', style: 'question' }];
                        (component.options || []).forEach(opt => {
                            const marker = component.value === opt.value ? '(X)' : '(   )';
                            radio.push({ text: `${marker} ${opt.label}`, style: 'option' });
                        });
                        return radio;*/
                    case 'checkbox':
                        const box = [{ text: removeQuebras(component.label) || '', style: 'question' }];
                        const selectedValues = Array.isArray(component.value) ? component.value : [];
                        (component.options || []).forEach(opt => {
                            const marker = selectedValues.includes(opt.value) ? '[X]' : '[   ]';
                            let optionText = opt.label;
                            
                            // ADICIONAR: Verificar se é opção "Outros" com valor personalizado
                            if (selectedValues.includes(opt.value) && opt.other && opt.otherValue) {
                                optionText += `: ${opt.otherValue}`;
                            }
                            
                            box.push({ text: `${marker} ${optionText}`, style: 'option' });
                        });
                        return box;
                        /*const box = [{ text: removeQuebras(component.label) || '', style: 'question' }];
                        const selectedValues = Array.isArray(component.value) ? component.value : [];
                        (component.options || []).forEach(opt => {
                            const marker = selectedValues.includes(opt.value) ? '[X]' : '[   ]';
                            box.push({ text: `${marker} ${opt.label}`, style: 'option' });
                        });
                        return box;*/
                }
                return [];
            }

            function processComponent(component) {
                if (component.type === 'row') {
                    const columns = component.children || [];
                    const columnGroups = []; // Para agrupar colunas em linhas
                    
                    // Agrupa colunas em linhas que não excedam 12
                    let currentLine = [];
                    let currentSum = 0;
                    
                    columns.forEach(col => {
                        const lgSize = getLgSize(col.classes);
                        
                        if (currentSum + lgSize > 12) {
                            // Se exceder 12, começa uma nova linha
                            if (currentLine.length > 0) {
                                columnGroups.push(currentLine);
                            }
                            currentLine = [col];
                            currentSum = lgSize;
                        } else {
                            // Adiciona à linha atual
                            currentLine.push(col);
                            currentSum += lgSize;
                        }
                    });
                    
                    // Adiciona a última linha
                    if (currentLine.length > 0) {
                        columnGroups.push(currentLine);
                    }
                    
                    // Processa cada grupo de colunas como uma linha separada no PDF
                    columnGroups.forEach(group => {
                        const pdfColumns = [];
                        let lineTotalSize = 0;
                        
                        // Calcula tamanho total da linha para normalizar as larguras
                        group.forEach(col => {
                            lineTotalSize += getLgSize(col.classes);
                        });
                        
                        group.forEach(col => {
                            const lgSize = getLgSize(col.classes);
                            // Normaliza a largura baseado no total da linha
                            const normalizedWidth = lineTotalSize > 12 ? 
                                (lgSize / lineTotalSize) * 100 + '%' : 
                                (lgSize / 12) * 100 + '%';

                            const columnStack = [];

                            col.children.forEach(child => {
                                columnStack.push(...processField(child));
                            });

                            pdfColumns.push({
                                width: normalizedWidth,
                                stack: columnStack,
                                margin: [0, 0, 5, 0] // Adiciona espaçamento entre colunas
                            });
                        });

                        content.push({ 
                            columns: pdfColumns, 
                            margin: [0, 5, 0, 10],
                            columnGap: 10 // Espaçamento entre colunas
                        });
                    });
                    return;
                }

                if (component.children) {
                    component.children.forEach(processComponent);
                }
            }

            (formData.components || []).forEach(processComponent);

            return content;
        }

        function parseHtmlStyles(html) {
            if (!html) return { text: '', styles: {} };
            
            const text = html.replace(/<[^>]*>/g, '');
            const styles = {};
            const styleMatch = html.match(/style="([^"]*)"/);
            
            if (styleMatch) {
                const styleString = styleMatch[1];
                const stylePairs = styleString.split(';');
                
                stylePairs.forEach(pair => {
                    const [key, value] = pair.split(':').map(s => s.trim());
                    if (key && value) {
                        switch(key) {
                            case 'text-align':
                                styles.alignment = value;
                                break;
                            case 'font-size':
                                const sizeMatch = value.match(/(\d+)px/);
                                if (sizeMatch) {
                                    styles.fontSize = parseInt(sizeMatch[1]) * 0.75;
                                } else {
                                    styles.fontSize = parseInt(value) || 12;
                                }
                                break;
                            case 'color':
                                styles.color = value;
                                break;
                            case 'font-weight':
                                styles.bold = value === 'bold' || parseInt(value) >= 700;
                                break;
                            case 'background-color':
                                styles.background = value;
                                break;
                            case 'padding':
                                styles.margin = parsePadding(value);
                                break;
                            case 'margin':
                                styles.margin = parseMargin(value);
                                break;
                            case 'border':
                                if (value.includes('solid')) {
                                    styles.border = [true, true, true, true];
                                }
                                break;
                        }
                    }
                });
            }
            
            return { text, styles };
        }

        function parsePadding(paddingValue) {
            const parts = paddingValue.split(' ').map(p => parseInt(p) || 0);
            if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
            if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
            if (parts.length === 4) return [parts[0], parts[1], parts[2], parts[3]];
            return [0, 0, 0, 0];
        }

        function parseMargin(marginValue) {
            return parsePadding(marginValue);
        }

        function applyStylesFromClasses(styles, classList) {
            if (classList.includes('fw-bold')) styles.bold = true;
            if (classList.includes('h5')) {
                styles.fontSize = 14;
                styles.bold = true;
            }
            if (classList.includes('h4')) {
                styles.fontSize = 16;
                styles.bold = true;
            }
            if (classList.includes('h3')) {
                styles.fontSize = 18;
                styles.bold = true;
            }
            if (classList.includes('text-muted')) styles.color = '#6c757d';
            if (classList.includes('text-primary')) styles.color = '#0d6efd';
            return styles;
        }

        function removeQuebras(texto) {
            if (typeof texto !== 'string') return texto;

            return texto
                .replace(/[\n\r]/g, ' ')        // remove quebras \n \r
                .replace(/<br\s*\/?>/gi, ' ')   // remove <br> ou <br/>
                .replace(/\s+/g, ' ')           // normaliza espaços múltiplos
                .trim();
        }
    // FIM PDF

    // Recuperar o caminho real onde o inwformrender.js está
    function getInwFormBuilderBasePath() {
        // Pega o script pelo nome do arquivo
        const script = document.querySelector('script[src*="inwformrender.js"]');
        
        if (!script) {
            console.warn("⚠️ Não foi possível localizar o script inwformrender.js na página.");
            return null;
        }

        const scriptPath = script.src;
        return scriptPath.substring(0, scriptPath.lastIndexOf('/'));
    }

    // Função para carregar componentes dinamicamente
    async function loadRenderComponents() {
        if (GSDebug){console.log('Carregando Componentes Padrão (row e col)...');}
        const components = {
            // Componentes base
            'row': {
                render: function(componentData, $container, readOnly, idGenerator) {
                    const $row = $('<div class="inw-row"></div>');
                    if (componentData.classes) {
                        const classes = componentData.classes.replace('form-row', '').trim();
                        $row.attr('class', 'inw-row ' + (classes || 'row'));
                    }
                    // Taggear metadados para coleta posterior
                    $row.attr('data-component-type', 'row');
                    if (componentData.id) {
                        $row.attr('data-component-id', idGenerator(componentData.id));
                    }
                    $container.append($row);
                    return $row;
                },
                getData: function($element) {
                    return {
                        type: 'row',
                        classes: $element.attr('class')
                    };
                }
            },
            'col': {
                render: function(componentData, $container, readOnly, idGenerator) {
                    const $col = $('<div class="inw-col"></div>');
                    if (componentData.classes) {
                        const classes = componentData.classes.replace('form-column', '').trim();
                        $col.attr('class', 'inw-col ' + (classes || 'col'));
                    }
                    // Taggear metadados para coleta posterior
                    $col.attr('data-component-type', 'col');
                    if (componentData.id) {
                        $col.attr('data-component-id', idGenerator(componentData.id));
                    }
                    $container.append($col);
                    return $col;
                },
                getData: function($element) {
                    return {
                        type: 'col',
                        classes: $element.attr('class')
                    };
                }
            }
        };

        // Carregar config se existir
        /*if (!window.INW_FORMBUILDER_CONFIG) {
            await new Promise((resolve) => {
                $.getScript('./config.js')
                    .done(resolve)
                    .fail(() => {
                        console.warn('⚠️ config.js não encontrado');
                        resolve();
                    });
            });
        }*/
        if (GSDebug){console.log('Detectando pasta base do inwformrender...');}
        // Detectar a pasta onde o inwformrender.js está
        const basePath = getInwFormBuilderBasePath();

        if (!basePath) {
            console.warn("⚠️ basePath não encontrado, abortando carregamento do config.js.");
            return;
        }
        if (GSDebug){console.log('Carregando config.js');}
        // Carregar config.js da mesma pasta
        if (!window.INW_FORMBUILDER_CONFIG) {
            await new Promise((resolve) => {
                $.getScript(`${basePath}/config.js`)
                    .done(resolve)
                    .fail(() => {
                        console.warn('⚠️ config.js não encontrado');
                        resolve();
                    });
            });
        }
        if (GSDebug){console.log('Carregando Componentes da Paleta...');}
        // Carregar componentes da paleta
        const paletteList = (window.INW_FORMBUILDER_CONFIG && window.INW_FORMBUILDER_CONFIG.palette) || [];
        
        for (const file of paletteList) {
            await new Promise((resolve) => {
                $.getScript(`${basePath}/${file}`)
                    .done(() => {
                        //console.log('✅ Carregado:', file);
                        resolve();
                    })
                    .fail((err) => {
                        console.warn('❌ Falha ao carregar:', file, err);
                        resolve();
                    });
            });
        }
        if (GSDebug){console.log('Adicionando componentes globais que tenham render e getData...');}
        // Adicionar componentes globais que tenham render e getData
        if (window.INW_COMPONENTS) {
            Object.keys(window.INW_COMPONENTS).forEach(componentType => {
                const component = window.INW_COMPONENTS[componentType];
                if (component && component.render && component.getData) {
                    // Criar wrapper para garantir que generateRenderId esteja disponível
                    components[componentType] = {
                        ...component,
                        render: function(componentData, $container, readOnly, idGenerator) {
                            const $element = component.render(componentData, $container, readOnly, idGenerator);
                            
                            if ($element) {
                                // Aplicar atributos usando o idGenerator fornecido
                                $element.attr('data-component-type', componentData.type);
                                if (componentData.id) {
                                    $element.attr('data-component-id', idGenerator(componentData.id));
                                }
                                if (componentData.name) {
                                    $element.attr('data-component-name', idGenerator(componentData.name));
                                }

                                // Adicionar classe para campos
                                if (!componentData.isContainer && !$element.hasClass('inw-row') && !$element.hasClass('inw-col')) {
                                    $element.addClass('inw-field');
                                }
                            }
                            
                            return $element;
                        },
                        getData: component.getData
                    };
                    //console.log('✅ Componente adicionado:', componentType);
                } else {
                    console.warn('⚠️ Componente sem render/getData:', componentType);
                }
            });
        }

        //console.log('📦 Componentes carregados:', Object.keys(components));
        return components;
    }

    // Carregar libs para PDF (html2pdf)
    /*async function ensurePdfLibs() {
        return new Promise((resolve) => {
            if (window.pdfMake) return resolve();
            // Carregar pdfmake
            const scriptPDFMaker = document.createElement('script');
            scriptPDFMaker.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/pdfmake.min.js';
            scriptPDFMaker.onload = () => {
                // Carregar fonts
                const fontsScript = document.createElement('script');
                fontsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/vfs_fonts.js';
                fontsScript.onload = () => resolve();
                fontsScript.onerror = () => {
                    console.warn('❌ Falha ao carregar vfs_fonts.js');
                    resolve();
                };
                document.head.appendChild(fontsScript);
            };
            scriptPDFMaker.onerror = () => {
                console.warn('❌ Falha ao carregar pdfmake.js');
                resolve();
            };

            if (window.html2pdf) return resolve();
            const scripthtml2pdf = document.createElement('script');
            scripthtml2pdf.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js';
            scripthtml2pdf.onload = () => resolve();
            scripthtml2pdf.onerror = () => {
                console.warn('❌ Falha ao carregar html2pdf.js');
                resolve();
            };
            document.head.appendChild(scriptPDFMaker);
            document.head.appendChild(scripthtml2pdf);
        });
    }*/

    async function ensurePdfMakeLibs() {
        return new Promise((resolve) => {
            if (window.pdfMake) return resolve();
            
            // Carregar pdfmake
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/pdfmake.min.js';
            script.onload = () => {
                // Carregar fonts
                const fontsScript = document.createElement('script');
                fontsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/vfs_fonts.js';
                fontsScript.onload = () => resolve();
                fontsScript.onerror = () => {
                    console.warn('❌ Falha ao carregar vfs_fonts.js');
                    resolve();
                };
                document.head.appendChild(fontsScript);
            };
            script.onerror = () => {
                console.warn('❌ Falha ao carregar pdfmake.js');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    // Construir HTML imprimível a partir do formData do render
    function buildPrintableHtml(formData) {
        const $wrapper = $('<div class="inw-printable"></div>');
        const $content = $('<div class="inw-printable-content"></div>');
        $wrapper.append($content);

        /*function appendLabel(comp) {
            console.log(comp);
            const $el = $(`<div class="inw-pdf-label ${comp.attributes['class']}">${escapeHtml(comp.label || '')}</div>`);
            $content.append($el);
        }*/
        function appendLabel(comp) {
            // Obter classes do componente
            const classes = comp.attributes?.class || '';
            
            // Criar elemento com classes apropriadas
            const $el = $(`<div class="inw-pdf-label">${escapeHtml(comp.label || '')}</div>`);
            
            // Aplicar estilos baseados nas classes
            if (classes.includes('fw-bold')) $el.css('font-weight', 'bold');
            if (classes.includes('h5')) {
                $el.css('font-size', '14px');
                $el.css('font-weight', 'bold');
            }
            if (classes.includes('h4')) {
                $el.css('font-size', '16px');
                $el.css('font-weight', 'bold');
            }
            if (classes.includes('h3')) {
                $el.css('font-size', '18px');
                $el.css('font-weight', 'bold');
            }
            if (classes.includes('text-muted')) $el.css('color', '#6c757d');
            if (classes.includes('text-primary')) $el.css('color', '#0d6efd');
            
            // Ajustar margem
            $el.css('margin', '0 0 2px 0');
            
            $content.append($el);
        }

        function appendQuestion(question, answerLines) {
            const $q = $(`<div class="inw-pdf-question">${escapeHtml(question || '')}</div>`);
            $content.append($q);
            (answerLines || []).forEach(line => {
                const $a = $(`<div class="inw-pdf-answer">${escapeHtml(line || '')}</div>`);
                $content.append($a);
            });
        }

        function appendOptions(question, options, selectedValues, isMultiple) {
            const $q = $(`<div class="inw-pdf-question">${escapeHtml(question || '')}</div>`);
            $content.append($q);
            const normalizedSelected = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
            (options || []).forEach(opt => {
                const isSelected = normalizedSelected && normalizedSelected.includes(opt.value);
                const mark = isSelected ? 'X' : '&nbsp;&nbsp;&nbsp;';
                let lineLabel = String(opt.label || '');
                if (isSelected && opt.other && opt.otherValue) {
                    // Anexa o texto digitado em "Outros" à linha selecionada
                    lineLabel = `${lineLabel} ${opt.otherValue}`;
                }
                const $o = $(`<div class="inw-pdf-option">${mark} ${escapeHtml(lineLabel)}</div>`);
                $content.append($o);
            });
        }

        function walk(components) {
            (components || []).forEach(comp => {
                if (!comp || !comp.type) return;
                if (comp.children && comp.children.length) {
                    walk(comp.children);
                    return;
                }

                // Campos finais
                if (comp.type === 'label') {
                    appendLabel(comp || '');
                } else if (comp.type === 'input' || comp.type === 'textarea') {
                    appendQuestion(comp.label || '', [valueToString(comp.value)]);
                } else if (comp.type === 'select') {
                    // Exibir a descrição (label) da opção selecionada
                    const selectedLabels = [];
                    const selectedValue = comp.value;
                    (comp.options || []).forEach(opt => {
                        if (selectedValue === opt.value) selectedLabels.push(opt.label);
                    });
                    appendQuestion(comp.label || '', [valueToString(selectedLabels)]);
                } else if (comp.type === 'radio') {
                    appendOptions(comp.label || '', comp.options || [], comp.value || '', false);
                } else if (comp.type === 'checkbox') {
                    appendOptions(comp.label || '', comp.options || [], Array.isArray(comp.value) ? comp.value : [], true);
                }
            });
        }

        function valueToString(v) {
            if (v == null) return '';
            if (Array.isArray(v)) return v.join(', ');
            return String(v);
        }

        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // Estilos embutidos para PDF
        const styles = `
            <style>
                .inw-row, .inw-col { margin:0; padding: 0; }
                .inw-printable { font-family: Arial, Helvetica, sans-serif; color: #212529; }
                .inw-printable-content { width: 100%; }
                .inw-pdf-label { font-weight: 700; font-size: 14px; margin:  0; }
                .inw-pdf-question { font-weight: 700; font-size: 12px; margin-top: 12px; }
                .inw-pdf-answer { font-size: 12px; margin: 2px 0 0 0; padding-left: 8px; white-space: pre-wrap; }
                .inw-pdf-option { font-size: 12px; margin: 2px 0 0 0; padding-left: 8px; }
                /* Classes de texto */
                .inw-printable .fw-bold {font-weight: 700 !important;}
                .inw-printable .h5, .inw-printable h5 {font-size: 1.25rem;font-weight: 500;line-height: 1.2;}
                .inw-printable .h4, .inw-printable h4 {font-size: 1.5rem;font-weight: 500;line-height: 1.2;}
                .inw-printable .h3, .inw-printable h3 {font-size: 1.75rem;font-weight: 500;line-height: 1.2;}
                .inw-printable .text-muted {color: #6c757d !important;}
                .inw-printable .text-primary {color: #0d6efd !important;}
            </style>
        `;

        $wrapper.prepend(styles);
        walk(formData.components || []);
        return $wrapper[0];
    }

    // Função para construir a definição do PDF no formato pdfmake
    function buildPrintablePDF(formData) {
        const content = [];
        
        function processComponent(component) {
            if (!component || !component.type) return;
            //console.log(component);
            // Se for container, processar filhos
            if (component.children && component.children.length > 0) {
                component.children.forEach(processComponent);
                return;
            }
            
            // Processar campos específicos
            switch(component.type) {
                case 'label':
                    content.push({
                        text: component.label || '',
                        style: 'label',
                        margin: [0, 5, 0, 2]
                    });
                    break;
                    
                case 'input':
                case 'textarea':
                    content.push(
                        {
                            text: component.label || '',
                            style: 'question',
                            margin: [0, 10, 0, 2]
                        },
                        {
                            text: component.value || '',
                            style: 'answer',
                            margin: [0, 0, 0, 10]
                        }
                    );
                    break;
                    
                case 'select':
                    const selectedOption = (component.options || []).find(opt => 
                        opt.value === component.value
                    );
                    content.push(
                        {
                            text: component.label || '',
                            style: 'question',
                            margin: [0, 10, 0, 2]
                        },
                        {
                            text: selectedOption ? selectedOption.label : '',
                            style: 'answer',
                            margin: [0, 0, 0, 10]
                        }
                    );
                    break;
                    
                case 'radio':
                    content.push({
                        text: component.label || '',
                        style: 'question',
                        margin: [0, 10, 0, 5]
                    });
                    
                    (component.options || []).forEach(option => {
                        const isSelected = component.value === option.value;
                        const marker = isSelected ? '(X)' : '(   )';
                        let optionText = `${marker} ${option.label || ''}`;
                        
                        if (isSelected && option.other && option.otherValue) {
                            optionText += `: ${option.otherValue}`;
                        }
                        
                        content.push({
                            text: optionText,
                            style: 'option',
                            margin: [10, 1, 0, 1]
                        });
                    });
                    content.push({text: '', margin: [0, 0, 0, 10]});
                    break;
                    
                case 'checkbox':
                    content.push({
                        text: component.label || '',
                        style: 'question',
                        margin: [0, 10, 0, 5]
                    });
                    
                    const selectedValues = Array.isArray(component.value) ? component.value : [];
                    
                    (component.options || []).forEach(option => {
                        const isSelected = selectedValues.includes(option.value);
                        const marker = isSelected ? '[X]' : '[   ]';
                        let optionText = `${marker} ${option.label || ''}`;
                        
                        if (isSelected && option.other && option.otherValue) {
                            optionText += `: ${option.otherValue}`;
                        }
                        
                        content.push({
                            text: optionText,
                            style: 'option',
                            margin: [10, 1, 0, 1]
                        });
                    });
                    content.push({text: '', margin: [0, 0, 0, 10]});
                    break;
            }
        }
        
        // Processar todos os componentes
        (formData.components || []).forEach(processComponent);
        
        return content;
    }

    // Plugin principal
    $.fn.INWformRender = function(options) {
        // Chamada de método
        if (typeof options === 'string') {
            const method = options;
            const args = Array.prototype.slice.call(arguments, 1);
            
            const results = [];
            this.each(function() {
                const instance = $(this).data('INWformRender');
                if (instance && typeof instance[method] === 'function') {
                    results.push(instance[method].apply(instance, args));
                } else {
                    console.warn('❌ Renderizador não inicializado ou método não encontrado:', method);
                    results.push(undefined);
                }
            });
            
            return this.length === 1 ? results[0] : results;
        }

        // Inicialização
        return this.each(async function() {
            const $container = $(this);
            const settings = $.extend({
                formData: null,
                readOnly: false,
                debug: false,
                renderBorder: {
                    size: '2px',
                    style: 'solid',
                            /*solid: Linha contínua.
                            dashed: Linha tracejada (traços).
                            dotted: Linha pontilhada (pontos).
                            double: Duas linhas.
                            none: Sem borda (padrão).
                            hidden: Borda oculta, mas ocupa espaço (útil para tabelas).
                            groove, ridge, inset, outset*/
                    color: 'rgb(108, 117, 125)'
                },
                HTML: {
                    head: '',
                    footer: '',
                    css:'',
                    paginacao: {
                        active: false,
                        formato: 'Página % de %%',
                        posicao: 'right' //left/center/right
                    }
                }
            }, options);
            this.GSDebug = settings.debug;

            const borderConfig = settings?.renderBorder ?? {};
            const $BSize = borderConfig.size != null ? borderConfig.size : '2px';
            const $BStyle = borderConfig.style != null ? borderConfig.style : 'dashed';
            const $BColor = borderConfig.color != null ? borderConfig.color : '#6c757d';

            $container.css('border', `${$BSize} ${$BStyle} ${$BColor}`).css('border-radius', '10px').css('padding','0px 10px 0px 10px').css('min-height', '70px');

            try {
                if (settings.debug){
                    console.log('🚀 Iniciando INW Form Render...');
                    console.log('Carregando Componentes');
                }

                // Carregar componentes
                const components = await loadRenderComponents();

                if (settings.debug){console.log('Verificando dados do formulario...');}
                // Verificar dados do formulário
                if (!settings.formData || !settings.formData.components) {
                    //throw new Error('Dados do formulário inválidos');
                    if(settings.debug){ console.warn(`Dados do formulário inválidos`); console.log('Criando formData vazio.') }
                    settings.formData = {"components": []};
                    //return null;
                }

                if (settings.debug){console.log('Limpando container...');}
                // Limpar container e adicionar CSS encapsulado
                $container.addClass('inw-form-render').empty();
                
                if (settings.debug){console.log('Adicionando CSS especifico para este contaier...');}
                // Adicionar CSS específico para este container
                const styleId = 'inw-styles-' + Math.random().toString(36).substr(2, 9);
                $container.attr('data-inw-style', styleId);
                addScopedStyles(styleId);

                if (settings.debug){console.log('Renderizando componentes...');}
                // Renderizar componentes
                function renderComponent(componentData, $parent) {
                    const component = components[componentData.type];
                    if (!component) {
                        console.warn(`⚠️ Componente não encontrado: ${componentData.type}`);
                        return null;
                    }

                    // Renderizar o componente passando o idGenerator
                    const $element = component.render(
                        componentData, 
                        $parent, 
                        settings.readOnly,
                        generateRenderId // Passar a função como parâmetro
                    );
                    
                    if (!$element) return null;

                    // Renderizar filhos
                    if (componentData.children && componentData.children.length > 0) {
                        componentData.children.forEach(child => {
                            renderComponent(child, $element);
                        });
                    }

                    return $element;
                }

                // Renderizar todos os componentes
                if (settings.formData.components?.length) {
                    settings.formData.components.forEach(component => {
                        renderComponent(component, $container);
                    });
                } else {
                    $container.html('<div class="empty-canvas-message text-center text-muted py-5"><h6>Não há componentes para exibir</h6></div>');
                }

                // Funções públicas
                const instance = {
                    getRoot: function() { return $container; },
                    getFormData: function() {
                        function parseComponent($element) {
                            if (!$element.length) return null;

                            let componentType = $element.attr('data-component-type');
                            // Inferir tipo para containers que possam não ter sido marcados por terceiros
                            if (!componentType) {
                                if ($element.hasClass('inw-row')) componentType = 'row';
                                else if ($element.hasClass('inw-col')) componentType = 'col';
                            }
                            const component = components[componentType];
                            
                            if (!component) return null;

                            const componentData = {
                                type: componentType,
                                id: $element.attr('data-component-id') || '',
                                name: $element.attr('data-component-name') || ''
                            };

                            // Containers
                            if ($element.hasClass('inw-row') || $element.hasClass('inw-col')) {
                                // Persistir classes para row/col
                                componentData.classes = $element.attr('class');
                                componentData.children = [];
                                $element.children().each(function() {
                                    const childComponent = parseComponent($(this));
                                    if (childComponent) componentData.children.push(childComponent);
                                });
                            } 
                            // Campos
                            else if ($element.hasClass('inw-field') && component.getData) {
                                Object.assign(componentData, component.getData($element));
                            }

                            return componentData;
                        }

                        const formData = {
                            components: [],
                            metadata: {
                                collected: new Date().toISOString(),
                                version: '1.0'
                            }
                        };

                        $container.find('.inw-row').each(function() {
                            const component = parseComponent($(this));
                            if (component) formData.components.push(component);
                        });

                        return formData;
                    },

                    getJSON: function(pretty = false) {
                        const formData = this.getFormData();
                        return pretty ? JSON.stringify(formData, null, 2) : JSON.stringify(formData);
                    },

                    loadFromURL: async function(opts) {
                        const options = opts || {};
                        const url = options.url;
                        if (!url) return;
                        const method = (options.method || 'GET').toUpperCase();
                        const params = options.params || {};
                        const headers = options.headers || { 'Content-Type': 'application/json' };
                        const responsePath = options.responsePath || null; // ex: 'data.form'

                        function buildUrlWithQuery(base, queryObj) {
                            const u = new URL(base, window.location.href);
                            Object.keys(queryObj || {}).forEach(k => {
                                if (queryObj[k] !== undefined && queryObj[k] !== null) {
                                    u.searchParams.set(k, String(queryObj[k]));
                                }
                            });
                            return u.toString();
                        }

                        function pick(obj, path) {
                            if (!path) return obj;
                            return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
                        }

                        let fetchUrl = url;
                        const fetchInit = { method, headers };
                        if (method === 'GET') {
                            fetchUrl = buildUrlWithQuery(url, params);
                        } else {
                            fetchInit.body = JSON.stringify(params);
                        }

                        const res = await fetch(fetchUrl, fetchInit);
                        if (!res.ok) throw new Error('Falha ao carregar JSON do servidor');
                        const data = await res.json();
                        const payload = pick(data, responsePath) || data;
                        this.loadFromJSON(payload, { readOnly: options.readOnly === true });
                    },

                    // Retorna um elemento DOM com o HTML imprimível (sem inputs)
                    getPrintableElement: function(formDataOverride) {
                        const data = formDataOverride || this.getFormData();
                        return buildPrintableHtml(data);
                    },

                    // Gera PDF profissional a partir do JSON do render (ou de um fornecido)
                    exportPDF: async function(options = {}) {
                        const filename = options.filename || 'formulario.pdf';
                        const data = options.formData || this.getFormData();
                        const that = this;
                        
                        await ensurePdfMakeLibs();
                        if (!window.pdfMake) {
                            console.warn('pdfmake não disponível');
                            return;
                        }
                        
                        try {
                            console.log('📦 Gerando PDF com pdfmake...');
                            
                            // Construir conteúdo do PDF
                            const content = this.buildPrintablePDF(data);
                            
                            // Parse do header com estilos
                            const headerData = settings.HTML.head ? 
                                this.parseHtmlStyles(settings.HTML.head) : null;
                            
                            // Parse do footer com estilos
                            const footerData = settings.HTML.footer ? 
                                this.parseHtmlStyles(settings.HTML.footer) : null;

                            // Configuração do documento com estilos dinâmicos
                            const docDefinition = {
                                // Header com estilos dinâmicos
                                header: headerData ? {
                                    text: headerData.text,
                                    alignment: headerData.styles.alignment || 'center',
                                    fontSize: headerData.styles.fontSize || 10,
                                    bold: headerData.styles.bold !== undefined ? headerData.styles.bold : false,
                                    color: headerData.styles.color,
                                    background: headerData.styles.background,
                                    margin: headerData.styles.margin || [0, 15, 0, 0],
                                    border: headerData.styles.border
                                } : null,
                                
                                // Footer com estilos dinâmicos
                                footer: function(currentPage, pageCount) {
                                    const footerParts = [];
                                    
                                    // Footer personalizado
                                    if (footerData) {
                                        footerParts.push({
                                            text: footerData.text,
                                            alignment: footerData.styles.alignment || 'center',
                                            fontSize: footerData.styles.fontSize || 8,
                                            bold: footerData.styles.bold !== undefined ? footerData.styles.bold : false,
                                            color: footerData.styles.color || '#666666',
                                            background: footerData.styles.background,
                                            margin: footerData.styles.margin || [40, 20, 40, 0],
                                            border: footerData.styles.border
                                        });
                                    }
                                    
                                    // Paginação
                                    if (settings.HTML.paginacao.active) {
                                        let textoPaginacao = settings.HTML.paginacao.formato
                                            .replace('%', currentPage.toString())
                                            .replace('%%', pageCount.toString());
                                        
                                        footerParts.push({
                                            text: textoPaginacao,
                                            fontSize: 8,
                                            alignment: settings.HTML.paginacao.posicao || 'center',
                                            margin: [40, 20, 40, 0]
                                        });
                                    }
                                    
                                    return footerParts.length > 0 ? { stack: footerParts } : null;
                                },
                                
                                // Conteúdo principal
                                content: content,
                                
                                // Estilos padrão (podem ser sobrescritos pelos estilos inline)
                                styles: {
                                    label: {
                                        fontSize: 14,
                                        bold: false,
                                        color: '#000',
                                        margin: [0, 5, 0, 2]
                                    },
                                    question: {
                                        fontSize: 12,
                                        bold: true,
                                        color: '#000',
                                        margin: [0, 10, 0, 2]
                                    },
                                    answer: {
                                        fontSize: 11,
                                        color: '#000',
                                        margin: [0, 0, 0, 10]
                                    },
                                    option: {
                                        fontSize: 10,
                                        color: '#000',
                                        margin: [10, 1, 0, 1]
                                    }
                                },
                                
                                defaultStyle: {
                                    fontSize: 12,
                                    lineHeight: 1.3
                                },
                                
                                pageSize: 'A4',
                                pageOrientation: 'portrait',
                                pageMargins: [40, 80, 40, 80]
                            };

                            pdfMake.createPdf(docDefinition).download(filename);
                            console.log('✅ PDF gerado com sucesso!');
                            
                        } catch (error) {
                            console.error('💥 Erro ao gerar PDF:', error);
                        }
                    },

                    // Nova função para construir PDF
                    /*buildPrintablePDF: function(formData) {
                        const content = [];
                        const that = this;
                        //console.log(formData.components);
                        function processComponent(component) {
                            if (!component || !component.type) return;
                            
                            // Se for container, processar filhos
                            if (component.children && component.children.length > 0) {
                                component.children.forEach(processComponent);
                                return;
                            }
                            
                            // Processar campos específicos
                            switch(component.type) {
                                case 'label':
                                    content.push({
                                        text: component.label || '',
                                        style: 'label'
                                    });
                                    break;
                                    
                                case 'input':
                                case 'textarea':
                                    content.push(
                                        { text: component.label || '', style: 'question' },
                                        { text: component.value || '_________________________', style: 'answer' }
                                    );
                                    break;
                                    
                                case 'select':
                                    const selectedOption = (component.options || []).find(opt => 
                                        opt.value === component.value
                                    );
                                    content.push(
                                        { text: component.label || '', style: 'question' },
                                        { 
                                            text: selectedOption ? selectedOption.label : '_________________________', 
                                            style: 'answer' 
                                        }
                                    );
                                    break;
                                    
                                case 'radio':
                                    content.push({ text: component.label || '', style: 'question' });
                                    
                                    (component.options || []).forEach(option => {
                                        const isSelected = component.value === option.value;
                                        const marker = isSelected ? '☑' : '[X]';
                                        content.push({
                                            text: `${marker} ${option.label || ''}`,
                                            style: 'option'
                                        });
                                    });
                                    content.push({ text: '', margin: [0, 0, 0, 10] });
                                    break;
                                    
                                case 'checkbox':
                                    content.push({ text: component.label || '', style: 'question' });
                                    
                                    const selectedValues = Array.isArray(component.value) ? component.value : [];
                                    (component.options || []).forEach(option => {
                                        const isSelected = selectedValues.includes(option.value);
                                        const marker = isSelected ? '☑' : '[X]';
                                        content.push({
                                            text: `${marker} ${option.label || ''}`,
                                            style: 'option'
                                        });
                                    });
                                    content.push({ text: '', margin: [0, 0, 0, 10] });
                                    break;
                            }
                        }
                        
                        // Processar todos os componentes
                        (formData.components || []).forEach(processComponent);
                        
                        return content;
                    },*/
                    /*buildPrintablePDF: function(formData) {
                        const content = [];
                        const that = this;

                        function getLgSize(classList) {
                            const match = classList.match(/col-lg-(\d+)/);
                            return match ? parseInt(match[1], 10) : 12;
                        }

                        function processField(component) {
                            switch(component.type) {
                                case 'label':
                                    return [{ text: component.label || '', style: 'label' }];
                                case 'input':
                                case 'textarea':
                                    return [
                                        { text: component.label || '', style: 'question' },
                                        { text: component.value || '', style: 'answer' }
                                    ];
                                case 'select':
                                    const selectedOption = (component.options || []).find(opt => opt.value === component.value);
                                    return [
                                        { text: component.label || '', style: 'question' },
                                        { text: selectedOption ? selectedOption.label : '', style: 'answer' }
                                    ];
                                case 'radio':
                                    const radio = [{ text: component.label || '', style: 'question' }];
                                    (component.options || []).forEach(opt => {
                                        const marker = component.value === opt.value ? '(X)' : '(   )';
                                        radio.push({ text: `${marker} ${opt.label}`, style: 'option' });
                                    });
                                    return radio;
                                case 'checkbox':
                                    const box = [{ text: component.label || '', style: 'question' }];
                                    const selectedValues = Array.isArray(component.value) ? component.value : [];
                                    (component.options || []).forEach(opt => {
                                        const marker = selectedValues.includes(opt.value) ? '[X]' : '[   ]';
                                        box.push({ text: `${marker} ${opt.label}`, style: 'option' });
                                    });
                                    return box;
                            }
                            return [];
                        }

                        function processComponent(component) {
                            if (component.type === 'row') {
                                const columns = [];

                                component.children.forEach(col => {
                                    const lgSize = getLgSize(col.classes);
                                    const width = (lgSize / 12) * 100 + '%';

                                    const columnStack = [];

                                    col.children.forEach(child => {
                                        columnStack.push(...processField(child));
                                    });

                                    columns.push({
                                        width: width,
                                        stack: columnStack
                                    });
                                });

                                content.push({ columns: columns, margin: [0, 5, 0, 10] });
                                return;
                            }

                            // fallback (não é row)
                            if (component.children) {
                                component.children.forEach(processComponent);
                            }
                        }

                        (formData.components || []).forEach(processComponent);

                        return content;
                    },
    
                    // Função para remover HTML
                    // Substitua a função stripHtml por esta:
                    parseHtmlStyles: function(html) {
                        if (!html) return { text: '', styles: {} };
                        
                        // Extrair texto (remover tags HTML)
                        const text = html.replace(/<[^>]*>/g, '');
                        
                        // Extrair estilos inline
                        const styles = {};
                        const styleMatch = html.match(/style="([^"]*)"/);
                        
                        if (styleMatch) {
                            const styleString = styleMatch[1];
                            const stylePairs = styleString.split(';');
                            
                            stylePairs.forEach(pair => {
                                const [key, value] = pair.split(':').map(s => s.trim());
                                if (key && value) {
                                    // Mapear propriedades CSS para propriedades pdfmake
                                    switch(key) {
                                        case 'text-align':
                                            styles.alignment = value;
                                            break;
                                        case 'font-size':
                                            // Converter px para pt (aproximação: 1px = 0.75pt)
                                            const sizeMatch = value.match(/(\d+)px/);
                                            if (sizeMatch) {
                                                styles.fontSize = parseInt(sizeMatch[1]) * 0.75;
                                            } else {
                                                styles.fontSize = parseInt(value) || 12;
                                            }
                                            break;
                                        case 'color':
                                            styles.color = value;
                                            break;
                                        case 'font-weight':
                                            styles.bold = value === 'bold' || parseInt(value) >= 700;
                                            break;
                                        case 'background-color':
                                            styles.background = value;
                                            break;
                                        case 'padding':
                                            styles.margin = this.parsePadding(value);
                                            break;
                                        case 'margin':
                                            styles.margin = this.parseMargin(value);
                                            break;
                                        case 'border':
                                            // Simplificação básica de bordas
                                            if (value.includes('solid')) {
                                                styles.border = [true, true, true, true];
                                            }
                                            break;
                                    }
                                }
                            });
                        }
                        
                        return { text, styles };
                    },

                    // Funções auxiliares para parse de padding/margin
                    parsePadding: function(paddingValue) {
                        const parts = paddingValue.split(' ').map(p => parseInt(p) || 0);
                        if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
                        if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
                        if (parts.length === 4) return [parts[0], parts[1], parts[2], parts[3]];
                        return [0, 0, 0, 0];
                    },

                    parseMargin: function(marginValue) {
                        return this.parsePadding(marginValue); // mesma lógica
                    },*/

                    // Na instância, substitua:
                    buildPrintablePDF: function(formData) {
                        return buildPrintablePDFFromJSON(formData);
                    },

                    parseHtmlStyles: function(html) {
                        return parseHtmlStyles(html);
                    },

                    parsePadding: function(paddingValue) {
                        return parsePadding(paddingValue);
                    },

                    parseMargin: function(marginValue) {
                        return parseMargin(marginValue);
                    },

                    // Retorna o PDF como Blob URL (versão pdfmake)
                    exportPDFBlobUrl: async function(options = {}) {
                        const data = options.formData || this.getFormData();
                        
                        await ensurePdfMakeLibs();
                        if (!window.pdfMake) {
                            console.warn('pdfmake não disponível');
                            return null;
                        }
                        
                        try {
                            // Construir conteúdo do PDF
                            const content = this.buildPrintablePDF(data);
                            
                            // Parse do header e footer com estilos
                            const headerData = settings.HTML.head ? 
                                this.parseHtmlStyles(settings.HTML.head) : null;
                            const footerData = settings.HTML.footer ? 
                                this.parseHtmlStyles(settings.HTML.footer) : null;
                            const that = this;

                            // Configuração do documento
                            const docDefinition = {
                                // Header com estilos dinâmicos
                                header: headerData ? {
                                    text: headerData.text,
                                    alignment: headerData.styles.alignment || 'center',
                                    fontSize: headerData.styles.fontSize || 10,
                                    bold: headerData.styles.bold !== undefined ? headerData.styles.bold : false,
                                    color: headerData.styles.color,
                                    background: headerData.styles.background,
                                    margin: headerData.styles.margin || [0, 15, 0, 0]
                                } : null,
                                
                                // Footer com estilos dinâmicos e paginação
                                footer: (settings.HTML.footer || settings.HTML.paginacao.active) ? 
                                    function(currentPage, pageCount) {
                                        const footerParts = [];
                                        
                                        // Footer personalizado
                                        if (footerData) {
                                            footerParts.push({
                                                text: footerData.text,
                                                alignment: footerData.styles.alignment || 'center',
                                                fontSize: footerData.styles.fontSize || 8,
                                                bold: footerData.styles.bold !== undefined ? footerData.styles.bold : false,
                                                color: footerData.styles.color || '#666666',
                                                margin: footerData.styles.margin || [40, 20, 40, 0]
                                            });
                                        }
                                        
                                        // Paginação
                                        if (settings.HTML.paginacao.active) {
                                            let textoPaginacao = settings.HTML.paginacao.formato
                                                .replace('%', currentPage.toString())
                                                .replace('%%', pageCount.toString());
                                            
                                            footerParts.push({
                                                text: textoPaginacao,
                                                fontSize: 8,
                                                alignment: settings.HTML.paginacao.posicao || 'center',
                                                margin: [40, 20, 40, 0]
                                            });
                                        }
                                        
                                        return footerParts.length > 0 ? { stack: footerParts } : null;
                                    } : null,
                                
                                // Conteúdo principal
                                content: content,
                                
                                // Estilos
                                styles: {
                                    label: {
                                        fontSize: 14,
                                        bold: false,
                                        color: '#000',
                                        margin: [0, 5, 0, 2]
                                    },
                                    question: {
                                        fontSize: 12,
                                        bold: true,
                                        color: '#000',
                                        margin: [0, 10, 0, 2]
                                    },
                                    answer: {
                                        fontSize: 11,
                                        color: '#000',
                                        margin: [0, 0, 0, 10]
                                    },
                                    option: {
                                        fontSize: 10,
                                        color: '#000',
                                        margin: [10, 1, 0, 1]
                                    }
                                },
                                
                                defaultStyle: {
                                    fontSize: 12,
                                    lineHeight: 1.3
                                },
                                
                                // METADADOS DO PDF (incluindo nome)
                                info: {
                                    title: options.fileName || 'Formulário Gerado', // Nome do documento
                                    author: 'Sistema de Formulários',
                                    subject: 'Formulário Preenchido',
                                    keywords: 'formulário, pdf, questionário',
                                    creator: 'Inovativa Web'
                                },

                                pageSize: 'A4',
                                pageOrientation: 'portrait',
                                pageMargins: [40, 80, 40, 80]
                            };

                            // Retornar como Blob URL
                            return new Promise((resolve, reject) => {
                                pdfMake.createPdf(docDefinition).getBlob((blob) => {
                                    const url = URL.createObjectURL(blob);
                                    resolve(url);
                                });
                            });
                            
                        } catch (error) {
                            console.error('💥 Erro ao gerar PDF Blob URL:', error);
                            return null;
                        }
                    },

                    // Retorna o PDF como Data URL (versão pdfmake)
                    exportPDFDataUrl: async function(options = {}) {
                        const data = options.formData || this.getFormData();
                        
                        await ensurePdfMakeLibs();
                        if (!window.pdfMake) {
                            console.warn('pdfmake não disponível');
                            return null;
                        }
                        
                        try {
                            // Construir conteúdo do PDF (mesma lógica do exportPDFBlobUrl)
                            const content = this.buildPrintablePDF(data);
                            
                            // Parse do header e footer com estilos
                            const headerData = settings.HTML.head ? 
                                this.parseHtmlStyles(settings.HTML.head) : null;
                            const footerData = settings.HTML.footer ? 
                                this.parseHtmlStyles(settings.HTML.footer) : null;
                            const that = this;
                            console.log('dataURL',content);
                            const docDefinition = {
                                header: headerData ? {
                                    text: headerData.text,
                                    alignment: headerData.styles.alignment || 'center',
                                    fontSize: headerData.styles.fontSize || 10,
                                    bold: headerData.styles.bold !== undefined ? headerData.styles.bold : false,
                                    color: headerData.styles.color,
                                    margin: headerData.styles.margin || [0, 15, 0, 0]
                                } : null,
                                
                                footer: (settings.HTML.footer || settings.HTML.paginacao.active) ? 
                                    function(currentPage, pageCount) {
                                        const footerParts = [];
                                        
                                        if (footerData) {
                                            footerParts.push({
                                                text: footerData.text,
                                                alignment: footerData.styles.alignment || 'center',
                                                fontSize: footerData.styles.fontSize || 8,
                                                color: footerData.styles.color || '#666666',
                                                margin: footerData.styles.margin || [40, 20, 40, 0]
                                            });
                                        }
                                        
                                        if (settings.HTML.paginacao.active) {
                                            let textoPaginacao = settings.HTML.paginacao.formato
                                                .replace('%', currentPage.toString())
                                                .replace('%%', pageCount.toString());
                                            
                                            footerParts.push({
                                                text: textoPaginacao,
                                                fontSize: 8,
                                                alignment: settings.HTML.paginacao.posicao || 'center',
                                                margin: [40, 20, 40, 0]
                                            });
                                        }
                                        
                                        return footerParts.length > 0 ? { stack: footerParts } : null;
                                    } : null,
                                
                                content: content,
                                // Estilos
                                styles: {
                                    label: {
                                        fontSize: 14,
                                        bold: false,
                                        color: '#000',
                                        margin: [0, 5, 0, 2]
                                    },
                                    question: {
                                        fontSize: 12,
                                        bold: true,
                                        color: '#000',
                                        margin: [0, 10, 0, 2]
                                    },
                                    answer: {
                                        fontSize: 11,
                                        color: '#000',
                                        margin: [0, 0, 0, 10]
                                    },
                                    option: {
                                        fontSize: 10,
                                        color: '#000',
                                        margin: [10, 1, 0, 1]
                                    }
                                },
                                
                                defaultStyle: {
                                    fontSize: 12,
                                    lineHeight: 1.3
                                },
                                
                                // METADADOS DO PDF (incluindo nome)
                                info: {
                                    title: settings.fileName || 'Formulário Gerado', // Nome do documento
                                    author: 'Sistema de Formulários',
                                    subject: 'Formulário Preenchido',
                                    keywords: 'formulário, pdf, questionário',
                                    creator: 'Inovativa Web'
                                },

                                pageSize: 'A4',
                                pageOrientation: 'portrait',
                                pageMargins: [40, 80, 40, 80]
                            };

                            // Retornar como Data URL
                            return new Promise((resolve, reject) => {
                                pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
                                    resolve(dataUrl);
                                });
                            });
                            
                        } catch (error) {
                            console.error('💥 Erro ao gerar PDF Data URL:', error);
                            return null;
                        }
                    },

                    // Novo: recarregar formulário a partir de um JSON coletado do próprio render
                    loadFromJSON: function(formData, options = {}) {
                        if (!formData || !formData.components) return;
                        const readOnly = options.readOnly === true;
                        $container.empty();
                        // Re-renderizar utilizando o mesmo pipeline para respeitar os componentes
                        // Renderizar todos os componentes
                        if (formData.components?.length) {
                            formData.components.forEach(component => {
                                renderComponent(component, $container);
                            });
                        } else {
                            $container.html('<div class="empty-canvas-message text-center text-muted py-5"><h6>Não há componentes para exibir</h6></div>');
                        }


                        
                        // Aplicar modo readonly se solicitado
                        if (readOnly) {
                            $container.find('input, select, textarea').each(function() {
                                const $f = $(this);
                                if ($f.is('select')) {
                                    $f.prop('disabled', true);
                                } else {
                                    $f.prop('readonly', true);
                                }
                            });
                        }
                    },

                    clear: function() {
                        $container.empty();
                        return this;
                    },

                    validate: function() {
                        let isValid = true;
                        
                        $container.find('input, select, textarea').each(function() {
                            const $field = $(this);
                            const isRequired = $field.prop('required');
                            const value = $field.val();
                            const type = $field.attr('type');
                            
                            if (isRequired) {
                                if (type === 'checkbox' || type === 'radio') {
                                    const name = $field.attr('name');
                                    const isChecked = $(`input[name="${name}"]:checked`).length > 0;
                                    if (!isChecked) {
                                        isValid = false;
                                        highlightError($field, 'Seleção obrigatória');
                                    } else {
                                        clearError($field);
                                    }
                                } else if (!value || value.toString().trim() === '') {
                                    isValid = false;
                                    highlightError($field, 'Campo obrigatório');
                                } else {
                                    clearError($field);
                                }
                            } else {
                                clearError($field);
                            }
                        });
                        
                        return isValid;
                    },

                    reset: function() {
                        $container.find('input, select, textarea').each(function() {
                            const $field = $(this);
                            const type = $field.attr('type');
                            
                            if (type === 'checkbox' || type === 'radio') {
                                $field.prop('checked', false);
                            } else {
                                $field.val('');
                            }
                            
                            clearError($field);
                        });
                    },

                    destroy: function() {
                        $container.empty().removeData('INWformRender');
                        // Remover styles específicos se necessário
                        $container.removeAttr('data-inw-style');
                    }
                };

                // Funções auxiliares de validação
                function highlightError($field, message) {
                    $field.addClass('inw-invalid');
                    let $feedback = $field.closest('.inw-field').find('.inw-invalid-feedback');
                    
                    if (!$feedback.length) {
                        $feedback = $(`<div class="inw-invalid-feedback">${message}</div>`);
                        $field.closest('.inw-field').append($feedback);
                    } else {
                        $feedback.text(message);
                    }
                }

                function clearError($field) {
                    $field.removeClass('inw-invalid');
                    $field.closest('.inw-field').find('.inw-invalid-feedback').remove();
                }

                // Salvar instância
                $container.data('INWformRender', instance);
                // Notificar que o render está pronto
                try { $container.trigger('inw:render:ready'); } catch (e) { /* noop */ }

                //console.log('✅ INW Form Render inicializado com sucesso!');

            } catch (error) {
                console.error('💥 Erro fatal no INW Form Render:', error);
            }
        });
    };

    // Adicionar CSS com escopo
    function addScopedStyles(styleId) {
        if (!$('#inwforms-render-base-styles').length) {
            $('head').append(`
                <style id="inwforms-render-base-styles">
                    /* Estilos base que não conflitam */
                    .inw-form-render input[type="radio"], 
                    .inw-form-render input[type="checkbox"] { 
                        margin-top: 0.5rem !important; 
                        margin-right: 0.5rem !important;
                        vertical-align: middle;
                    }
                    
                    .inw-form-render { 
                        width: 100%; 
                        font-family: Arial, Helvetica, sans-serif;
                    }
                    
                    .inw-form-render .inw-field { 
                        margin-bottom: 1rem; 
                        position: relative; 
                    }
                    
                    .inw-form-render .inw-invalid-feedback { 
                        display: block; 
                        width: 100%; 
                        margin-top: 0.25rem; 
                        font-size: 0.875em; 
                        color: #dc3545; 
                    }
                    
                    .inw-form-render .inw-invalid { 
                        border-color: #dc3545; 
                    }
                    
                    .inw-form-render .required-asterisk { 
                        color: #dc3545; 
                        font-weight: bold; 
                        margin-left: 4px; 
                        display: inline-block; 
                    }
                    
                    /* Classes de texto */
                    #inw-formPDF .fw-bold {font-weight: 700 !important;}
                    #inw-formPDF .h5, #inw-formPDF h5 {font-size: 1.25rem;font-weight: 500;line-height: 1.2;}
                    #inw-formPDF .h4, #inw-formPDF h4 {font-size: 1.5rem;font-weight: 500;line-height: 1.2;}
                    #inw-formPDF .h3, #inw-formPDF h3 {font-size: 1.75rem;font-weight: 500;line-height: 1.2;}
                    #inw-formPDF .text-muted {color: #6c757d !important;}
                    #inw-formPDF .text-primary {color: #0d6efd !important;}
                    
                    /* Estilos adicionais para melhor alinhamento */
                    .inw-form-render .form-check {
                        display: flex;
                        align-items: center;
                    }
                    
                    .inw-form-render .form-check-input {
                        margin-top: 0 !important;
                        margin-right: 0.5rem;
                    }
                    
                    .inw-form-render .form-check-label {
                        margin-bottom: 0;
                    }
                </style>
            `);
        }
    }

    // Função estática para gerar PDF diretamente do JSON
    $.fn.INWformRender.generatePDFFromJSON = async function(jsonData, options) {
        const settings = $.extend({
            filename: 'formulario.pdf',
            returnType: 'blobUrl', // ou 'dataUrl'
            HTML: {
                head: '',
                footer: '',
                paginacao: {
                    active: false,
                    formato: 'Página % de %%',
                    posicao: 'right'
                }
            }
        }, options);

        try {
            // Carregar pdfmake se necessário
            await ensurePdfMakeLibs();
            if (!window.pdfMake) {
                throw new Error('pdfmake não disponível');
            }

            // Verificar dados
            if (!jsonData || !jsonData.components) {
                throw new Error('Dados do formulário inválidos');
            }

            // Construir conteúdo do PDF
            const content = buildPrintablePDFFromJSON(jsonData);
            
            // Parse do header e footer
            const headerData = settings.HTML.head ? 
                parseHtmlStyles(settings.HTML.head) : null;
            const footerData = settings.HTML.footer ? 
                parseHtmlStyles(settings.HTML.footer) : null;

            // Configuração do documento
            const docDefinition = {
                header: headerData ? {
                    text: headerData.text,
                    alignment: headerData.styles.alignment || 'center',
                    fontSize: headerData.styles.fontSize || 10,
                    bold: headerData.styles.bold !== undefined ? headerData.styles.bold : false,
                    color: headerData.styles.color,
                    background: headerData.styles.background,
                    margin: headerData.styles.margin || [0, 15, 0, 0]
                } : null,
                
                footer: (settings.HTML.footer || settings.HTML.paginacao.active) ? 
                    function(currentPage, pageCount) {
                        const footerParts = [];
                        
                        if (footerData) {
                            footerParts.push({
                                text: footerData.text,
                                alignment: footerData.styles.alignment || 'center',
                                fontSize: footerData.styles.fontSize || 8,
                                bold: footerData.styles.bold !== undefined ? footerData.styles.bold : false,
                                color: footerData.styles.color || '#666666',
                                margin: footerData.styles.margin || [40, 20, 40, 0]
                            });
                        }
                        
                        if (settings.HTML.paginacao.active) {
                            let textoPaginacao = settings.HTML.paginacao.formato
                                .replace('%', currentPage.toString())
                                .replace('%%', pageCount.toString());
                            
                            footerParts.push({
                                text: textoPaginacao,
                                fontSize: 8,
                                alignment: settings.HTML.paginacao.posicao || 'center',
                                margin: [40, 20, 40, 0]
                            });
                        }
                        
                        return footerParts.length > 0 ? { stack: footerParts } : null;
                    } : null,
                
                content: content,
                
                styles: {
                    label: {
                        fontSize: 12,
                        bold: false,
                        color: '#000',
                        margin: [0, 0, 0, 0]
                    },
                    question: {
                        fontSize: 12,
                        bold: true,
                        color: '#000',
                        margin: [0, 10, 0, 2]
                    },
                    answer: {
                        fontSize: 11,
                        color: '#000',
                        margin: [0, 0, 0, 10]
                    },
                    option: {
                        fontSize: 10,
                        color: '#000',
                        margin: [10, 1, 0, 1]
                    }
                },
                
                defaultStyle: {
                    fontSize: 12,
                    //lineHeight: 1.3
                },
                
                info: {
                    title: settings.filename.replace('.pdf', ''),
                    author: 'Sistema de Formulários',
                    subject: 'Formulário Preenchido',
                    keywords: 'formulário, pdf, questionário',
                    creator: 'Inovativa Web'
                },

                pageSize: 'A4',
                pageOrientation: 'portrait',
                pageMargins: [40, 80, 40, 80]
            };

            // Retornar de acordo com o tipo solicitado
            return new Promise((resolve, reject) => {
                try {
                    if (settings.returnType === 'dataUrl') {
                        pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
                            resolve(dataUrl);
                        });
                    } else {
                        pdfMake.createPdf(docDefinition).getBlob((blob) => {
                            const url = URL.createObjectURL(blob);
                            resolve(url);
                        });
                    }
                } catch (error) {
                    reject(error);
                }
            });

        } catch (error) {
            console.error('💥 Erro ao gerar PDF:', error);
            throw error;
        }
    };

    // Alias para compatibilidade
    $.fn.INWformRender.generatePDF = $.fn.INWformRender.generatePDFFromJSON;

})(jQuery);

})();