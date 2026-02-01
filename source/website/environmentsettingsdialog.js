import { AddDiv } from '../engine/viewer/domutils.js';
import { Loc } from '../engine/core/localization.js';
import { ButtonDialog } from './dialog.js';
import { RGBColor } from '../engine/model/color.js';

export function ShowEnvironmentSettingsDialog (viewer, settings, callbacks)
{
    let dialog = new ButtonDialog ();
    contentDiv.classList.add ('ov_environment_settings_dialog');

    // Title
    AddDiv (contentDiv, 'ov_dialog_section ov_dialog_title', Loc ('Environment Settings'));

    // Background Section
    let backgroundSection = AddDiv (contentDiv, 'ov_dialog_section');
    AddDiv (backgroundSection, 'ov_dialog_section_title', Loc ('Background'));

    // Background color
    let bgColorDiv = AddDiv (backgroundSection, 'ov_dialog_row');
    AddDiv (bgColorDiv, 'ov_dialog_row_name', Loc ('Background Color') + ':');

    let bgColorPicker = document.createElement ('input');
    bgColorPicker.type = 'color';
    bgColorPicker.classList.add ('ov_dialog_color_input');
    const currentBgColor = settings.backgroundColor;
    bgColorPicker.value = '#' +
        currentBgColor.r.toString (16).padStart (2, '0') +
        currentBgColor.g.toString (16).padStart (2, '0') +
        currentBgColor.b.toString (16).padStart (2, '0');
    bgColorDiv.appendChild (bgColorPicker);

    // Background type (solid/gradient)
    let bgTypeDiv = AddDiv (backgroundSection, 'ov_dialog_row');
    AddDiv (bgTypeDiv, 'ov_dialog_row_name', Loc ('Background Type') + ':');
    let bgTypeSelect = document.createElement ('select');
    bgTypeSelect.classList.add ('ov_dialog_select');

    ['Solid Color', 'Gradient', 'Environment Map'].forEach ((type, index) => {
        let option = document.createElement ('option');
        option.value = index;
        option.text = Loc (type);
        bgTypeSelect.appendChild (option);
    });
    bgTypeDiv.appendChild (bgTypeSelect);

    // Lighting Section
    let lightingSection = AddDiv (contentDiv, 'ov_dialog_section');
    AddDiv (lightingSection, 'ov_dialog_section_title', Loc ('Lighting'));

    // Ambient light intensity
    let ambientDiv = AddDiv (lightingSection, 'ov_dialog_row');
    AddDiv (ambientDiv, 'ov_dialog_row_name', Loc ('Ambient Light') + ':');
    let ambientSlider = document.createElement ('input');
    ambientSlider.type = 'range';
    ambientSlider.min = '0';
    ambientSlider.max = '100';
    ambientSlider.value = '50';
    ambientSlider.classList.add ('ov_dialog_slider');
    ambientDiv.appendChild (ambientSlider);
    let ambientValue = AddDiv (ambientDiv, 'ov_dialog_slider_value');
    ambientValue.textContent = '50%';

    ambientSlider.addEventListener ('input', () => {
        ambientValue.textContent = ambientSlider.value + '%';
    });

    // Directional light intensity
    let directionalDiv = AddDiv (lightingSection, 'ov_dialog_row');
    AddDiv (directionalDiv, 'ov_dialog_row_name', Loc ('Directional Light') + ':');
    let directionalSlider = document.createElement ('input');
    directionalSlider.type = 'range';
    directionalSlider.min = '0';
    directionalSlider.max = '100';
    directionalSlider.value = '75';
    directionalSlider.classList.add ('ov_dialog_slider');
    directionalDiv.appendChild (directionalSlider);
    let directionalValue = AddDiv (directionalDiv, 'ov_dialog_slider_value');
    directionalValue.textContent = '75%';

    directionalSlider.addEventListener ('input', () => {
        directionalValue.textContent = directionalSlider.value + '%';
    });

    // Shadows
    let shadowsDiv = AddDiv (lightingSection, 'ov_dialog_row');
    let shadowsCheckbox = document.createElement ('input');
    shadowsCheckbox.type = 'checkbox';
    shadowsCheckbox.id = 'env_shadows';
    shadowsDiv.appendChild (shadowsCheckbox);
    let shadowsLabel = document.createElement ('label');
    shadowsLabel.htmlFor = 'env_shadows';
    shadowsLabel.innerHTML = Loc ('Enable Shadows');
    shadowsDiv.appendChild (shadowsLabel);

    // Environment Map Section
    let envMapSection = AddDiv (contentDiv, 'ov_dialog_section');
    AddDiv (envMapSection, 'ov_dialog_section_title', Loc ('Environment Map'));

    // Environment map intensity
    let envIntensityDiv = AddDiv (envMapSection, 'ov_dialog_row');
    AddDiv (envIntensityDiv, 'ov_dialog_row_name', Loc ('Intensity') + ':');
    let envIntensitySlider = document.createElement ('input');
    envIntensitySlider.type = 'range';
    envIntensitySlider.min = '0';
    envIntensitySlider.max = '100';
    envIntensitySlider.value = '100';
    envIntensitySlider.classList.add ('ov_dialog_slider');
    envIntensityDiv.appendChild (envIntensitySlider);
    let envIntensityValue = AddDiv (envIntensityDiv, 'ov_dialog_slider_value');
    envIntensityValue.textContent = '100%';

    envIntensitySlider.addEventListener ('input', () => {
        envIntensityValue.textContent = envIntensitySlider.value + '%';
    });

    // Rotation
    let rotationDiv = AddDiv (envMapSection, 'ov_dialog_row');
    AddDiv (rotationDiv, 'ov_dialog_row_name', Loc ('Rotation') + ':');
    let rotationSlider = document.createElement ('input');
    rotationSlider.type = 'range';
    rotationSlider.min = '0';
    rotationSlider.max = '360';
    rotationSlider.value = '0';
    rotationSlider.classList.add ('ov_dialog_slider');
    rotationDiv.appendChild (rotationSlider);
    let rotationValue = AddDiv (rotationDiv, 'ov_dialog_slider_value');
    rotationValue.textContent = '0°';

    rotationSlider.addEventListener ('input', () => {
        rotationValue.textContent = rotationSlider.value + '°';
    });

    // Preset Environments
    let presetsSection = AddDiv (contentDiv, 'ov_dialog_section');
    AddDiv (presetsSection, 'ov_dialog_section_title', Loc ('Presets'));

    let presetsContainer = AddDiv (presetsSection, 'ov_environment_presets');

    const presets = [
        { name: 'Studio', ambient: 40, directional: 80, bgColor: '#e0e0e0' },
        { name: 'Outdoor', ambient: 60, directional: 100, bgColor: '#87CEEB' },
        { name: 'Night', ambient: 20, directional: 30, bgColor: '#1a1a2e' },
        { name: 'Clean', ambient: 50, directional: 50, bgColor: '#ffffff' }
    ];

    presets.forEach ((preset) => {
        let presetBtn = document.createElement ('button');
        presetBtn.textContent = Loc (preset.name);
        presetBtn.classList.add ('ov_dialog_button', 'ov_preset_button');
        presetBtn.addEventListener ('click', () => {
            ambientSlider.value = preset.ambient;
            ambientValue.textContent = preset.ambient + '%';
            directionalSlider.value = preset.directional;
            directionalValue.textContent = preset.directional + '%';
            bgColorPicker.value = preset.bgColor;
        });
        presetsContainer.appendChild (presetBtn);
    });

    // Buttons
    let buttonsDiv = dialog.GetButtonsDiv ();

    dialog.AddButton (Loc ('Reset to Default'), () => {
        // Reset to default values
        bgColorPicker.value = '#ffffff';
        ambientSlider.value = '50';
        directionalSlider.value = '75';
        envIntensitySlider.value = '100';
        rotationSlider.value = '0';
        shadowsCheckbox.checked = false;
        bgTypeSelect.value = '0';

        ambientValue.textContent = '50%';
        directionalValue.textContent = '75%';
        envIntensityValue.textContent = '100%';
        rotationValue.textContent = '0°';
    });

    dialog.AddButton (Loc ('Cancel'), () => {
        dialog.Close ();
    });

    dialog.AddButton (Loc ('Apply'), () => {
        // Apply settings
        const hexColor = bgColorPicker.value;
        const r = parseInt (hexColor.substr (1, 2), 16);
        const g = parseInt (hexColor.substr (3, 2), 16);
        const b = parseInt (hexColor.substr (5, 2), 16);

        settings.backgroundColor = new RGBColor (r, g, b);

        if (callbacks && callbacks.onBackgroundColorChanged) {
            callbacks.onBackgroundColorChanged ();
        }

        // Apply other settings (ambient, directional light intensity, etc.)
        // This would require extending the viewer to support these settings

        dialog.Close ();
    });

    dialog.Open ();
}

export function CreateQuickEnvironmentPanel (viewer, settings, callbacks)
{
    const panel = document.createElement ('div');
    panel.classList.add ('ov_quick_environment_panel');
    panel.style.position = 'absolute';
    panel.style.top = '100px';
    panel.style.left = '10px';
    panel.style.background = 'rgba(40, 40, 40, 0.95)';
    panel.style.color = 'white';
    panel.style.padding = '15px';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = '1000';
    panel.style.minWidth = '200px';
    panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

    // Quick presets
    const title = document.createElement ('div');
    title.textContent = Loc ('Quick Presets');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    title.style.fontSize = '14px';
    panel.appendChild (title);

    const presets = [
        { name: '☀️ Studio', bg: '#e0e0e0' },
        { name: '🌤️ Outdoor', bg: '#87CEEB' },
        { name: '🌙 Night', bg: '#1a1a2e' },
        { name: '✨ Clean', bg: '#ffffff' },
        { name: '🎨 Custom...', action: 'dialog' }
    ];

    presets.forEach ((preset) => {
        const btn = document.createElement ('button');
        btn.textContent = preset.name;
        btn.style.display = 'block';
        btn.style.width = '100%';
        btn.style.marginBottom = '5px';
        btn.style.padding = '8px';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.background = '#555';
        btn.style.color = 'white';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';

        btn.addEventListener ('mouseenter', () => {
            btn.style.background = '#666';
        });

        btn.addEventListener ('mouseleave', () => {
            btn.style.background = '#555';
        });

        btn.addEventListener ('click', () => {
            if (preset.action === 'dialog') {
                ShowEnvironmentSettingsDialog (viewer, settings, callbacks);
            } else if (preset.bg) {
                const r = parseInt (preset.bg.substr (1, 2), 16);
                const g = parseInt (preset.bg.substr (3, 2), 16);
                const b = parseInt (preset.bg.substr (5, 2), 16);
                settings.backgroundColor = new RGBColor (r, g, b);

                if (callbacks && callbacks.onBackgroundColorChanged) {
                    callbacks.onBackgroundColorChanged ();
                }
            }
        });

        panel.appendChild (btn);
    });

    return panel;
}
