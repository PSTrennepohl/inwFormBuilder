(function() {
    'use strict';

    if (!window.INW_PALETTE) {
        window.INW_PALETTE = {};
    }

    window.INW_PALETTE['checkbox'] = {
        type: 'checkbox',
        label: 'Checkbox',
        icon: '☑️',
        btnClass: 'btn-outline-success',
        includeInPalette: true
    };

    if (!window.INW_COMPONENTS) {
        window.INW_COMPONENTS = {};
    }

    function generateUniqueValue() {
        return 'opt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    window.INW_COMPONENTS['checkbox'] = {
        type: 'checkbox',
        label: 'Checkbox',
        icon: '☑️',
        html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Opções Checkbox</label>
                <div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${generateUniqueValue()}" id="checkbox1">
                        <label class="form-check-label" for="checkbox1">Opção 1</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${generateUniqueValue()}" id="checkbox2">
                        <label class="form-check-label" for="checkbox2">Opção 2</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${generateUniqueValue()}" id="checkbox3">
                        <label class="form-check-label" for="checkbox3">Opção 3</label>
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
            // Verificar se tem opção Outros
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
                isOther = true;
                const $opt = $(this).find('input.form-check-input');
                otherValue = $opt.attr('value') || '';
                otherLabel = $(this).find('label').text().trim().replace(/:+$/, '') || 'Outro';
            });
            
            const isRequired = $component.find('input[type="checkbox"]').first().prop('required');
            
            // Criar HTML do formulário
            const formHTML = `
                <form id="checkbox-edit-form">
                    <div class="mb-3">
                        <label for="checkbox-group-label" class="form-label">Label do Grupo:</label>
                        <input type="text" class="form-control" id="checkbox-group-label" value="${currentLabel.replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Opções:</label>
                        <div id="checkbox-options-container">
                            ${currentOptions.map((option, index) => `
                                <div class="input-group mb-2 option-row" data-index="${index}">
                                    <input type="hidden" class="option-value" value="${option.value.replace(/"/g, '&quot;')}">
                                    <input type="text" class="form-control option-label" placeholder="Descrição" value="${option.label.replace(/"/g, '&quot;')}" required>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-option" ${index === 0 ? 'disabled' : ''}>×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary" id="add-checkbox-option">+ Adicionar Opção</button>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="checkbox-other" ${isOther ? 'checked' : ''}>
                        <label class="form-check-label" for="checkbox-other">
                            Exibir opção
                        </label>
                        <input type="hidden" id="checkbox-other-value" value="${otherValue.replace(/"/g, '&quot;')}">
                        <input class="form-control form-control-sm d-inline" maxlength="50" type="text" id="checkbox-other-label" value="${otherLabel.replace(/"/g, '&quot;')}" style="width: auto;" placeholder="Texto da Opção..." />
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="checkbox-required" ${isRequired ? 'checked' : ''}>
                        <label class="form-check-label" for="checkbox-required">
                            Seleção obrigatória (pelo menos uma)
                        </label>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="checkbox-inline" ${isInline ? 'checked' : ''}>
                        <label class="form-check-label" for="checkbox-inline">
                            Exibir opções em linha (inline)
                        </label>
                    </div>
                </form>
            `;
            
            // Usar SweetAlert2 para mostrar o modal
            if (window.INW_SHOW_EDIT_MODAL) {
                window.INW_SHOW_EDIT_MODAL(
                    'Editar Opções Checkbox',
                    formHTML,
                    function() {
                        const newLabel = $('#checkbox-group-label').val().trim();
                        const isRequired = $('#checkbox-required').prop('checked');
                        const isInline = $('#checkbox-inline').prop('checked');
                        const hasOther = $('#checkbox-other').prop('checked');
                        
                        if (!newLabel) {
                            Swal.showValidationMessage('Label do grupo é obrigatório!');
                            return false;
                        }
                        
                        // Coletar opções
                        const newOptions = [];
                        $('#checkbox-options-container .option-row').each(function() {
                            const $valueInput = $(this).find('.option-value');
                            const label = $(this).find('.option-label').val().trim();
                            
                            if (label) {
                                let value = $valueInput.val();
                                if (!value) {
                                    value = generateUniqueValue();
                                    $valueInput.val(value);
                                }
                                newOptions.push({ value: value, label: label, other: false });
                            }
                        });
                        
                        if (newOptions.length === 0) {
                            Swal.showValidationMessage('É necessário pelo menos uma opção!');
                            return false;
                        }

                        if (hasOther) {
                            const $valueInput = $('#checkbox-other-value');
                            const oLabel = ($('#checkbox-other-label').val().trim().replace(/:+$/, '') || 'Outro') + ': ';
                            let value = $valueInput.val();
                            if (!value) {
                                value = generateUniqueValue();
                                $valueInput.val(value);
                            }
                            newOptions.push({ value: value, label: oLabel, other: true, otherValue: '' });
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
                            const optionId = `checkbox-${index}`;
                            let optionHTML = '';
                            if (option.other) {
                                optionHTML = `
                                    <div class="form-check inw-radio-other ${isInline ? 'mb-0' : ''}">
                                        <input class="form-check-input" type="checkbox" value="${option.value}" id="${optionId}" ${isRequired ? 'required' : ''}>
                                        <label class="form-check-label" for="${optionId}">
                                            ${option.label}
                                        </label>
                                        <input type="text" class="form-control form-control-sm d-none d-inline" maxlength="200" style="width:200px; min-height: 25px !important; max-height: 10px;" data-for="${optionId}" placeholder="Descreva...">
                                    </div>
                                `;
                            } else {
                                optionHTML = `
                                    <div class="form-check ${isInline ? 'mb-0' : ''}">
                                        <input class="form-check-input" type="checkbox" value="${option.value}" id="${optionId}" ${isRequired ? 'required' : ''}>
                                        <label class="form-check-label" for="${optionId}">
                                            ${option.label}
                                        </label>
                                    </div>
                                `;
                            }
                            $container.append(optionHTML);
                        });

                        if (window.updateRequiredIndicator) {
                            window.updateRequiredIndicator($component, isRequired);
                        }

                        // Mostrar/ocultar input de "Outros" ao marcar/desmarcar
                        $component.off('change.inwCheckboxOther').on('change.inwCheckboxOther', 'input.form-check-input[type="checkbox"]', function() {
                            const id = $(this).attr('id');
                            const $txt = $component.find(`.inw-radio-other input[type="text"][data-for="${id}"]`);
                            if ($txt.length) {
                                $txt.toggleClass('d-none', !$(this).prop('checked'));
                            }
                        });

                        updateJSONOutput();
                        addDebugMessage(`✏️ Grupo checkbox atualizado: "${newLabel}" com ${newOptions.length} opções ${isInline ? '(inline)' : '(bloco)'}`);
                        
                        return true;
                    },
                    null,
                    function() {
                        // didOpen - configurar eventos dinâmicos
                        $('#checkbox-options-container').on('click', '.remove-option', function() {
                            if ($('#checkbox-options-container .option-row').length > 1) {
                                $(this).closest('.option-row').remove();
                            }
                        });
                        
                        $('#add-checkbox-option').on('click', function() {
                            const index = $('#checkbox-options-container .option-row').length;
                            const newOptionHTML = `
                                <div class="input-group mb-2 option-row" data-index="${index}">
                                    <input type="hidden" class="option-value" value="${generateUniqueValue()}">
                                    <input type="text" class="form-control option-label" placeholder="Descrição" required>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-option">×</button>
                                </div>
                            `;
                            $('#checkbox-options-container').append(newOptionHTML);
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
                    const checked = Array.isArray(componentData.value) && 
                                  componentData.value.includes(option.value) ? 'checked' : '';
                    const optionId = `render_checkbox_${renderName}_${index}`;
                    if (option.other) {
                        const otherText = option.otherValue || '';
                        optionsHTML += `
                            <div class="form-check inw-radio-other ${checkClass}">
                                <input class="form-check-input" 
                                       type="checkbox" 
                                       name="${groupName}[]"
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
                                       type="checkbox" 
                                       name="${groupName}[]"
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
                        ${componentData.label || 'Opções Checkbox'}
                        ${componentData.required ? '<span class="required-asterisk">*</span>' : ''}
                    </label>
                    <div class="${containerClass}">${optionsHTML}</div>
                </div>
            `);
            
            $container.append($field);

            // Toggle do campo "Outros" no uso (render)
            if (!readOnly) {
                const $scope = $field;
                $scope.off('change.inwCheckboxOther').on('change.inwCheckboxOther', `input[type="checkbox"][name="${groupName}[]"]`, function(){
                    const id = $(this).attr('id');
                    const $txt = $scope.find(`.inw-radio-other input[type="text"][data-for="${id}"]`);
                    if ($txt.length) {
                        $txt.toggleClass('d-none', !$(this).prop('checked'));
                    }
                });
            }
            return $field;
        },

        getData: function($element) {
            const checkedValues = [];
            const options = [];
            let groupName = '';
            
            // Verificar se está inline
            const isInline = $element.find('.form-check').parent().hasClass('d-flex');
            
            $element.find('.form-check').each(function() {
                const $input = $(this).find('input');
                const $label = $(this).find('label');
                const isOther = $(this).hasClass('inw-radio-other');
                const $otherText = isOther ? $(this).find('input[type="text"]') : null;
                
                if ($input.prop('checked')) {
                    checkedValues.push($input.attr('value'));
                }
                
                const opt = {
                    value: $input.attr('value'),
                    label: ($label.text() || '').trim().replace(/\s+/g, ' '),
                    other: !!isOther
                };
                if (isOther && $otherText && $otherText.length) {
                    // Guarda otherValue somente quando a opção "Outros" estiver marcada
                    opt.otherValue = $input.prop('checked') ? ($otherText.val() || '') : '';
                }
                options.push(opt);
                
                groupName = $input.attr('name').replace('[]', '').replace('render_', '');
            });
            
            return {
                label: $element.find('.form-label').text().replace(' *', '').trim(),
                value: checkedValues,
                name: groupName,
                required: $element.find('input[type="checkbox"]').first().prop('required'),
                inline: isInline,
                options: options
            };
        }
    };

})();