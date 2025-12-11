(function() {
    'use strict';

    if (!window.INW_PALETTE) {
        window.INW_PALETTE = {};
    }

    window.INW_PALETTE['input'] = {
        type: 'input',
        label: 'Campo Texto',
        icon: '📝',
        btnClass: 'btn-outline-success',
        includeInPalette: true
    };

    if (!window.INW_COMPONENTS) {
        window.INW_COMPONENTS = {};
    }

    window.INW_COMPONENTS['input'] = {
        type: 'input',
        label: 'Campo Texto',
        icon: '📝',
        html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Campo Texto</label>
                <input spellcheck="true" maxlength="100" type="text" class="form-control form-control-sm" placeholder="Digite aqui...">
            </div>
        `,
        isContainer: false,
        allowedIn: ['col'],
        
        editComponent: function($component, updateJSONOutput, addDebugMessage) {
            // Obter valores atuais
            const currentLabel = $component.find('label').text();
            const currentPlaceholder = $component.find('input').attr('placeholder') || '';
            const currentClass = $component.find('input').attr('class') || '';
            const currentMaxlength = $component.find('input').attr('maxlength') || '100';
            const currentSpellcheck =  $component.find('input').attr('spellcheck') === 'true';
            const currentType = $component.find('input').attr('type') || 'text';
            const isRequired = $component.find('input').prop('required');
            
            // Criar HTML do formulário
            const formHTML = `
                <form id="input-edit-form">
                    <div class="mb-3">
                        <label for="input-label" class="form-label">Label:</label>
                        <input type="text" class="form-control form-control-sm" id="input-label" value="${currentLabel.replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="mb-3">
                        <label for="input-placeholder" class="form-label">Placeholder:</label>
                        <input type="text" class="form-control form-control-sm" id="input-placeholder" value="${currentPlaceholder.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="input-type" class="form-label">Tipo:</label>
                            <select class="form-control form-control-sm" id="input-type">
                                <option value="text" ${currentType === 'text' ? 'selected' : ''}>Texto</option>
                                <option value="email" ${currentType === 'email' ? 'selected' : ''}>Email</option>
                                <option value="password" ${currentType === 'password' ? 'selected' : ''}>Senha</option>
                                <option value="number" ${currentType === 'number' ? 'selected' : ''}>Número</option>
                                <option value="tel" ${currentType === 'tel' ? 'selected' : ''}>Telefone</option>
                                <option value="url" ${currentType === 'url' ? 'selected' : ''}>URL</option>
                                <option value="date" ${currentType === 'date' ? 'selected' : ''}>Data</option>
                            </select>
                        </div>
                        <div class="col">
                            <label for="input-maxlength" class="form-label">Tamanho máximo:</label>
                            <input type="number" class="form-control form-control-sm" id="input-maxlength" value="${currentMaxlength}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="input-class" class="form-label">Classe CSS:</label>
                        <input type="text" class="form-control form-control-sm" id="input-class" value="${currentClass.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="input-spellcheck" ${currentSpellcheck ? 'checked' : ''}>
                        <label class="form-check-label" for="input-spellcheck">
                            Ativar Corretor Ortográfico
                        </label>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="input-required" ${isRequired ? 'checked' : ''}>
                        <label class="form-check-label" for="input-required">
                            Campo obrigatório
                        </label>
                    </div>
                </form>
            `;
            
            // Usar SweetAlert2 para mostrar o modal
            if (window.INW_SHOW_EDIT_MODAL) {
                window.INW_SHOW_EDIT_MODAL(
                    'Editar Campo Texto',
                    formHTML,
                    function() {
                        const newLabel = $('#input-label').val().trim();
                        const newPlaceholder = $('#input-placeholder').val().trim();
                        const newClass = $('#input-class').val().trim();
                        const newType = $('#input-type').val();
                        const isRequired = $('#input-required').prop('checked');
                        const maxLength = $('#input-maxlength').val() || '100';
                        const isSpellcheck = $('#input-spellcheck').prop('checked');
                        
                        if (!newLabel) {
                            Swal.showValidationMessage('Label é obrigatório!');
                            return false;
                        }
                        
                        // Atualizar componente
                        $component.find('label').text(newLabel);
                        const $input = $component.find('input')
                            .attr('placeholder', newPlaceholder)
                            .attr('type', newType)
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
                        addDebugMessage(`✏️ Campo texto atualizado: "${newLabel}" (${newType})`);
                        
                        return true;
                    }
                );
            } else {
                // Fallback se SweetAlert2 não estiver disponível
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
            const type = attrs.type || 'text';
            const cssClass = attrs.class ? ` ${attrs.class}` : '';
            const maxLength = attrs.maxlength ? ` maxlength="${attrs.maxlength}"` : '';
            const min = attrs.min ? ` min="${attrs.min}"` : '';
            const max = attrs.max ? ` max="${attrs.max}"` : '';
            const step = attrs.step ? ` step="${attrs.step}"` : '';
            const pattern = attrs.pattern ? ` pattern="${attrs.pattern}"` : '';
            
            const $field = $(`
                <div class="form-field">
                    <label class="form-label" for="render_${renderId}">
                        ${componentData.label || 'Campo Texto'}
                        ${componentData.required ? '<span class="required-asterisk">*</span>' : ''}
                    </label>
                    <input type="${type}" 
                           class="form-control${cssClass}"
                           name="render_${renderName}"
                           id="render_${renderId}"
                           placeholder="${componentData.placeholder || ''}"
                           value="${componentData.value || ''}"${maxLength}${min}${max}${step}${pattern}
                           ${componentData.required ? 'required' : ''}
                           ${readOnly ? 'readonly' : ''}>
                </div>
            `);
            
            $container.append($field);
            return $field;
        },

        getData: function($element) {
            const $input = $element.find('input');
            const attrs = {
                type: $input.attr('type'),
                class: ($input.attr('class') || '').replace(/^form-control\s?/, ''),
                maxlength: $input.attr('maxlength') || undefined,
                min: $input.attr('min') || undefined,
                max: $input.attr('max') || undefined,
                step: $input.attr('step') || undefined,
                pattern: $input.attr('pattern') || undefined
            };
            Object.keys(attrs).forEach(k => attrs[k] === undefined && delete attrs[k]);
            return {
                label: $element.find('label').text().replace(' *', '').trim(),
                value: $input.val(),
                name: ($input.attr('name') || '').replace('render_', ''),
                required: $input.prop('required'),
                placeholder: $input.attr('placeholder') || '',
                attributes: attrs
            };
        }
    };

})();