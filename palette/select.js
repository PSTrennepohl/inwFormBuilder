(function() {
    'use strict';

    if (!window.INW_PALETTE) {
        window.INW_PALETTE = {};
    }

    window.INW_PALETTE['select'] = {
        type: 'select',
        label: 'Lista',
        icon: '📋',
        btnClass: 'btn-outline-success',
        includeInPalette: true
    };

    if (!window.INW_COMPONENTS) {
        window.INW_COMPONENTS = {};
    }

    function generateUniqueValue() {
        return 'opt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    window.INW_COMPONENTS['select'] = {
        type: 'select',
        label: 'Lista',
        icon: '📋',
        html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Lista</label>
                <select class="form-control form-control-sm form-select">
                    <option value="">Selecione uma opção</option>
                    <option value="${generateUniqueValue()}">Opção 1</option>
                    <option value="${generateUniqueValue()}">Opção 2</option>
                    <option value="${generateUniqueValue()}">Opção 3</option>
                </select>
            </div>
        `,
        isContainer: false,
        allowedIn: ['col'],
        
        editComponent: function($component, updateJSONOutput, addDebugMessage) {
            const currentLabel = $component.find('label').text().trim();
            const currentClass = $component.find('select').attr('class') || '';
            const $select = $component.find('select');
            const currentOptions = [];
            
            $select.find('option').each(function() {
                currentOptions.push({
                    value: $(this).attr('value') || '',
                    label: $(this).text().trim()
                });
            });
            
            const hasInformativeFirst = currentOptions[0] && currentOptions[0].value === '';
            const isRequired = $select.prop('required');
            
            // Criar HTML do formulário
            const formHTML = `
                <form id="select-edit-form">
                    <div class="mb-3">
                        <label for="select-label" class="form-label">Label:</label>
                        <input type="text" class="form-control form-control-sm" id="select-label" value="${currentLabel.replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="select-informative-first" ${hasInformativeFirst ? 'checked' : ''}>
                        <label class="form-check-label" for="select-informative-first">
                            Primeiro registro informativo
                        </label>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Opções:</label>
                        <div id="select-options-container">
                            ${currentOptions.map((option, index) => `
                                <div class="input-group mb-2 option-row" data-index="${index}">
                                    <input type="hidden" class="option-value" value="${option.value.replace(/"/g, '&quot;')}">
                                    <input type="text" class="form-control form-control-sm option-label" placeholder="Descrição" value="${option.label.replace(/"/g, '&quot;')}" required>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-option" ${index === 0 ? 'disabled' : ''}>×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary" id="add-option">+ Adicionar Opção</button>
                    </div>
                    <div class="mb-3">
                        <label for="select-class" class="form-label">Classe CSS:</label>
                        <input type="text" class="form-control form-control-sm" id="select-class" value="${currentClass.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="select-required" ${isRequired ? 'checked' : ''}>
                        <label class="form-check-label" for="select-required">
                            Campo obrigatório
                        </label>
                    </div>
                </form>
            `;
            
            // Usar SweetAlert2 para mostrar o modal
            if (window.INW_SHOW_EDIT_MODAL) {
                window.INW_SHOW_EDIT_MODAL(
                    'Editar Lista',
                    formHTML,
                    function() {
                        const newLabel = $('#select-label').val().trim();
                        const newClass = $('#select-class').val().trim();
                        const isRequired = $('#select-required').prop('checked');
                        const hasInformativeFirst = $('#select-informative-first').prop('checked');
                        
                        if (!newLabel) {
                            Swal.showValidationMessage('Label é obrigatório!');
                            return false;
                        }
                        
                        const newOptions = [];
                        $('#select-options-container .option-row').each(function(index) {
                            const $valueInput = $(this).find('.option-value');
                            const label = $(this).find('.option-label').val().trim();
                            
                            if (label) {
                                if (index === 0 && hasInformativeFirst) {
                                    $valueInput.val('');
                                    newOptions.push({ value: '', label: label });
                                } else {
                                    let value = $valueInput.val();
                                    if (!value || value === '') {
                                        value = generateUniqueValue();
                                        $valueInput.val(value);
                                    }
                                    newOptions.push({ value: value, label: label });
                                }
                            }
                        });
                        
                        if (newOptions.length === 0) {
                            Swal.showValidationMessage('É necessário pelo menos uma opção!');
                            return false;
                        }
                        
                        $component.find('label').text(newLabel);
                        $select.prop('required', isRequired)
                               .attr('class', newClass);
                        
                        $select.empty();
                        newOptions.forEach(option => {
                            $select.append(`<option value="${option.value}">${option.label}</option>`);
                        });
                        
                        if (window.updateRequiredIndicator) {
                            window.updateRequiredIndicator($component, isRequired);
                        }

                        updateJSONOutput();
                        addDebugMessage(`✏️ Lista atualizada: "${newLabel}" com ${newOptions.length} opções`);
                        
                        return true;
                    },
                    null,
                    function() {
                        // didOpen - configurar eventos dinâmicos
                        $('#select-options-container').on('click', '.remove-option', function() {
                            if ($('#select-options-container .option-row').length > 1) {
                                $(this).closest('.option-row').remove();
                            }
                        });
                        
                        $('#add-option').on('click', function() {
                            const index = $('#select-options-container .option-row').length;
                            const newOptionHTML = `
                                <div class="input-group mb-2 option-row" data-index="${index}">
                                    <input type="hidden" class="option-value" value="${generateUniqueValue()}">
                                    <input type="text" class="form-control form-control-sm option-label" placeholder="Descrição" required>
                                    <button type="button" class="btn btn-sm btn-outline-danger remove-option">×</button>
                                </div>
                            `;
                            $('#select-options-container').append(newOptionHTML);
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
            const attrs = componentData.attributes || {};
            const cssClass = attrs.class ? ` ${attrs.class}` : '';
            
            let optionsHTML = '';
            
            if (componentData.options) {
                componentData.options.forEach(option => {
                    const selected = option.value === componentData.value ? 'selected' : '';
                    optionsHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                });
            }
            
            const $field = $(`
                <div class="form-field">
                    <label class="form-label" for="render_${renderId}">
                        ${componentData.label || 'Lista'}
                        ${componentData.required ? '<span class="required-asterisk">*</span>' : ''}
                    </label>
                    <select class="form-select${cssClass}" 
                            id="render_${renderId}"
                            name="render_${renderName}"
                            ${componentData.required ? 'required' : ''}
                            ${readOnly ? 'disabled' : ''}>
                        ${optionsHTML}
                    </select>
                </div>
            `);
            
            $container.append($field);
            return $field;
        },

        getData: function($element) {
            const $select = $element.find('select');
            const options = [];
            
            $select.find('option').each(function() {
                options.push({
                    value: $(this).attr('value'),
                    label: $(this).text()
                });
            });
            
            return {
                label: $element.find('label').text().replace(' *', '').trim(),
                value: $select.val(),
                name: ($select.attr('name') || '').replace('render_', ''),
                required: $select.prop('required'),
                attributes: {
                    class: ($select.attr('class') || '').replace(/^form-select\s?/, '')
                },
                options: options
            };
        }
    };
})();