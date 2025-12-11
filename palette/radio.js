(function() {
    'use strict';

    if (!window.INW_PALETTE) {
        window.INW_PALETTE = {};
    }

    window.INW_PALETTE['radio'] = {
        type: 'radio',
        label: 'Radio',
        icon: '🔘',
        btnClass: 'btn-outline-success',
        includeInPalette: true
    };

    if (!window.INW_COMPONENTS) {
        window.INW_COMPONENTS = {};
    }

    function generateUniqueValue() {
        return 'opt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    window.INW_COMPONENTS['radio'] = {
        type: 'radio',
        label: 'Radio',
        icon: '🔘',
        /*html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Opções Radio</label>
                <div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="radio-group" value="${generateUniqueValue()}" id="radio1">
                        <label class="form-check-label" for="radio1">Opção 1</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="radio-group" value="${generateUniqueValue()}" id="radio2">
                        <label class="form-check-label" for="radio2">Opção 2</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="radio-group" value="${generateUniqueValue()}" id="radio3">
                        <label class="form-check-label" for="radio3">Opção 3</label>
                    </div>
                </div>
            </div>
        `,*/
        html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Opções Radio</label>
                <div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="radio-group" value="${generateUniqueValue()}" id="radio1">
                        <label class="form-check-label" for="radio1">Opção 1</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="radio-group" value="${generateUniqueValue()}" id="radio2">
                        <label class="form-check-label" for="radio2">Opção 2</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="radio-group" value="${generateUniqueValue()}" id="radio3">
                        <label class="form-check-label" for="radio3">Opção 3</label>
                    </div>
                </div>
            </div>
        `,
        isContainer: false,
        allowedIn: ['col'],
        
        editComponent: function($component, updateJSONOutput, addDebugMessage) {
            // Obter valores atuais - USAR TRIM() para remover espaços
            const currentLabel = $component.find('.form-label').text().trim();
            const currentOptions = [];
            
            // Verificar se está inline
            const isInline = $component.find('.form-check').parent().hasClass('d-flex');
            let isOther = false;
            let otherValue = '';
            let otherLabel = 'Outro';
            
            $component.find('.form-check').not('.inw-radio-other').each(function() {
                const $input = $(this).find('input');
                const $label = $(this).find('label');
                currentOptions.push({
                    value: $input.attr('value') || '',
                    label: $label.text().trim()
                });
            });

            $component.find('.inw-radio-other').each(function(){
                if($(this).hasClass('inw-radio-other')){
                    isOther = true;
                    otherValue = $(this).find('input').attr('value') || '';
                    otherLabel = $(this).find('label').text().trim().replace(/:+$/, '') || 'Outro';
                }
            });

            const currentName = $component.find('input[type="radio"]').first().attr('name') || 'radio-group';
            const isRequired = $component.find('input[type="radio"]').first().prop('required');
            
            // Criar HTML do formulário
            const formHTML = `
                <form id="radio-edit-form">
                    <div class="mb-3">
                        <label for="radio-group-label" class="form-label">Label do Grupo:</label>
                        <input type="text" class="form-control" id="radio-group-label" value="${currentLabel.replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="mb-3">
                        <label for="radio-group-name" class="form-label">Nome do Grupo:</label>
                        <input type="text" class="form-control" id="radio-group-name" value="${currentName.replace(/"/g, '&quot;')}" required>
                        <div class="form-text">Define o name dos inputs radio (mesmo name = mesmo grupo)</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Opções:</label>
                        <div id="radio-options-container">
                            ${currentOptions.map((option, index) => `
                                <div class="input-group mb-2 option-row" data-index="${index}">
                                    <input type="hidden" class="option-value" value="${option.value.replace(/"/g, '&quot;')}">
                                    <input type="text" class="form-control option-label" placeholder="Descrição" value="${option.label.replace(/"/g, '&quot;')}" required>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-option" ${index === 0 ? 'disabled' : ''}>×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary" id="add-radio-option">+ Adicionar Opção</button>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="radio-other" ${isOther ? 'checked' : ''}>
                        <label class="form-check-label" for="radio-other">
                            Exibir opção
                        </label>
                        <input type="hidden" id="other-value" value="${otherValue.replace(/"/g, '&quot;')}">
                        <input class="form-control form-control-sm d-inline" maxlength="50" type="text" id="radio-other-label" value="${otherLabel.replace(/"/g, '&quot;')}" style="width: auto;" placeholder="Texto da Opção..." />
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="radio-required" ${isRequired ? 'checked' : ''}>
                        <label class="form-check-label" for="radio-required">
                            Seleção obrigatória
                        </label>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="radio-inline" ${isInline ? 'checked' : ''}>
                        <label class="form-check-label" for="radio-inline">
                            Exibir opções em linha (inline)
                        </label>
                    </div>
                </form>
            `;
            
            // Usar SweetAlert2 para mostrar o modal
            if (window.INW_SHOW_EDIT_MODAL) {
                window.INW_SHOW_EDIT_MODAL(
                    'Editar Opções Radio',
                    formHTML,
                    function() {
                        const newLabel = $('#radio-group-label').val().trim();
                        const newName = $('#radio-group-name').val().trim();
                        const isRequired = $('#radio-required').prop('checked');
                        const isInline = $('#radio-inline').prop('checked');
                        const isOther = $('#radio-other').prop('checked');
                        
                        if (!newLabel) {
                            Swal.showValidationMessage('Label do grupo é obrigatório!');
                            return false;
                        }
                        
                        if (!newName) {
                            Swal.showValidationMessage('Nome do grupo é obrigatório!');
                            return false;
                        }
                        
                        // Coletar opções
                        const newOptions = [];
                        $('#radio-options-container .option-row').each(function() {
                            const $valueInput = $(this).find('.option-value');
                            const label = $(this).find('.option-label').val().trim();                    
                            if (label) {
                                let value = $valueInput.val();
                                if (!value) {
                                    value = generateUniqueValue();
                                    $valueInput.val(value);
                                }
                                newOptions.push({ value: value, label: label, other:false });
                            }
                        });
                        
                        if (newOptions.length === 0) {
                            Swal.showValidationMessage('É necessário pelo menos uma opção!');
                            return false;
                        }

                        if(isOther){
                            const $valueInput = $('#other-value');
                            const otherLabel = ($('#radio-other-label').val().trim().replace(/:+$/, '') || 'Outro') + ': ';
                            let value = $valueInput.val();
                            if(!value){
                                value = generateUniqueValue();
                                $valueInput.val(value);
                            }
                            newOptions.push({ value: value, label: otherLabel, other:true, otherValue:'' });
                        }
                        
                        // Atualizar componente
                        $component.find('.form-label').text(newLabel);
                        
                        // Atualizar opções
                        const $container = $component.find('.form-check').parent();
                        $container.empty();
                        
                        // Aplicar classe inline se necessário
                        if (isInline) {
                            $container.addClass('d-flex flex-wrap gap-3');
                        } else {
                            $container.removeClass('d-flex flex-wrap gap-3');
                        }
                        
                        newOptions.forEach((option, index) => {
                            const optionId = `radio-${newName}-${index}`;
                            let optionHTML = false;
                            if(option.other){
                                optionHTML = `
                                    <div class="form-check inw-radio-other ${isInline ? 'mb-0' : ''}">
                                        <input class="form-check-input" type="radio" name="${newName}" value="${option.value}" id="${optionId}" ${isRequired ? 'required' : ''}>
                                        <label class="form-check-label" for="${optionId}">
                                            ${option.label}
                                        </label>
                                        <input type="text" class="form-control form-control-sm d-none d-inline" maxlength="200" style="width:200px; min-height: 25px !important; max-height: 10px;" data-for="${optionId}" placeholder="Descreva...">
                                    </div>
                                `;
                            }else{
                                optionHTML = `
                                    <div class="form-check ${isInline ? 'mb-0' : ''}">
                                        <input class="form-check-input" type="radio" name="${newName}" value="${option.value}" id="${optionId}" ${isRequired ? 'required' : ''}>
                                        <label class="form-check-label" for="${optionId}">
                                            ${option.label}
                                        </label>
                                    </div>
                                `;
                            }
                            if(optionHTML){
                                $container.append(optionHTML);
                            }
                        });
                        
                        if (window.updateRequiredIndicator) {
                            window.updateRequiredIndicator($component, isRequired);
                        }
                        
                        // Ativar comportamento de mostrar/ocultar o campo "Outro"
                        const groupSelector = `input[type="radio"][name="${newName}"]`;
                        const toggleOther = function() {
                            const $selected = $(groupSelector + ':checked');
                            const id = $selected.attr('id');
                            $component.find('.inw-radio-other input[type="text"]').each(function(){
                                const shouldShow = $(this).attr('data-for') === id;
                                $(this).toggleClass('d-none', !shouldShow);
                            });
                        };
                        $component.off('change.inwRadioOther').on('change.inwRadioOther', groupSelector, toggleOther);
                        toggleOther();

                        updateJSONOutput();
                        addDebugMessage(`✏️ Grupo radio atualizado: "${newLabel}" com ${newOptions.length} opções ${isInline ? '(inline)' : '(bloco)'}`);
                        
                        return true;
                    },
                    null,
                    function() {
                        // didOpen - configurar eventos dinâmicos
                        $('#radio-options-container').on('click', '.remove-option', function() {
                            if ($('#radio-options-container .option-row').length > 1) {
                                $(this).closest('.option-row').remove();
                            }
                        });
                        
                        $('#add-radio-option').on('click', function() {
                            const index = $('#radio-options-container .option-row').length;
                            const newOptionHTML = `
                                <div class="input-group mb-2 option-row" data-index="${index}">
                                    <input type="hidden" class="option-value" value="${generateUniqueValue()}">
                                    <input type="text" class="form-control option-label" placeholder="Descrição" required>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-option">×</button>
                                </div>
                            `;
                            $('#radio-options-container').append(newOptionHTML);
                        });
                    }
                );
            } else {
                console.warn('SweetAlert2 não está disponível');
            }
        },

        render: function(componentData, $container, readOnly, generateRenderId) {
            const gen = (typeof generateRenderId === 'function') 
                ? generateRenderId 
                : function(id) { return 'render_' + (id || Math.random().toString(36).substr(2, 9)); };
            const renderId = gen(componentData.id);
            const renderName = gen(componentData.name);
            
            let optionsHTML = '';
            const groupName = `render_${renderName}`;
            
            // Verificar se é inline
            const isInline = componentData.inline || false;
            const containerClass = isInline ? 'd-flex flex-wrap gap-3' : '';
            const checkClass = isInline ? 'mb-0' : '';
            
            if (componentData.options) {
                componentData.options.forEach((option, index) => {
                    const checked = option.value === componentData.value ? 'checked' : '';
                    const optionId = `render_radio_${renderName}_${index}`;
                    if (option.other) {
                        const otherText = option.otherValue || '';
                        optionsHTML += `
                            <div class="form-check inw-radio-other ${checkClass}">
                                <input class="form-check-input"
                                       type="radio"
                                       name="${groupName}"
                                       value="${option.value}"
                                       id="${optionId}"
                                       ${checked}
                                       ${componentData.required ? 'required' : ''}
                                       ${readOnly ? 'disabled' : ''}>
                                <label class="form-check-label" for="${optionId}">
                                    ${option.label}
                                </label>
                                <input type="text" class="form-control form-control-sm ${checked ? '' : 'd-none'} d-inline" maxlength="200" style="width:200px; min-height: 25px !important; max-height: 10px;" data-for="${optionId}" placeholder="Descreva..." value="${otherText}" ${readOnly ? 'readonly' : ''}>
                            </div>
                        `;
                    } else {
                        optionsHTML += `
                            <div class="form-check ${checkClass}">
                                <input class="form-check-input" 
                                       type="radio" 
                                       name="${groupName}"
                                       value="${option.value}" 
                                       id="${optionId}"
                                       ${checked}
                                       ${componentData.required ? 'required' : ''}
                                       ${readOnly ? 'disabled' : ''}>
                                <label class="form-check-label" for="${optionId}">
                                    ${option.label}
                                </label>
                            </div>
                        `;
                    }
                });
            }
            
            const $field = $(`
                <div class="form-field">
                    <label class="form-label">
                        ${componentData.label || 'Opções Radio'}
                        ${componentData.required ? '<span class="required-asterisk">*</span>' : ''}
                    </label>
                    <div class="${containerClass}">${optionsHTML}</div>
                </div>
            `);
            
            $container.append($field);

            // Toggle do campo "Outro" durante o uso do render
            if (!readOnly) {
                const selector = `input[type="radio"][name="${groupName}"]`;
                const $scope = $field;
                const toggleOther = function() {
                    const $selected = $scope.find(`${selector}:checked`);
                    const id = $selected.attr('id');
                    $scope.find('.inw-radio-other input[type="text"]').each(function(){
                        const shouldShow = $(this).attr('data-for') === id;
                        $(this).toggleClass('d-none', !shouldShow);
                    });
                };
                $scope.off('change.inwRadioOther').on('change.inwRadioOther', selector, toggleOther);
                toggleOther();
            }
            return $field;
        },

        getData: function($element) {
            const $checkedInput = $element.find('input[type="radio"]:checked');
            const options = [];
            let groupName = '';
            
            // Verificar se está inline
            const isInline = $element.find('.form-check').parent().hasClass('d-flex');
            
            $element.find('.form-check').each(function() {
                const $input = $(this).find('input');
                const $label = $(this).find('label');
                const isOther = $(this).hasClass('inw-radio-other');
                const $otherText = isOther ? $(this).find('input[type="text"]') : null;
                const opt = {
                    value: $input.attr('value'),
                    label: ($label.text() || '').trim().replace(/\s+/g, ' '),
                    other: !!isOther
                };
                if (isOther && $otherText && $otherText.length) {
                    // Apenas considera otherValue se a opção "Outros" estiver selecionada
                    opt.otherValue = $input.prop('checked') ? ($otherText.val() || '') : '';
                }
                options.push(opt);
                
                groupName = $input.attr('name').replace('render_', '');
            });
            
            const out = {
                label: $element.find('.form-label').text().replace(' *', '').trim(),
                value: $checkedInput.attr('value') || '',
                name: groupName,
                required: $element.find('input[type="radio"]').first().prop('required'),
                inline: isInline,
                options: options
            };
            return out;
        }
    };

})();