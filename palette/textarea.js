(function() {
    'use strict';

    if (!window.INW_PALETTE) {
        window.INW_PALETTE = {};
    }

    window.INW_PALETTE['textarea'] = {
        type: 'textarea',
        label: 'Área Texto',
        icon: '📄',
        btnClass: 'btn-outline-success',
        includeInPalette: true
    };

    if (!window.INW_COMPONENTS) {
        window.INW_COMPONENTS = {};
    }

    window.INW_COMPONENTS['textarea'] = {
        type: 'textarea',
        label: 'Área Texto',
        icon: '📄',
        html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Área Texto</label>
                <textarea spellcheck="true" class="form-control form-control-sm" rows="3" placeholder="Digite aqui..."></textarea>
            </div>
        `,
        isContainer: false,
        allowedIn: ['col'],
        
        editComponent: function($component, updateJSONOutput, addDebugMessage) {
            // Obter valores atuais
            const currentLabel = $component.find('label').text();
            const currentPlaceholder = $component.find('textarea').attr('placeholder') || '';
            const currentRows = $component.find('textarea').attr('rows') || '3';
            const currentMaxlength = $component.find('textarea').attr('maxlength') || '100';
            const currentClass = $component.find('textarea').attr('class') || '';
            const currentSpellcheck =  $component.find('textarea').attr('spellcheck') === 'true';
            const isRequired = $component.find('textarea').prop('required');
            
            // Criar HTML do formulário
            const formHTML = `
                <form id="textarea-edit-form">
                    <div class="mb-3">
                        <label for="textarea-label" class="form-label">Label:</label>
                        <input type="text" class="form-control form-control-sm" id="textarea-label" value="${currentLabel.replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="mb-3">
                        <label for="textarea-placeholder" class="form-label">Placeholder:</label>
                        <input type="text" class="form-control form-control-sm" id="textarea-placeholder" value="${currentPlaceholder.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="textarea-rows" class="form-label">Número de Linhas:</label>
                            <input type="number" class="form-control form-control-sm" id="textarea-rows" value="${currentRows}" min="1" max="10">
                        </div>
                        <div class="col">
                            <label for="textarea-maxlength" class="form-label">Tamanho máximo:</label>
                            <input type="number" class="form-control form-control-sm" id="textarea-maxlength" value="${currentMaxlength}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="textarea-class" class="form-label">Classe CSS:</label>
                        <input type="text" class="form-control form-control-sm" id="textarea-class" value="${currentClass.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="textarea-spellcheck" ${currentSpellcheck ? 'checked' : ''}>
                        <label class="form-check-label" for="textarea-spellcheck">
                            Ativar Corretor Ortográfico
                        </label>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="textarea-required" ${isRequired ? 'checked' : ''}>
                        <label class="form-check-label" for="textarea-required">
                            Campo obrigatório
                        </label>
                    </div>
                </form>
            `;
            
            // Usar SweetAlert2 para mostrar o modal
            if (window.INW_SHOW_EDIT_MODAL) {
                window.INW_SHOW_EDIT_MODAL(
                    'Editar Área Texto',
                    formHTML,
                    function() {
                        const newLabel = $('#textarea-label').val().trim();
                        const newPlaceholder = $('#textarea-placeholder').val().trim();
                        const newRows = $('#textarea-rows').val();
                        const isRequired = $('#textarea-required').prop('checked');
                        const maxLength = $('#textarea-maxlength').val() || '100';
                        const newClass = $('#textarea-class').val().trim();
                        const isSpellcheck = $('#textarea-spellcheck').prop('checked');

                        if (!newLabel) {
                            Swal.showValidationMessage('Label é obrigatório!');
                            return false;
                        }
                        
                        // Atualizar componente
                        $component.find('label').text(newLabel);
                        const $textarea = $component.find('textarea')
                            .attr('placeholder', newPlaceholder)
                            .attr('rows', newRows)
                            .prop('required', isRequired)
                            .attr('class', newClass)
                            .attr('maxlength', maxLength)
                            .prop('spellcheck', isSpellcheck);
                        
                        // Atualizar asterisco required
                        if (window.updateRequiredIndicator) {
                            window.updateRequiredIndicator($component, isRequired);
                        }
                        
                        // Atualizar JSON
                        updateJSONOutput();
                        
                        // Log
                        addDebugMessage(`✏️ Área texto atualizada: "${newLabel}" (${newRows} linhas)`);
                        
                        return true;
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
            const maxLength = attrs.maxlength ? ` maxlength="${attrs.maxlength}"` : '';
            
            const $field = $(`
                <div class="form-field">
                    <label class="form-label" for="render_${renderId}">
                        ${componentData.label || 'Área Texto'}
                        ${componentData.required ? '<span class="required-asterisk">*</span>' : ''}
                    </label>
                    <textarea class="form-control${cssClass}" 
                              id="render_${renderId}"
                              name="render_${renderName}"
                              rows="${attrs.rows || '3'}"${maxLength}
                              placeholder="${componentData.placeholder || ''}"
                              ${componentData.required ? 'required' : ''}
                              ${readOnly ? 'readonly' : ''}>${componentData.value || ''}</textarea>
                </div>
            `);
            
            $container.append($field);
            return $field;
        },

        getData: function($element) {
            const $textarea = $element.find('textarea');
            const attrs = {
                rows: $textarea.attr('rows') || undefined,
                maxlength: $textarea.attr('maxlength') || undefined,
                class: ($textarea.attr('class') || '').replace(/^form-control\s?/, '')
            };
            Object.keys(attrs).forEach(k => attrs[k] === undefined && delete attrs[k]);
            return {
                label: $element.find('label').text().replace(' *', '').trim(),
                value: $textarea.val(),
                name: ($textarea.attr('name') || '').replace('render_', ''),
                required: $textarea.prop('required'),
                placeholder: $textarea.attr('placeholder') || '',
                attributes: attrs
            };
        }
    };

})();