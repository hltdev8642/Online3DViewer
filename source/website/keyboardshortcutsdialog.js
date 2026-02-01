import { AddDiv, AddDomElement } from '../engine/viewer/domutils.js';
import { PopupDialog } from './dialog.js';
import { CalculatePopupPositionToScreen } from './dialogs.js';
import { Loc } from '../engine/core/localization.js';

export class KeyboardShortcutsDialog extends PopupDialog
{
    constructor ()
    {
        super ();
    }

    ShowDialog ()
    {
        let contentDiv = super.Init (() => {
            return CalculatePopupPositionToScreen (0.5, 0.5, contentDiv.offsetWidth, contentDiv.offsetHeight);
        });

        let titleDiv = AddDiv (contentDiv, 'ov_dialog_title', Loc ('Keyboard Shortcuts'));
        let closeButton = AddDiv (titleDiv, 'ov_dialog_close');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener ('click', () => {
            this.Close ();
        });

        let shortcutsDiv = AddDiv (contentDiv, 'ov_dialog_content ov_dialog_content_padded');

        const shortcuts = [
            { category: Loc ('Navigation'), items: [
                { keys: ['Mouse Drag'], description: Loc ('Rotate model') },
                { keys: ['Mouse Scroll'], description: Loc ('Zoom in/out') },
                { keys: ['Right Click + Drag'], description: Loc ('Pan model') },
                { keys: ['F'], description: Loc ('Fit model to window') }
            ]},
            { category: Loc ('View Controls'), items: [
                { keys: ['F11'], description: Loc ('Toggle fullscreen') },
                { keys: ['Esc'], description: Loc ('Close dialogs') },
                { keys: ['Y'], description: Loc ('Set Y axis as up vector') },
                { keys: ['Z'], description: Loc ('Set Z axis as up vector') }
            ]},
            { category: Loc ('Tools'), items: [
                { keys: ['M'], description: Loc ('Measurement tools') },
                { keys: ['P'], description: Loc ('Toggle performance monitor') },
                { keys: ['Ctrl', 'S'], description: Loc ('Take screenshot') },
                { keys: ['E'], description: Loc ('Environment settings') },
                { keys: ['?'], description: Loc ('Show this help') }
            ]}
        ];

        for (let section of shortcuts) {
            AddDiv (shortcutsDiv, 'ov_shortcuts_section_title', section.category);

            for (let shortcut of section.items) {
                let rowDiv = AddDiv (shortcutsDiv, 'ov_shortcuts_row');
                let keysDiv = AddDiv (rowDiv, 'ov_shortcuts_keys');

                for (let i = 0; i < shortcut.keys.length; i++) {
                    AddDiv (keysDiv, 'ov_shortcuts_key', shortcut.keys[i]);
                    if (i < shortcut.keys.length - 1) {
                        AddDiv (keysDiv, 'ov_shortcuts_plus', '+');
                    }
                }

                AddDiv (rowDiv, 'ov_shortcuts_description', shortcut.description);
            }
        }

        contentDiv.classList.add ('ov_dialog');
        contentDiv.classList.add ('ov_shortcuts_dialog');
        this.Open ();
    }
}

export function ShowKeyboardShortcutsDialog ()
{
    let dialog = new KeyboardShortcutsDialog ();
    dialog.ShowDialog ();
}
