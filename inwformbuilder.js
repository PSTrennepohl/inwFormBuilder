// plugins/inwforms.js
(function(){ 
    delete window.INWformBuilder;
    window.INWformBuilder = window.INWformBuilder || 

(function($) {
    'use strict';

    // Função para gerar IDs únicos
    function generateUniqueId() {
        return 'comp_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    // Função para gerar names únicos
    function generateUniqueName(componentType) {
        return componentType + '_' + Math.random().toString(36).substr(2, 9);
    }

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

    // INFORMAR NA TELA O TAMANHO DELA sm, md, lg, xl, xxl...
    function updateBootstrapInfo() {
        const width = $(window).width();
        let breakpoint = '';
        
        // Determinar breakpoint
        if (width < 576) {
            breakpoint = 'XS';
        } else if (width < 768) {
            breakpoint = 'SM';
        } else if (width < 992) {
            breakpoint = 'MD';
        } else if (width < 1200) {
            breakpoint = 'LG - PDF';
        } else if (width < 1400) {
            breakpoint = 'XL';
        } else {
            breakpoint = 'XXL';
        }
        
        // Atualizar displays
        $('#INWBuilder_currentBreakpoint').text(breakpoint);
        //$('#screenWidth').text(width + 'px');
        
        // Sugerir classe de coluna
        let colClass = '';
        switch(breakpoint) {
            case 'XS': colClass = 'col-[]'; break;
            case 'SM': colClass = 'col-sm-[]'; break;
            case 'MD': colClass = 'col-md-[]'; break;
            case 'LG - PDF': colClass = 'col-lg-[]'; break;
            case 'XL': colClass = 'col-xl-[]'; break;
            case 'XXL': colClass = 'col-xxl-[]'; break;
        }
        $('#currentCols').text(colClass);
        
        // Mudar cor do badge
        const colors = {
            'XS': 'danger', 'SM': 'warning', 'MD': 'info',
            'LG - PDF': 'primary', 'XL': 'success', 'XXL': 'dark'
        };
        $('#INWBuilder_currentBreakpoint').removeClass('bg-danger bg-warning bg-info bg-primary bg-success bg-dark')
                               .addClass('bg-' + colors[breakpoint]);
    }

    // Loader de componentes: mantém row/cols internamente e carrega palette via config.js
    async function loadPaletteComponents($container) {
        const components = {};

        // Bases fixas (row e cols)
        components['row'] = {
            type: 'row',
            label: 'Linha (Row)',
            icon: '📐',
            html: '<div class="row form-row" style="min-height: 100px; border: 2px dashed #007bff; padding: 30px 10px 10px 10px; margin-bottom: 15px; background: #f8f9fa;"></div>',
            isContainer: true,
            allowedIn: ['canvas']
        };
        
        // Coluna base com todas as classes Bootstrap
        components['col'] = {
            type: 'col',
            label: 'Coluna',
            icon: '📱',
            html: '<div class="col col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 form-column" style="min-height: 80px; border: 2px dashed #28a745; padding: 30px 8px 8px 8px; background: #f8f9fa;"></div>',
            isContainer: true,
            allowedIn: ['row'],
            editComponent: function($component, updateJSONOutput, addDebugMessage) {
                // Obter classes atuais
                const currentClasses = $component.attr('class') || '';
                const currentSizes = {
                    'col-': '12',
                    'col-sm-': '12', 
                    'col-md-': '12',
                    'col-lg-': '12',
                    'col-xl-': '12',
                    'col-xxl-': '12'
                };
                
                // Extrair tamanhos atuais das classes
                Object.keys(currentSizes).forEach(prefix => {
                    const regex = new RegExp(prefix + '(\\d+)');
                    const match = currentClasses.match(regex);
                    if (match) {
                        currentSizes[prefix] = match[1];
                    }
                });
                
                // Função auxiliar para gerar radio buttons de tamanho
                function generateRadioOptions(name, currentValue) {
                    let radios = '';
                    for (let i = 1; i <= 12; i++) {
                        const checked = i == currentValue ? 'checked' : '';
                        radios += `<div class="col-1"><input type="radio" name="${name}" value="${i}" id="${name}_${i}" ${checked}><label for="${name}_${i}">${i}</label></div>`;
                    }
                    return radios;
                }
                
                // Criar HTML do formulário
                const formHTML = `
                    <form id="col-edit-form">
                        <div class="mb-3">
                            <p class="text-muted small">Configure os tamanhos da coluna para diferentes Telas!<br>A impressão respeita apenas as colunas PDF.</p>
                        </div>
                        
                        <!-- Extra pequeno -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <strong>col-[]</strong>
                                <small class="text-muted ms-2">Extra pequeno (Inferior a 576px)</small>
                            </div>
                            <div class="d-flex flex-wrap">
                                ${generateRadioOptions('col-xs', currentSizes['col-'])}
                            </div>
                        </div>
                        
                        <!-- Pequeno -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <strong>col-sm-[]</strong>
                                <small class="text-muted ms-2">Pequeno (≥ 576px)</small>
                            </div>
                            <div class="d-flex flex-wrap">
                                ${generateRadioOptions('col-sm', currentSizes['col-sm-'])}
                            </div>
                        </div>
                        
                        <!-- Médio -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <strong>col-md-[]</strong>
                                <small class="text-muted ms-2">Médio (≥ 768px)</small>
                            </div>
                            <div class="d-flex flex-wrap">
                                ${generateRadioOptions('col-md', currentSizes['col-md-'])}
                            </div>
                        </div>
                        
                        <!-- Grande -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <strong>col-lg-[] <span style="color:green;">PDF</span></strong>
                                <small class="text-muted ms-2"> Grande (≥ 992px)</small>
                            </div>
                            <div class="d-flex flex-wrap">
                                ${generateRadioOptions('col-lg', currentSizes['col-lg-'])}
                            </div>
                        </div>
                        
                        <!-- Extra grande -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <strong>col-xl-[]</strong>
                                <small class="text-muted ms-2">Extra grande (≥ 1200px)</small>
                            </div>
                            <div class="d-flex flex-wrap">
                                ${generateRadioOptions('col-xl', currentSizes['col-xl-'])}
                            </div>
                        </div>
                        
                        <!-- Extra extra grande -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center mb-2">
                                <strong>col-xxl-[]</strong>
                                <small class="text-muted ms-2">Extra extra grande (≥ 1400px)</small>
                            </div>
                            <div class="d-flex flex-wrap">
                                ${generateRadioOptions('col-xxl', currentSizes['col-xxl-'])}
                            </div>
                        </div>
                    </form>
                `;
                
                // Mostrar modal SweetAlert2
                Swal.fire({
                    title: 'Editar Coluna - Tamanhos Responsivos',
                    html: formHTML,
                    icon: null,
                    showCancelButton: true,
                    confirmButtonText: 'Salvar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#0d6efd',
                    cancelButtonColor: '#6c757d',
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    width: '700px',
                    target: $container[0],
                    didOpen: () => {
                        // Eventos já estão configurados no HTML
                    },
                    preConfirm: () => {
                        // Coletar novos valores dos radio buttons
                        const newSizes = {
                            'col-': $(`input[name="col-xs"]:checked`).val(),
                            'col-sm-': $(`input[name="col-sm"]:checked`).val(),
                            'col-md-': $(`input[name="col-md"]:checked`).val(),
                            'col-lg-': $(`input[name="col-lg"]:checked`).val(),
                            'col-xl-': $(`input[name="col-xl"]:checked`).val(),
                            'col-xxl-': $(`input[name="col-xxl"]:checked`).val()
                        };
                        
                        // Construir nova classe
                        let newClass = 'col form-column';
                        Object.keys(newSizes).forEach(prefix => {
                            newClass += ` ${prefix}${newSizes[prefix]}`;
                        });
                        
                        // Atualizar componente
                        $component.attr('class', newClass);
                        
                        // Atualizar JSON
                        updateJSONOutput();
                        
                        // Log
                        addDebugMessage(`✏️ Coluna atualizada: ${newClass}`);
                        
                        return true;
                    }
                });
            }
        };

        // Tentar carregar config.js (modo híbrido offline/online)
        /*await new Promise((resolve) => {
            if (window.INW_FORMBUILDER_CONFIG) return resolve();
            $.getScript('./config.js')
                .done(resolve)
                .fail(() => {
                    console.warn('⚠️ config.js não encontrado, carregando apenas base.');
                    resolve();
                });
        });*/
        // Detectar a pasta onde o inwformrender.js está
        const basePath = getInwFormBuilderBasePath();

        if (!basePath) {
            console.warn("⚠️ basePath não encontrado, abortando carregamento do config.js.");
            return;
        }

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

        const paletteList = (window.INW_FORMBUILDER_CONFIG && window.INW_FORMBUILDER_CONFIG.palette) || [];

        // Carregar scripts de palette via $.getScript (funciona local sem servidor)
        for (const file of paletteList) {
            // Caminho absoluto baseado na pasta do inwformrender.js
            const fullPath = `${basePath}/${file}`;
            await new Promise((resolve) => {
                $.getScript(fullPath)
                    .done(() => {
                        resolve();
                    })
                    .fail(() => {
                        console.warn('⚠️ Falha ao carregar componente:', file);
                        resolve();
                    });
            });
        }

        // Mesclar componentes carregados globalmente (window.INW_COMPONENTS)
        if (window.INW_COMPONENTS) {
            Object.assign(components, window.INW_COMPONENTS);
        }

        return components;
    }

    // Função global para atualizar asterisco required (após o label)
    window.updateRequiredIndicator = function($component, isRequired) {
        const $label = $component.find('label').first();
        
        if ($label.length) {
            // Remover asterisco existente (qualquer um após o label)
            $label.next('.required-asterisk').remove();
            
            // Adicionar asterisco após o label se for required
            if (isRequired) {
                const $asterisk = $('<span class="required-asterisk">*</span>');
                $label.after($asterisk);
            }
        }
    };

    // Função para aplicar atributos ao componente
    function applyAttributesToComponent($component, attributes) {
        const $input = $component.find('input, textarea, select').first();
        if ($input.length && attributes) {
            Object.keys(attributes).forEach(attr => {
                if (attributes[attr]) {
                    $input.attr(attr, attributes[attr]);
                } else {
                    $input.removeAttr(attr);
                }
            });
        }
    }

    // Função para aplicar opções ao componente
    function applyOptionsToComponent($component, componentType, options, name, isRequired, isInline) {
        if (!options || options.length === 0) return;

        if (componentType === 'select') {
            const $select = $component.find('select');
            $select.empty();
            options.forEach(option => {
                $select.append(`<option value="${option.value}">${option.label}</option>`);
            });
        } else if (componentType === 'radio' || componentType === 'checkbox') {
            const $container = $component.find('.form-check').parent();
            $container.empty();

            if (isInline) {
                $container.addClass('d-flex flex-wrap gap-3');
            } else {
                $container.removeClass('d-flex flex-wrap gap-3');
            }

            options.forEach((option, index) => {
                const inputType = componentType === 'radio' ? 'radio' : 'checkbox';
                const optionId = `${componentType}-${name}-${index}`;
                let optionHTML = false;
                //ADICIONA O INPUT 'OUTRO'
                if(option.other){
                    optionHTML = `

                        <div class="form-check inw-radio-other ${isInline ? 'mb-0' : ''}">
                            <input class="form-check-input" type="${inputType}" name="${name}" value="${option.value}" id="${optionId}" ${isRequired ? 'required' : ''}>
                            <label class="form-check-label" for="${optionId}">
                                ${option.label}
                            </label>
                            <input type="text" class="form-control form-control-sm d-none d-inline" style="width:200px; min-height: 25px !important; max-height: 10px;" data-for="${optionId}" placeholder="Descreva...">
                        </div>
                    `;
                }else{
                    optionHTML = `
                        <div class="form-check ${isInline ? 'mb-0' : ''}">
                            <input class="form-check-input" type="${inputType}" name="${name}" value="${option.value}" id="${optionId}" ${isRequired ? 'required' : ''}>
                            <label class="form-check-label" for="${optionId}">
                                ${option.label}
                            </label>
                        </div>
                    `;
                }
                $container.append(optionHTML);
            });
        }
        
        // Atualizar asterisco required
        if (window.updateRequiredIndicator) {
            window.updateRequiredIndicator($component, isRequired);
        }
    }

    // Plugin principal
    $.fn.INWformBuilder = function(options) {
        const settings = $.extend({
            dataType: 'json',
            formData: null,
            debug: false,
            debugJson: true,
            canvasHeight: null,
            canvasWidth: null,
            menuPosition: 'top',
            showWindowColSize: false
        }, options);

        return this.each(async function() { 
            const $container = $(this);
            
            // DESTRUIR instância anterior se existir - LIMPEZA COMPLETA E AGRESSIVA
            const existingInstance = $container.data('INWformBuilder');
            if (existingInstance && typeof existingInstance.destroy === 'function') {
                existingInstance.destroy();
            }
            
            // LIMPEZA AGRESSIVA: Remover TODOS os eventos relacionados ao plugin
            // IMPORTANTE: Usar .off() sem handler para remover TODOS os handlers do evento/seletor
            
            // Remover eventos dos componentes da paleta
            $('.component-item').off('dragstart').off('dragend');
            $('#clear-canvas-palette').off('click');
            
            // Remover eventos do canvas
            $('#main-canvas').off('dragover').off('dragleave').off('drop');
            
            // Remover TODOS os eventos delegados relacionados ao plugin
            // Usar .off() sem handler para garantir remoção completa de todas as instâncias
            /*$(document).off('dragstart', '.form-row, .form-column, .draggable-component');
            $(document).off('dragend', '.form-row, .form-column, .draggable-component');
            $(document).off('dragover', '.form-row, .form-column');
            $(document).off('dragleave', '.form-row, .form-column');
            $(document).off('drop', '.form-row, .form-column');
            $(document).off('dblclick', '.form-group, .form-column');
            $(document).off('click', '.remove-btn');
            $(document).off('click', '.move-row-up');
            $(document).off('click', '.move-row-down');
            $(document).off('click', '.move-col-left');
            $(document).off('click', '.move-col-right');
            $(document).off('click', '.move-comp-up');
            $(document).off('click', '.move-comp-down');*/
            $container.off('.INWFB');
            
            // Limpar completamente o container e remover dados
            $container.empty().removeClass('inw-form-builder');
            $container.removeData('INWformBuilder');
            
            // Remover elementos órfãos que possam ter ficado (paleta, canvas, etc)
            $('#component-palette').remove();
            $('#main-canvas').remove();
            $('#json-output').parent().remove();
            $('#debug-output').parent().remove();
            
            // Agora inicializar nova instância
            const components = await loadPaletteComponents($container);
            let formData = null;
            let debugMessages = [];
            let draggedElement = null;
            let currentDragSource = null;
            let currentDragType = null;
            
            // Flag para prevenir execuções múltiplas durante drag/drop
            let isProcessingDrop = false;

            // Função auxiliar para mostrar modal de edição (compatível com componentes da paleta)
            window.INW_SHOW_EDIT_MODAL = function(title, htmlContent, onSave, onCancel, didOpen) {
                Swal.fire({
                    title: title,
                    html: htmlContent,
                    icon: null,
                    showCancelButton: true,
                    confirmButtonText: 'Salvar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#0d6efd',
                    cancelButtonColor: '#6c757d',
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    width: '600px',
                    target: $container[0],
                    didOpen: () => {
                        // Permitir que componentes configurem eventos após o modal abrir
                        if (didOpen && typeof didOpen === 'function') {
                            didOpen();
                        }
                    },
                    preConfirm: () => {
                        if (onSave) {
                            const result = onSave();
                            // Se onSave retornar false, manter o modal aberto
                            if (result === false) {
                                return false;
                            }
                        }
                        return true;
                    }
                }).then((result) => {
                    if (!result.isConfirmed && onCancel) {
                        if (onCancel && typeof onCancel === 'function') {
                            onCancel();
                        }
                    }
                });
            };

            // Função para mostrar modal de confirmação (usando SweetAlert2)
            function showConfirmModal(message, confirmCallback, cancelCallback) {
                Swal.fire({
                    title: 'Confirmação',
                    text: message,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#0d6efd',
                    cancelButtonColor: '#6c757d',
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    target: $container[0],
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (confirmCallback) confirmCallback();
                    } else {
                        if (cancelCallback) cancelCallback();
                    }
                });
            }

            // Função para mostrar modal de alerta (usando SweetAlert2)
            function showAlertModal(message, callback) {
                Swal.fire({
                    title: 'Aviso',
                    text: message,
                    icon: 'info',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#0d6efd',
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    target: $container[0],
                }).then(() => {
                    if (callback) callback();
                });
            }


            // Funções de debug
            function addDebugMessage(message) {
                if (!settings.debug) return;
                
                const timestamp = new Date().toLocaleString('pt-BR');
                const debugMessage = `[${timestamp}] ${message}`;
                debugMessages.unshift(debugMessage);
                
                if (debugMessages.length > 50) {
                    debugMessages = debugMessages.slice(0, 50);
                }
                
                updateDebugOutput();
            }

            function updateDebugOutput() {
                if (!settings.debug) return;
                $('#debug-output').val(debugMessages.join('\n'));
            }

            // Inicializar dados do formulário
            if (settings.formData) {
                if (settings.dataType === 'json') {
                    formData = typeof settings.formData === 'string' ? 
                        JSON.parse(settings.formData) : settings.formData;
                }
            }

            // Criar estrutura principal
            createStructure($container);

            // Carregar dados se existirem
            if (formData) {
                loadFormData(formData);
            }

            // Inicializar eventos
            initEvents($container);

            function createStructure($container) {
                $container.addClass('inw-form-builder');
                
                if (settings.canvasWidth) {
                    $container.css('width', settings.canvasWidth);
                }
                
                const menuPosition = settings.menuPosition || 'top';
                const isVertical = menuPosition === 'left' || menuPosition === 'right';
                
                const paletteHTML = createPaletteHTML(isVertical);
                const canvasHTML = createCanvasHTML();

                let finalHTML = '';
                switch(menuPosition) {
                    case 'bottom':
                        finalHTML = canvasHTML + paletteHTML;
                        break;
                    case 'left':
                        finalHTML = `
                            <div class="form-builder-horizontal">
                                <div class="palette-container palette-left">
                                    ${paletteHTML}
                                </div>
                                <div class="canvas-container">
                                    ${canvasHTML}
                                </div>
                            </div>
                        `;
                        break;
                    case 'right':
                        finalHTML = `
                            <div class="form-builder-horizontal">
                                <div class="canvas-container">
                                    ${canvasHTML}
                                </div>
                                <div class="palette-container palette-right">
                                    ${paletteHTML}
                                </div>
                            </div>
                        `;
                        break;
                    case 'top':
                    default:
                        finalHTML = paletteHTML + canvasHTML;
                        break;
                }

                $container.html(finalHTML);
                updateJSONOutput();
                
                addDebugMessage(`🎨 Canvas configurado - Posição do menu: ${menuPosition}, Altura: ${settings.canvasHeight || 'auto'}, Largura: ${settings.canvasWidth || 'auto'}`);
            }

            function createPaletteHTML(isVertical) {
                const buttonLayout = isVertical ? 
                    'flex-column align-items-start' : 
                    'flex-wrap gap-1 mb-1';
                
                const paletteClass = isVertical ? 
                    'components-palette-vertical p-3 bg-light border rounded h-100' :
                    'components-palette p-3 bg-light border rounded';

                const structureComponents = [
                    { type: 'row', icon: '📐', label: 'Linha', btnClass: 'btn-outline-primary' },
                    { type: 'col', icon: '📱', label: 'Coluna', btnClass: 'btn-outline-primary' }
                ];

                let formComponentsHTML = '';
                
                if (window.INW_PALETTE) {
                    Object.keys(window.INW_PALETTE).forEach(componentType => {
                        const paletteItem = window.INW_PALETTE[componentType];
                        if (paletteItem && paletteItem.includeInPalette !== false) {
                            formComponentsHTML += `
                                <div class="component-item btn btn-sm ${paletteItem.btnClass || 'btn-outline-success'}" 
                                     data-type="${componentType}" draggable="true">
                                    <span class="component-icon">${paletteItem.icon || '📦'}</span>
                                    <span class="component-label">${paletteItem.label || componentType}</span>
                                </div>
                            `;
                        }
                    });
                }

                if (!formComponentsHTML && window.INW_COMPONENTS) {
                    Object.keys(window.INW_COMPONENTS).forEach(componentType => {
                        const component = window.INW_COMPONENTS[componentType];
                        if (component && !component.isContainer) {
                            formComponentsHTML += `
                                <div class="component-item btn btn-sm btn-outline-success" 
                                     data-type="${componentType}" draggable="true">
                                    <span class="component-icon">${component.icon || '📦'}</span>
                                    <span class="component-label">${component.label || componentType}</span>
                                </div>
                            `;
                        }
                    });
                }
                
                return `
                    <div class="${paletteClass}">
                        <div class="palette-section">
                            <div class="d-flex ${buttonLayout}">
                                ${structureComponents.map(item => `
                                    <div class="component-item btn btn-sm ${item.btnClass}" data-type="${item.type}" draggable="true">
                                        <span class="component-icon">${item.icon}</span>
                                        <span class="component-label">${item.label}</span>
                                    </div>
                                `).join('')}
                                
                                ${!isVertical ? '<div class="vr mx-1"></div>' : ''}
                                
                                ${formComponentsHTML}
                                
                                <div class="component-item btn btn-sm btn-warning" id="clear-canvas-palette" style="cursor: pointer;">
                                    <span class="component-icon">🧹</span>
                                    <span class="component-label">Limpar</span>
                                </div>
                            </div>
                        </div>

                        ${settings.showWindowColSize ? `<div class="mt-1 text-muted small">
                            Tela Atual <span class="badge bg-primary" id="INWBuilder_currentBreakpoint">XS</span>
                        </div>`:''}

                        <!--<div class="mt-1 text-muted small">
                            <small>💡 Arraste componentes para construir o formulário</small>
                        </div>-->
                    </div>
                `;
            }

            function createCanvasHTML() {
                let canvasStyle = 'min-height: 400px; border: 2px dashed #6c757d; padding: 20px; background: #f8f9fa;';
                
                if (settings.canvasHeight) {
                    canvasStyle = `height: ${settings.canvasHeight}px; overflow-y: auto; border: 2px dashed #6c757d; padding: 20px; background: #f8f9fa;`;
                }

                return `
                    <div class="form-canvas">
                        <div class="form-container">
                            <div class="main-canvas" id="main-canvas" style="${canvasStyle}">
                                <div class="empty-canvas-message text-center text-muted py-5">
                                    <h6>Arraste componentes da paleta para começar</h6>
                                    <small>Comece arrastando uma "Linha" para o canvas</small>
                                </div>
                            </div>
                        </div>
                        ${settings.debugJson ? `
                        <div class="json-output mt-4">
                            <h6>Saída JSON:</h6>
                            <pre id="json-output" class="bg-dark text-light p-3 rounded" style="font-size: 12px; min-height: 200px;"></pre>
                        </div>
                        ` : ''}
                        ${settings.debug ? `
                        <div class="debug-output mt-4">
                            <h6>Debug Messages:</h6>
                            <textarea id="debug-output" class="form-control form-control-sm" rows="6" style="font-size: 12px; font-family: monospace;" readonly placeholder="Mensagens de debug aparecerão aqui..."></textarea>
                        </div>
                        ` : ''}
                    </div>
                `;
            }

            function initEvents($container) {
                //console.log($container);
                // Eventos SEM namespace (como estava originalmente)
                $('.component-item').on('dragstart', function(e) {
                    if ($(this).attr('id') === 'clear-canvas-palette') {
                        e.preventDefault();
                        return false;
                    }
                    
                    const componentType = $(this).data('type');
                    e.originalEvent.dataTransfer.setData('text/plain', componentType);
                    e.originalEvent.dataTransfer.setData('source', 'palette');
                    $(this).addClass('dragging');
                    
                    currentDragSource = 'palette';
                    currentDragType = componentType;
                    
                    addDebugMessage(`🟢 Iniciando drag: ${componentType} da paleta`);
                });

                $('.component-item').on('dragend', function() {
                    $(this).removeClass('dragging');
                    $('.drop-zone-active, .drop-zone-highlight').removeClass('drop-zone-active drop-zone-highlight');
                    currentDragSource = null;
                    currentDragType = null;
                    addDebugMessage('🔴 Drag finalizado');
                });

                $('#clear-canvas-palette').on('click', function() {
                    showConfirmModal(
                        'Tem certeza que deseja limpar todo o formulário? Todos os componentes serão removidos.',
                        function() {
                            $('#main-canvas').empty();
                            showEmptyCanvasMessage();
                            updateJSONOutput();
                            addDebugMessage('🗑️ Canvas limpo');
                        }
                    );
                });

                $container.on('dragstart.INWFB', '.form-row, .form-column, .draggable-component', function(e) {
                    draggedElement = $(this);
                    e.originalEvent.dataTransfer.setData('text/plain', 'move');
                    e.originalEvent.dataTransfer.setData('source', 'canvas');
                    $(this).addClass('dragging');
                    e.originalEvent.dataTransfer.effectAllowed = 'move';
                    
                    currentDragSource = 'canvas';
                    currentDragType = getComponentType($(this));
                    
                    addDebugMessage(`🟢 Iniciando drag: ${currentDragType} do canvas`);
                });

                $container.on('dragend.INWFB', '.form-row, .form-column, .draggable-component', function() {
                    $(this).removeClass('dragging');
                    $('.drop-zone-active, .drop-zone-highlight').removeClass('drop-zone-active drop-zone-highlight');
                    draggedElement = null;
                    currentDragSource = null;
                    currentDragType = null;
                    addDebugMessage('🔴 Drag finalizado');
                });

                $('#main-canvas').on('dragover', function(e) {
                    e.preventDefault();
                    
                    if (currentDragSource === 'palette' && currentDragType === 'row') {
                        e.originalEvent.dataTransfer.dropEffect = 'copy';
                        $(this).addClass('drop-zone-highlight');
                    } else {
                        $(this).removeClass('drop-zone-highlight');
                    }
                });

                $('#main-canvas').on('dragleave', function() {
                    $(this).removeClass('drop-zone-highlight');
                });

                $('#main-canvas').on('drop', function(e) {
                    e.preventDefault();
                    
                    // Prevenir múltiplas execuções
                    if (isProcessingDrop) {
                        return;
                    }
                    
                    const $this = $(this);
                    $this.removeClass('drop-zone-highlight');

                    const source = e.originalEvent.dataTransfer.getData('source');
                    const componentType = e.originalEvent.dataTransfer.getData('text/plain');
                    
                    if (source === 'palette') {
                        addComponentToCanvas(componentType, $this);
                    }
                });

                $container.on('dragover.INWFB', '.form-row', function(e) {
                    e.preventDefault();
                    
                    if (currentDragSource === 'palette') {
                        const component = components[currentDragType];
                        
                        if (component && component.allowedIn.includes('row')) {
                            e.originalEvent.dataTransfer.dropEffect = 'copy';
                            $(this).addClass('drop-zone-highlight');
                            addDebugMessage(`🟡 Row destacada para: ${currentDragType}`);
                        } else {
                            e.originalEvent.dataTransfer.dropEffect = 'none';
                            $(this).removeClass('drop-zone-highlight');
                        }
                    } else {
                        $(this).removeClass('drop-zone-highlight');
                    }
                });

                $container.on('dragleave.INWFB', '.form-row', function() {
                    $(this).removeClass('drop-zone-highlight');
                });

                $container.on('drop.INWFB', '.form-row', function(e) {
                    e.preventDefault();
                    
                    // Prevenir múltiplas execuções
                    if (isProcessingDrop) {
                        return;
                    }
                    
                    const $this = $(this);
                    $this.removeClass('drop-zone-highlight');

                    const source = e.originalEvent.dataTransfer.getData('source');
                    const componentType = e.originalEvent.dataTransfer.getData('text/plain');
                    
                    if (source === 'palette') {
                        addComponentToCanvas(componentType, $this);
                    }
                });

                $container.on('dragover.INWFB', '.form-column', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (currentDragSource === 'palette') {
                        const component = components[currentDragType];
                        const containerType = getContainerType($(this));
                        
                        if (component && component.allowedIn.includes(containerType)) {
                            e.originalEvent.dataTransfer.dropEffect = 'copy';
                            $(this).addClass('drop-zone-highlight');
                            addDebugMessage(`🟡 Coluna destacada para: ${currentDragType} em ${containerType}`);
                        } else {
                            e.originalEvent.dataTransfer.dropEffect = 'none';
                            $(this).removeClass('drop-zone-highlight');
                        }
                    } else if (currentDragSource === 'canvas' && draggedElement) {
                        const isValid = isValidMove(draggedElement, $(this));
                        if (isValid) {
                            e.originalEvent.dataTransfer.dropEffect = 'move';
                            $(this).addClass('drop-zone-highlight');
                        } else {
                            e.originalEvent.dataTransfer.dropEffect = 'none';
                            $(this).removeClass('drop-zone-highlight');
                        }
                    } else {
                        $(this).removeClass('drop-zone-highlight');
                    }
                });

                $container.on('dragleave.INWFB', '.form-column', function() {
                    $(this).removeClass('drop-zone-highlight');
                });

                $container.on('drop.INWFB', '.form-column', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Prevenir múltiplas execuções
                    if (isProcessingDrop) {
                        return;
                    }
                    
                    const $this = $(this);
                    $this.removeClass('drop-zone-highlight');

                    const source = e.originalEvent.dataTransfer.getData('source');
                    const componentType = e.originalEvent.dataTransfer.getData('text/plain');
                    
                    addDebugMessage(`🎯 Drop na coluna: source=${source}, type=${componentType}`);
                    
                    if (source === 'canvas' && draggedElement) {
                        handleElementMove(draggedElement, $this);
                    } else if (source === 'palette') {
                        addComponentToCanvas(componentType, $this);
                    }
                });

                $container.on('dblclick.INWFB', '.form-group, .form-column', function(e) {
                    e.stopPropagation();
                    const $component = $(this);
                    const componentType = getComponentType($component);
                    
                    if (components[componentType] && components[componentType].editComponent) {
                        components[componentType].editComponent($component, updateJSONOutput, addDebugMessage);
                    } else {
                        editComponentBasic($component, $container);
                    }
                });

                $container.on('click.INWFB', '.remove-btn', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const $element = $(this).closest('.form-row, .form-column, .draggable-component');
                    const elementName = getComponentName($element);
                    
                    showConfirmModal(
                        `Deseja remover o componente "${elementName}"?`,
                        function() {
                            $element.remove();
                            checkEmptyCanvas();
                            updateJSONOutput();
                            updateRowButtons();
                            updateColumnButtons();
                            updateComponentButtons();
                            addDebugMessage(`❌ ${elementName} removido`);
                        }
                    );
                });

                $container.on('click.INWFB', '.move-row-up', function(e) {
                    e.stopPropagation();
                    const $row = $(this).closest('.form-row');
                    moveRowUp($row);
                });

                $container.on('click.INWFB', '.move-row-down', function(e) {
                    e.stopPropagation();
                    const $row = $(this).closest('.form-row');
                    moveRowDown($row);
                });

                $container.on('click.INWFB', '.move-col-left', function(e) {
                    e.stopPropagation();
                    const $col = $(this).closest('.form-column');
                    const direction = e.shiftKey ? 'between-rows-left' : 'within-row-left';
                    moveColumn($col, direction);
                });

                $container.on('click.INWFB', '.move-col-right', function(e) {
                    e.stopPropagation();
                    const $col = $(this).closest('.form-column');
                    const direction = e.shiftKey ? 'between-rows-right' : 'within-row-right';
                    moveColumn($col, direction);
                });

                $container.on('click.INWFB', '.move-comp-up', function(e) {
                    e.stopPropagation();
                    const $component = $(this).closest('.draggable-component');
                    const direction = e.shiftKey ? 'between-columns-up' : 'within-column-up';
                    moveComponent($component, direction);
                });

                $container.on('click.INWFB', '.move-comp-down', function(e) {
                    e.stopPropagation();
                    const $component = $(this).closest('.draggable-component');
                    const direction = e.shiftKey ? 'between-columns-down' : 'within-column-down';
                    moveComponent($component, direction);
                });
            }

            function editComponentBasic($component,$container) {
                const currentLabel = $component.find('label').first().text();
                Swal.fire({
                    title: 'Editar Label',
                    input: 'text',
                    inputLabel: 'Novo texto do label:',
                    inputValue: currentLabel,
                    showCancelButton: true,
                    confirmButtonText: 'Salvar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#0d6efd',
                    cancelButtonColor: '#6c757d',
                    target: $container[0],
                    inputValidator: (value) => {
                        if (!value || !value.trim()) {
                            return 'O label não pode estar vazio!';
                        }
                    }
                }).then((result) => {
                    if (result.isConfirmed && result.value && result.value.trim() !== '') {
                        const newLabel = result.value.trim();
                        $component.find('label').first().text(newLabel);
                        updateJSONOutput();
                        addDebugMessage(`✏️ Label do componente alterado: "${currentLabel}" → "${newLabel}"`);
                    }
                });
            }

            function moveComponent($component, direction) {
                const $currentColumn = $component.closest('.form-column');
                const $allColumns = $currentColumn.closest('.form-row').find('.form-column');
                const currentColIndex = $allColumns.index($currentColumn);
                
                addDebugMessage(`Movendo componente: ${direction} | Coluna atual: ${currentColIndex}`);

                if (direction === 'within-column-up') {
                    const $prevComp = $component.prev('.draggable-component');
                    if ($prevComp.length) {
                        $component.insertBefore($prevComp);
                        updateJSONOutput();
                        updateComponentButtons();
                        addDebugMessage('⬆️ Componente movido para cima na mesma coluna');
                    }
                } 
                else if (direction === 'within-column-down') {
                    const $nextComp = $component.next('.draggable-component');
                    if ($nextComp.length) {
                        $component.insertAfter($nextComp);
                        updateJSONOutput();
                        updateComponentButtons();
                        addDebugMessage('⬇️ Componente movido para baixo na mesma coluna');
                    }
                }
                else if (direction === 'between-columns-up') {
                    const $targetColumn = $allColumns.eq(currentColIndex - 1);
                    if (!$targetColumn.length) {
                        addDebugMessage('❌ Não há coluna à esquerda para mover o componente');
                        return;
                    }
                    
                    $component.detach();
                    // Inserir no topo da lista de componentes, mas após os botões da coluna
                    const $firstComp = $targetColumn.children('.draggable-component').first();
                    if ($firstComp.length) {
                        $component.insertBefore($firstComp);
                    } else {
                        $targetColumn.append($component);
                    }
                    updateJSONOutput();
                    updateComponentButtons();
                    addDebugMessage('🔄 Componente movido para coluna da esquerda');
                }
                else if (direction === 'between-columns-down') {
                    const $targetColumn = $allColumns.eq(currentColIndex + 1);
                    if (!$targetColumn.length) {
                        addDebugMessage('❌ Não há coluna à direita para mover o componente');
                        return;
                    }
                    
                    $component.detach();
                    // Inserir no topo da lista de componentes, mas após os botões da coluna
                    const $firstCompRight = $targetColumn.children('.draggable-component').first();
                    if ($firstCompRight.length) {
                        $component.insertBefore($firstCompRight);
                    } else {
                        $targetColumn.append($component);
                    }
                    updateJSONOutput();
                    updateComponentButtons();
                    addDebugMessage('🔄 Componente movido para coluna à direita');
                }
            }

            function updateComponentButtons() {
                $('.draggable-component').each(function() {
                    const $comp = $(this);
                    const $upBtn = $comp.find('.move-comp-up');
                    const $downBtn = $comp.find('.move-comp-down');

                    $upBtn.prop('disabled', false).removeClass('disabled');
                    $downBtn.prop('disabled', false).removeClass('disabled');

                    $upBtn.attr('title', 'Mover para cima (Clique: mesma coluna | Shift+Clique: coluna à esquerda)');
                    $downBtn.attr('title', 'Mover para baixo (Clique: mesma coluna | Shift+Clique: coluna à direita)');
                });
            }

            function moveColumn($col, direction) {
                const $currentRow = $col.closest('.form-row');
                const currentRowIndex = $('.form-row').index($currentRow);
                
                addDebugMessage(`Movendo coluna: ${direction} | Linha atual: ${currentRowIndex}`);

                if (direction === 'within-row-left') {
                    const $prevCol = $col.prev('.form-column');
                    if ($prevCol.length) {
                        $col.insertBefore($prevCol);
                        updateJSONOutput();
                        updateColumnButtons();
                        updateComponentButtons();
                        addDebugMessage('⬅️ Coluna movida para esquerda na mesma linha');
                    }
                } 
                else if (direction === 'within-row-right') {
                    const $nextCol = $col.next('.form-column');
                    if ($nextCol.length) {
                        $col.insertAfter($nextCol);
                        updateJSONOutput();
                        updateColumnButtons();
                        updateComponentButtons();
                        addDebugMessage('➡️ Coluna movida para direita na mesma linha');
                    }
                }
                else if (direction === 'between-rows-left') {
                    const $targetRow = $currentRow.prev('.form-row');
                    if (!$targetRow.length) {
                        addDebugMessage('❌ Não há linha acima para mover a coluna');
                        return;
                    }
                    
                    $col.detach();
                    $targetRow.append($col);
                    updateJSONOutput();
                    updateRowButtons();
                    updateColumnButtons();
                    updateComponentButtons();
                    addDebugMessage('🔄 Coluna movida para linha de cima');
                }
                else if (direction === 'between-rows-right') {
                    const $targetRow = $currentRow.next('.form-row');
                    if (!$targetRow.length) {
                        addDebugMessage('❌ Não há linha abaixo para mover a coluna');
                        return;
                    }
                    
                    $col.detach();
                    const $rowButtons = $targetRow.children('.row-buttons').first();
                    if ($rowButtons.length) {
                        $rowButtons.after($col);
                    } else {
                        $targetRow.prepend($col);
                    }
                    updateJSONOutput();
                    updateRowButtons();
                    updateColumnButtons();
                    updateComponentButtons();
                    addDebugMessage('🔄 Coluna movida para linha de baixo');
                }
            }

            function updateColumnButtons() {
                $('.form-column').each(function() {
                    const $col = $(this);
                    const $leftBtn = $col.find('.move-col-left');
                    const $rightBtn = $col.find('.move-col-right');

                    $leftBtn.prop('disabled', false).removeClass('disabled');
                    $rightBtn.prop('disabled', false).removeClass('disabled');

                    $leftBtn.attr('title', 'Mover para esquerda (Clique: mesma linha | Shift+Clique: linha acima)');
                    $rightBtn.attr('title', 'Mover para direita (Clique: mesma linha | Shift+Clique: linha abaixo)');
                });
            }

            function isValidMove($element, $target) {
                if ($element.is($target)) {
                    return false;
                }

                const elementType = getComponentType($element);
                const targetType = getContainerType($target);
                
                const component = components[elementType];
                if (!component) return false;

                return component.allowedIn.includes(targetType);
            }

            function handleElementMove($element, $target) {
                if (!isValidMove($element, $target)) {
                    addDebugMessage(`❌ Não é possível mover ${getComponentName($element)} para ${getContainerName($target)}`);
                    return;
                }

                $element.detach().appendTo($target);
                updateJSONOutput();
                updateColumnButtons();
                updateComponentButtons();
                addDebugMessage(`🔄 ${getComponentName($element)} movido para ${getContainerName($target)}`);
            }

            function moveRowUp($row) {
                const $prevRow = $row.prev('.form-row');
                if ($prevRow.length) {
                    $row.insertBefore($prevRow);
                    updateJSONOutput();
                    updateRowButtons();
                    updateColumnButtons();
                    updateComponentButtons();
                    addDebugMessage('⬆️ Linha movida para cima');
                }
            }

            function moveRowDown($row) {
                const $nextRow = $row.next('.form-row');
                if ($nextRow.length) {
                    $row.insertAfter($nextRow);
                    updateJSONOutput();
                    updateRowButtons();
                    updateColumnButtons();
                    updateComponentButtons();
                    addDebugMessage('⬇️ Linha movida para baixo');
                }
            }

            function updateRowButtons() {
                const $rows = $('#main-canvas').children('.form-row');
                const rowCount = $rows.length;

                $rows.each(function(index) {
                    const $row = $(this);
                    const $upBtn = $row.find('.move-row-up');
                    const $downBtn = $row.find('.move-row-down');

                    if (rowCount === 1) {
                        $upBtn.prop('disabled', true).addClass('disabled');
                        $downBtn.prop('disabled', true).addClass('disabled');
                    } else if (index === 0) {
                        $upBtn.prop('disabled', true).addClass('disabled');
                        $downBtn.prop('disabled', false).removeClass('disabled');
                    } else if (index === rowCount - 1) {
                        $upBtn.prop('disabled', false).removeClass('disabled');
                        $downBtn.prop('disabled', true).addClass('disabled');
                    } else {
                        $upBtn.prop('disabled', false).removeClass('disabled');
                        $downBtn.prop('disabled', false).removeClass('disabled');
                    }
                });
            }

            function addComponentToCanvas(componentType, $target) {
                // Prevenir execuções múltiplas
                if (isProcessingDrop) {
                    addDebugMessage(`⚠️ Drop já em processamento, ignorando duplicação`);
                    return;
                }
                
                isProcessingDrop = true;
                
                const component = components[componentType];
                if (!component) {
                    isProcessingDrop = false;
                    return;
                }

                if ($target.hasClass('main-canvas') && $target.children('.empty-canvas-message').length > 0) {
                    $target.empty();
                }

                const $component = $(component.html);
                const uniqueId = generateUniqueId();
                const uniqueName = generateUniqueName(componentType);
                
                $component.attr('data-component-type', componentType);
                $component.attr('data-component-id', uniqueId);

                // Garantir IDs e names únicos para todos os elementos
                $component.find('input, select, textarea').each(function() {
                    const $input = $(this);
                    const currentId = $input.attr('id');
                    const currentName = $input.attr('name');
                    
                    // Aplicar ID único
                    if (currentId) {
                        $input.attr('id', currentId + '_' + uniqueId);
                    } else {
                        // Se não tem ID, criar um baseado no name ou tipo
                        const baseId = currentName || componentType;
                        $input.attr('id', baseId + '_' + uniqueId);
                    }
                    
                    // Aplicar name único para radio/checkbox groups
                    if (currentName && (componentType === 'radio' || componentType === 'checkbox')) {
                        $input.attr('name', currentName + '_' + uniqueId);
                    } else if (!currentName) {
                        $input.attr('name', uniqueName);
                    }

                    if (componentType !== 'select') { // Mantém opções do select
                            $input.val('');
                        }
                });

                // Garantir IDs únicos para labels e sincronizar com inputs
                $component.find('label').each(function() {
                    const $label = $(this);
                    const forAttr = $label.attr('for');
                    
                    if (forAttr) {
                        // Sincronizar com o ID do input correspondente
                        $label.attr('for', forAttr + '_' + uniqueId);
                    } else {
                        // Se o label não tem 'for', criar um ID único para ele
                        $label.attr('id', 'label_' + uniqueId);
                    }
                });

                const targetType = getContainerType($target);
                
                if (!component.allowedIn.includes(targetType)) {
                    const errorMsg = `❌ Não é possível adicionar ${component.label} em ${getContainerName($target)}`;
                    addDebugMessage(errorMsg);
                    isProcessingDrop = false;
                    return;
                }

                if (component.isContainer) {
                    $component.appendTo($target);
                    $component.attr('draggable', 'false');
                    
                    if (componentType === 'row') {
                        addRowButtons($component);
                    } else {
                        addColumnButtons($component, componentType);
                        // Abrir modal de edição automaticamente para colunas
                        setTimeout(() => {
                            if (components[componentType] && components[componentType].editComponent) {
                                components[componentType].editComponent($component, updateJSONOutput, addDebugMessage);
                            }
                        }, 100);
                    }
                    
                    const successMsg = `✅ ${component.label} adicionado em ${getContainerName($target)}`;
                    addDebugMessage(successMsg);
                } else {
                    if ($target.hasClass('form-column')) {
                        $component.addClass('draggable-component').appendTo($target);
                        $component.attr('draggable', 'false');
                        addComponentButtons($component, componentType);
                        
                        const successMsg = `✅ ${component.label} adicionado em coluna`;
                        addDebugMessage(successMsg);
                    } else {
                        const errorMsg = `❌ Componentes devem ser colocados dentro de Colunas! Tentativa: ${component.label} em ${getContainerName($target)}`;
                        addDebugMessage(errorMsg);
                        isProcessingDrop = false;
                        return;
                    }
                }

                hideEmptyCanvasMessage();
                updateJSONOutput();
                updateRowButtons();
                updateColumnButtons();
                updateComponentButtons();
                
                // Resetar flag após processamento
                setTimeout(() => {
                    isProcessingDrop = false;
                }, 100);
                
                // Resetar flag após processamento
                setTimeout(() => {
                    isProcessingDrop = false;
                }, 100);
            }

            function addRowButtons($row) {
                const buttonsHTML = `
                    <div class="row-buttons" style="position: absolute; left: 5px; top: 5px; z-index: 10; display: flex; gap: 2px;flex-direction: row-reverse;">
                        <button type="button" class="btn btn-sm btn-danger remove-btn" style="width: 25px; height: 25px; padding: 0; font-size: 10px;" title="Remover">×</button>
                        <button type="button" class="btn btn-sm btn-outline-primary move-row-down" style="width: 25px; height: 25px; padding: 0; font-size: 10px;" title="Mover para baixo">↓</button>
                        <button type="button" class="btn btn-sm btn-outline-primary move-row-up" style="width: 25px; height: 25px; padding: 0; font-size: 10px;" title="Mover para cima">↑</button>
                    </div>
                `;
                $row.prepend(buttonsHTML);
            }

            function addColumnButtons($col, componentType) {
                const buttonsHTML = `
                    <div class="col-buttons" style="position: absolute; right: 5px; top: 5px; z-index: 10; display: flex; gap: 2px;">
                        <button type="button" class="btn btn-sm btn-outline-primary move-col-left" style="width: 25px; height: 25px; padding: 0; font-size: 10px;" title="Mover para esquerda (Clique: mesma linha | Shift+Clique: linha acima)">←</button>
                        <button type="button" class="btn btn-sm btn-outline-primary move-col-right" style="width: 25px; height: 25px; padding: 0; font-size: 10px;" title="Mover para direita (Clique: mesma linha | Shift+Clique: linha abaixo)">→</button>
                        <button type="button" class="btn btn-sm btn-danger remove-btn" style="width: 25px; height: 25px; padding: 0; font-size: 10px;" title="Remover">×</button>
                    </div>
                `;
                $col.prepend(buttonsHTML);
            }

            function addComponentButtons($element, componentType) {
                const buttonsHTML = `
                    <div class="component-buttons" style="position: absolute; right: 5px; top: 5px; z-index: 10; display: flex; gap: 2px;">
                        <button type="button" class="btn btn-sm btn-outline-primary move-comp-up" style="width: 20px; height: 20px; padding: 0; font-size: 10px;" title="Mover para cima (Clique: mesma coluna | Shift+Clique: coluna à esquerda)">↑</button>
                        <button type="button" class="btn btn-sm btn-outline-primary move-comp-down" style="width: 20px; height: 20px; padding: 0; font-size: 10px;" title="Mover para baixo (Clique: mesma coluna | Shift+Clique: coluna à direita)">↓</button>
                        <button type="button" class="btn btn-sm btn-danger remove-btn" style="width: 20px; height: 20px; padding: 0; font-size: 10px;" title="Remover">×</button>
                    </div>
                `;
                $element.prepend(buttonsHTML);
            }

            function getContainerType($element) {
                if ($element.hasClass('main-canvas')) return 'canvas';
                if ($element.hasClass('form-row')) return 'row';
                if ($element.hasClass('form-column')) return 'col';
                return 'unknown';
            }

            function getContainerName($element) {
                const containerType = getContainerType($element);
                switch(containerType) {
                    case 'canvas': return 'Canvas';
                    case 'row': return 'Linha';
                    case 'col': return 'Coluna';
                    default: return 'Container desconhecido';
                }
            }

            function getComponentName($element) {
                const elementType = getComponentType($element);
                const component = components[elementType];
                return component ? component.label : 'Componente desconhecido';
            }

            function getComponentType($element) {
                const dataType = $element.attr('data-component-type');
                if (dataType && components[dataType]) {
                    return dataType;
                }

                if ($element.hasClass('form-row')) {
                    return 'row';
                }
                if ($element.hasClass('form-column')) {
                    return 'col';
                }
                if ($element.hasClass('draggable-component')) {
                    if ($element.find('input[type="text"]').length) return 'input';
                    if ($element.find('select').length) return 'select';
                    if ($element.find('input[type="radio"]').length) return 'radio';
                    if ($element.find('input[type="checkbox"]').length) return 'checkbox';
                    if ($element.find('textarea').length) return 'textarea';
                    if ($element.find('label').length && !$element.find('input, select, textarea').length) return 'label';
                }
                
                return 'unknown';
            }

            function loadFormData(formData) {
                const $canvas = $('#main-canvas');
                $canvas.empty();
                
                if (formData.components && formData.components.length > 0) {
                    formData.components.forEach(comp => {
                        loadComponent(comp, $canvas);
                    });
                    hideEmptyCanvasMessage();
                    addDebugMessage(`📁 Formulário carregado com ${formData.components.length} componentes`);
                } else {
                    showEmptyCanvasMessage();
                }
                
                updateJSONOutput();
                updateRowButtons();
                updateColumnButtons();
                updateComponentButtons();
            }

            function loadComponent(componentData, $parent) {
                const component = components[componentData.type];
                if (!component) return;

                const $component = $(component.html);
                const uniqueId = componentData.id || generateUniqueId();
                const uniqueName = componentData.name || generateUniqueName(componentData.type);
                
                $component.attr('data-component-type', componentData.type);
                $component.attr('data-component-id', uniqueId);

                // Aplicar classes persistidas para rows e cols (restaura col-*, col-md-*, etc.)
                if ((componentData.type === 'row' || componentData.type === 'col') && componentData.classes) {
                    $component.attr('class', componentData.classes);
                }

                // Aplicar IDs e names únicos
                $component.find('input, select, textarea').each(function() {
                    const $input = $(this);
                    const currentId = $input.attr('id');
                    const currentName = $input.attr('name');
                    
                    if (currentId) {
                        $input.attr('id', currentId + '_' + uniqueId);
                    } else {
                        const baseId = currentName || componentData.type;
                        $input.attr('id', baseId + '_' + uniqueId);
                    }
                    
                    if (currentName && (componentData.type === 'radio' || componentData.type === 'checkbox')) {
                        $input.attr('name', currentName + '_' + uniqueId);
                    } else if (!currentName) {
                        $input.attr('name', uniqueName);
                    }
                });

                // Aplicar IDs únicos para labels
                $component.find('label').each(function() {
                    const $label = $(this);
                    const forAttr = $label.attr('for');
                    
                    if (forAttr) {
                        $label.attr('for', forAttr + '_' + uniqueId);
                    } else {
                        $label.attr('id', 'label_' + uniqueId);
                    }
                });
                
                // Aplicar dados do componente
                if (componentData.label) {
                    const $label = $component.find('label').first();
                    if ($label.length) {
                        $label.text(componentData.label);
                        // *** Aplicar classes APENAS se for um componente do tipo label ***
                        if (componentData.type === 'label' && componentData.attributes && componentData.attributes.class) {
                            $label.attr('class', componentData.attributes.class);
                        }
                        if (componentData.required) {
                            if (window.updateRequiredIndicator) {
                                window.updateRequiredIndicator($component, true);
                            }
                        }
                    }
                }
                
                // Aplicar value apenas se não for vazio
                /*if (componentData.value) {
                    $component.find('input, textarea, select').first().val(componentData.value);
                }*/

                // Aplicar required
                if (componentData.required) {
                    $component.find('input, textarea, select').first().prop('required', true);
                    if (window.updateRequiredIndicator) {
                        window.updateRequiredIndicator($component, true);
                    }
                }

                // Aplicar placeholder
                if (componentData.placeholder) {
                    $component.find('input, textarea').attr('placeholder', componentData.placeholder);
                }

                // Aplicar atributos específicos
                if (componentData.attributes) {
                    applyAttributesToComponent($component, componentData.attributes);
                }

                // Aplicar opções para select, radio, checkbox
                if (componentData.options && componentData.options.length > 0) {
                    applyOptionsToComponent(
                        $component, 
                        componentData.type, 
                        componentData.options, 
                        componentData.name || uniqueName,
                        componentData.required || false,
                        componentData.inline || false  // ADICIONAR ESTE PARÂMETRO
                    );
                }

                if (component.isContainer && componentData.children) {
                    $component.appendTo($parent);
                    $component.attr('draggable', 'false');
                    
                    if (componentData.type === 'row') {
                        addRowButtons($component);
                    } else {
                        addColumnButtons($component, componentData.type);
                    }
                    
                    componentData.children.forEach(child => {
                        loadComponent(child, $component);
                    });
                } else {
                    $component.addClass('draggable-component').appendTo($parent);
                    $component.attr('draggable', 'false');
                    addComponentButtons($component, componentData.type);
                }
            }

            function updateJSONOutput() {
                const formData = getFormData();
                $('#json-output').text(JSON.stringify(formData, null, 2));

                // DISPARAR EVENTO DE ATUALIZAÇÃO
                $container.trigger('inw:builder:updated', [formData]);
            }

            function getFormData() {
                const $canvas = $('#main-canvas');
                const components = [];
                
                $canvas.children('.form-row').each(function() {
                    const component = parseComponent($(this));
                    if (component) {
                        components.push(component);
                    }
                });
                
                return {
                    components: components,
                    metadata: {
                        created: new Date().toISOString(),
                        version: '1.0'
                    }
                };
            }

            function parseComponent($element) {
                if (!$element.length || !$element.is(':visible')) {
                    return null;
                }

                const componentType = getComponentType($element);
                
                if (componentType === 'unknown') {
                    return null;
                }

                const componentData = {
                    type: componentType,
                    id: $element.attr('data-component-id') || generateUniqueId()
                };

                // CAPTURAR CLASSES CSS PARA ROWS E COLS
                if (componentType === 'row' || componentType === 'col') {
                    const currentClasses = $element.attr('class') || '';
                    componentData.classes = currentClasses;
                    
                    // Extrair informações específicas de tamanho para cols
                    if (componentType === 'col') {
                        const sizeInfo = {};
                        const sizePrefixes = ['col-', 'col-sm-', 'col-md-', 'col-lg-', 'col-xl-', 'col-xxl-'];
                        
                        sizePrefixes.forEach(prefix => {
                            const regex = new RegExp(prefix + '(\\d+)');
                            const match = currentClasses.match(regex);
                            if (match) {
                                sizeInfo[prefix.replace('-', '')] = match[1];
                            }
                        });
                        
                        if (Object.keys(sizeInfo).length > 0) {
                            componentData.sizes = sizeInfo;
                        }
                    }
                }

                if ($element.hasClass('form-row') || $element.hasClass('form-column')) {
                    componentData.children = [];
                    $element.children().each(function() {
                        const $child = $(this);
                        if ($child.hasClass('draggable-component') || 
                            $child.hasClass('form-column') || 
                            $child.hasClass('form-row')) {
                            const childComponent = parseComponent($child);
                            if (childComponent) {
                                componentData.children.push(childComponent);
                            }
                        }
                    });
                } else if ($element.hasClass('draggable-component')) {
                    const $label = $element.find('label').first();
                    if ($label.length) {
                        componentData.label = $label.text().replace(' *', '').trim();
                    }

                    const $input = $element.find('input, textarea, select').first();
                    if ($input.length) {
                        // Para radio/checkbox/select, não salvar value se estiver vazio
                        /*const inputValue = $input.val();
                        if (inputValue && inputValue !== '') {
                            componentData.value = inputValue;
                        }*/
                        
                        componentData.name = $input.attr('name') || generateUniqueName(componentType);
                        componentData.required = $input.prop('required') || false;
                        
                        if ($input.attr('placeholder')) {
                            componentData.placeholder = $input.attr('placeholder');
                        }

                        componentData.attributes = {};
                        const importantAttrs = ['type', 'maxlength', 'min', 'max', 'step', 'pattern', 'class'];
                        importantAttrs.forEach(attr => {
                            if ($input.attr(attr)) {
                                componentData.attributes[attr] = $input.attr(attr);
                            }
                        });

                        // Capturar opções para select, radio, checkbox
                        if (componentType === 'select') {
                            componentData.options = [];
                            $element.find('option').each(function() {
                                const $option = $(this);
                                componentData.options.push({
                                    value: $option.attr('value') || '',
                                    label: $option.text().trim().replace(/\s+/g, ' ')
                                });
                            });
                        } else if (componentType === 'radio' || componentType === 'checkbox') {
                            //componentData.name = $input.attr('name') || generateUniqueName(componentType);
                            componentData.inline = ($element.find('.form-check').parent()).hasClass("d-flex");
                            componentData.options = [];
                            
                            $element.find('.form-check').each(function() {
                                const $checkInput = $(this).find('input');
                                const $checkLabel = $(this).find('label');
                                const isOther = $(this).hasClass('inw-radio-other');
                                const optionData = {
                                    value: $checkInput.attr('value') || $checkLabel.text(),
                                    label: $checkLabel.text().trim().replace(/\s+/g, ' '),
                                    other: !!isOther
                                };
                                componentData.options.push(optionData);
                            });
                        }
                    }else if (componentType === 'label') { // *** CORREÇÃO: Para componentes label que não têm inputs OS TÍTULOS ***
                        const $label = $element.find('label').first();
                        if ($label.length) {
                            componentData.attributes = {
                                class: $label.attr('class') || 'form-label'
                            };
                        }
                    }
                }

                return componentData;
            }

            function showEmptyCanvasMessage() {
                if ($('#main-canvas').children().length === 0) {
                    $('#main-canvas').html('<div class="empty-canvas-message text-center text-muted py-5"><h6>Arraste componentes da paleta para começar</h6><small>Comece arrastando uma "Linha" para o canvas</small></div>');
                }
            }

            function hideEmptyCanvasMessage() {
                $('.empty-canvas-message').remove();
            }

            function checkEmptyCanvas() {
                if ($('#main-canvas').children().length === 0) {
                    showEmptyCanvasMessage();
                }
            }

            // Função de destruição completa do plugin
            /*function destroyPlugin() {
                // Remover TODOS os eventos relacionados ao plugin
                // IMPORTANTE: Usar .off() sem handler para remover TODOS os handlers
                $('.component-item').off('dragstart').off('dragend');
                $('#clear-canvas-palette').off('click');
                $('#main-canvas').off('dragover').off('dragleave').off('drop');
                
                // Remover eventos delegados um por um para garantir remoção completa
                $(document).off('dragstart', '.form-row, .form-column, .draggable-component');
                $(document).off('dragend', '.form-row, .form-column, .draggable-component');
                $(document).off('dragover', '.form-row, .form-column');
                $(document).off('dragleave', '.form-row, .form-column');
                $(document).off('drop', '.form-row, .form-column');
                $(document).off('dblclick', '.form-group, .form-column');
                $(document).off('click', '.remove-btn');
                $(document).off('click', '.move-row-up');
                $(document).off('click', '.move-row-down');
                $(document).off('click', '.move-col-left');
                $(document).off('click', '.move-col-right');
                $(document).off('click', '.move-comp-up');
                $(document).off('click', '.move-comp-down');
                
                // Limpar o container completamente
                $container.empty().removeClass('inw-form-builder');
                
                // Remover elementos órfãos
                $('#component-palette').remove();
                $('#main-canvas').remove();
                $('#json-output').parent().remove();
                $('#debug-output').parent().remove();
                
                // Remover dados armazenados
                $container.removeData('INWformBuilder');
            }*/

            // Expõe funções públicas no retorno do plugin
            $container.data('INWformBuilder', {
                //destroy: destroyPlugin,
                getFormData: getFormData,
                getJSON: function(pretty = true) {
                    const formData = getFormData();
                    return pretty ? JSON.stringify(formData, null, 2) : JSON.stringify(formData);
                },
                loadFromJSON: function(newFormData) {
                    const dataObj = typeof newFormData === 'string' ? JSON.parse(newFormData) : newFormData;
                    if (!dataObj || !dataObj.components) return;
                    loadFormData(dataObj);
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
                    this.loadFromJSON(payload);
                },
                clear: function() {
                    const $canvas = $container.find('#main-canvas');
                    if ($canvas.length) {
                        $canvas.empty();
                        showEmptyCanvasMessage();
                    }
                    updateJSONOutput();
                    updateRowButtons();
                    updateColumnButtons();
                    updateComponentButtons();
                },
                toggleDebugJson: function() {
                    const $jsonBlock = $container.find('#json-output');
                    if ($jsonBlock.length) {
                        $jsonBlock.closest('.json-output').toggle();
                    }
                }
            });
            // Notificar que o builder está pronto
            try { $container.trigger('inw:builder:ready'); } catch (e) { /* noop */ }

            updateBootstrapInfo();
            $(window).resize(updateBootstrapInfo);
        });
    };

    // CSS inline
    $(document).ready(function() {
        if (!$('#inwforms-styles').length) {
            $('head').append(`
                <style id="inwforms-styles">
                    .component-item {
                        padding: 6px 12px;
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        cursor: grab;
                        user-select: none;
                        transition: all 0.3s ease;
                        margin: 1px;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    
                    .component-item:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .component-item.dragging {
                        opacity: 0.6;
                        transform: scale(0.95);
                    }
                    
                    #clear-canvas-palette {
                        cursor: pointer !important;
                    }
                    
                    #clear-canvas-palette:hover {
                        background-color: #ffc107 !important;
                        border-color: #ffc107 !important;
                        color: #212529 !important;
                    }
                    
                    .component-icon {
                        font-size: 14px;
                    }
                    
                    .component-label {
                        white-space: nowrap;
                    }
                    
                    .palette-section {
                        margin-bottom: 0.5rem;
                    }
                    
                    .draggable-component, .form-column, .form-row {
                        position: relative;
                        padding: 15px;
                        margin: 8px 0;
                        border: 2px dashed transparent;
                        border-radius: 8px;
                        transition: all 0.3s ease;
                        background: white;
                        border-color: #ccc;
                    }
                    
                    .draggable-component:hover, .form-column:hover, .form-row:hover {
                        border-color: #007bff;
                        background-color: #f8f9fa;
                    }
                    
                    .draggable-component.dragging, .form-column.dragging, .form-row.dragging {
                        opacity: 0.6;
                        border-color: #6c757d;
                    }
                    
                    .drop-zone-active {
                        background-color: #e7f3ff !important;
                        border-color: #007bff !important;
                        border-style: solid !important;
                    }
                    
                    .drop-zone-highlight {
                        background-color: #d4edda !important;
                        border-color: #28a745 !important;
                        border-style: solid !important;
                        box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
                    }
                    
                    .remove-btn, .move-row-up, .move-row-down, .move-col-left, .move-col-right, .move-comp-up, .move-comp-down {
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .btn.disabled {
                        opacity: 0.4 !important;
                        cursor: not-allowed;
                    }

                    .draggable-component:hover .remove-btn,
                    .draggable-component:hover .move-comp-up,
                    .draggable-component:hover .move-comp-down,
                    .form-column:hover .remove-btn,
                    .form-column:hover .move-col-left,
                    .form-column:hover .move-col-right,
                    .form-row:hover .remove-btn,
                    .form-row:hover .move-row-up,
                    .form-row:hover .move-row-down {
                        opacity: 1;
                    }
                    
                    .row-buttons, .col-buttons, .component-buttons {
                        display: flex;
                        gap: 2px;
                    }
                                        
                    .main-canvas {
                        min-height: 400px;
                        background: #f8f9fa;
                        transition: all 0.3s ease;
                    }
                    
                    .empty-canvas-message {
                        pointer-events: none;
                        user-select: none;
                    }
                    
                    .debug-output textarea {
                        font-family: 'Courier New', monospace;
                        background-color: #f8f9fa;
                    }
                    .row-buttons { z-index: 10 !important; }
                    .col-buttons { z-index: 25 !important; }
                    .component-buttons { z-index: 30 !important; }
                    
                    .vr {
                        width: 1px;
                        background-color: #dee2e6;
                        align-self: stretch;
                    }
                    
                    .inw-form-builder {
                        display: flex;
                        flex-direction: column;
                        gap: 0;
                    }
                    
                    .components-palette {
                        border-bottom-left-radius: 0;
                        border-bottom-right-radius: 0;
                        margin-bottom: 0;
                    }
                    
                    .main-canvas {
                        border-radius: 0 0.375rem 0.375rem 0;
                        border-top: none;
                    }
                    
                    .main-canvas.scroll-enabled {
                        overflow-y: auto;
                    }
                    
                    .form-builder-horizontal {
                        display: flex;
                        gap: 0;
                        height: 100%;
                    }
                    
                    .palette-container {
                        flex-shrink: 0;
                    }
                    
                    .palette-left {
                        border-right: 1px solid #dee2e6;
                    }
                    
                    .palette-right {
                        border-left: 1px solid #dee2e6;
                    }
                    
                    .canvas-container {
                        flex: 1;
                    }
                    
                    .components-palette-vertical {
                        width: 170px;
                    }
                    
                    .components-palette-vertical .component-item {
                        width: 100%;
                        justify-content: start;
                        margin: 2px 0;
                        display: flex;
                    }

                    .required-asterisk {
                        color: #dc3545;
                        font-weight: bold;
                        margin-left: 4px;
                        display: inline-block;
                    }
                    #main-canvas input[type="radio"], #main-canvas input[type="checkbox"] {
                        margin-top: 0.7rem;
                    }
                </style>
            `);
        }
    });

})(jQuery);



})();