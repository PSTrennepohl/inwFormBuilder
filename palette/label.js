(function() {
    'use strict';

    if (!window.INW_PALETTE) {
        window.INW_PALETTE = {};
    }

    window.INW_PALETTE['label'] = {
        type: 'label',
        label: 'Rótulo',
        icon: '🏷️',
        btnClass: 'btn-outline-success',
        includeInPalette: true
    };

    if (!window.INW_COMPONENTS) {
        window.INW_COMPONENTS = {};
    }

    window.INW_COMPONENTS['label'] = {
        type: 'label',
        label: 'Rótulo',
        icon: '🏷️',
        html: `
            <div class="form-group mb-3 draggable-component">
                <label class="form-label">Texto do Rótulo</label>
            </div>
        `,
        isContainer: false,
        allowedIn: ['col'],
        
        editComponent: function($component, updateJSONOutput, addDebugMessage) {
            // Obter valores atuais
            const currentText = $component.find('label').text();
            const currentClass = $component.find('label').attr('class') || 'form-label';
            
            // Criar HTML do formulário
            const formHTML = `
                <form id="label-edit-form">
                    <div class="mb-3">
                        <label for="label-text" class="form-label">Texto do Rótulo:</label>
                        <textarea class="form-control" id="label-text" rows="3" required>${currentText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="label-class" class="form-label">Classe CSS:</label>
                        <select class="form-select" id="label-class">
                            <option value="form-label" ${currentClass === 'form-label' ? 'selected' : ''}>Normal</option>
                            <option value="form-label fw-bold" ${currentClass === 'form-label fw-bold' ? 'selected' : ''}>Negrito</option>
                            <option value="form-label h5" ${currentClass === 'form-label h5' ? 'selected' : ''}>Título Pequeno</option>
                            <option value="form-label h4" ${currentClass === 'form-label h4' ? 'selected' : ''}>Título Médio</option>
                            <option value="form-label h3" ${currentClass === 'form-label h3' ? 'selected' : ''}>Título Grande</option>
                            <option value="form-label text-muted" ${currentClass === 'form-label text-muted' ? 'selected' : ''}>Texto Secundário</option>
                            <option value="form-label text-primary" ${currentClass === 'form-label text-primary' ? 'selected' : ''}>Texto Primário</option>
                        </select>
                    </div>
                </form>
            `;
            
            // Usar SweetAlert2 para mostrar o modal
            if (window.INW_SHOW_EDIT_MODAL) {
                window.INW_SHOW_EDIT_MODAL(
                    'Editar Rótulo',
                    formHTML,
                    function() {
                        const newText = $('#label-text').val().trim();
                        const newClass = $('#label-class').val();
                        
                        if (!newText) {
                            Swal.showValidationMessage('Texto do rótulo é obrigatório!');
                            return false;
                        }
                        
                        // Atualizar componente
                        $component.find('label')
                            .text(newText)
                            .attr('class', newClass);
                        
                        // Atualizar JSON
                        updateJSONOutput();
                        
                        // Log
                        addDebugMessage(`✏️ Rótulo atualizado: "${newText.substring(0, 30)}${newText.length > 30 ? '...' : ''}"`);
                        
                        return true;
                    }
                );
            } else {
                console.warn('SweetAlert2 não está disponível');
            }
        },

        render: function(componentData, $container, readOnly, generateRenderId) {
            const $field = $(`
                <div class="form-field">
                    <label class="${componentData.attributes?.class || 'form-label'}">
                        ${componentData.label || 'Texto do Rótulo'}
                    </label>
                </div>
            `);
            
            $container.append($field);
            return $field;
        },

        getData: function($element) {
            return {
                label: $element.find('label').text(),
                attributes: {
                    class: $element.find('label').attr('class')
                }
            };
        }
    };
})();