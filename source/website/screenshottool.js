import { AddDiv } from '../engine/viewer/domutils.js';
import { Loc } from '../engine/core/localization.js';
import { ButtonDialog } from './dialog.js';

export function TakeScreenshot (viewer, canvas, filename)
{
    filename = filename || 'screenshot.png';

    try {
        // Get the canvas data URL
        const dataUrl = canvas.toDataURL ('image/png');

        // Create a temporary link and trigger download
        const link = document.createElement ('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild (link);
        link.click ();
        document.body.removeChild (link);

        return true;
    } catch (error) {
        console.error ('Screenshot failed:', error);
        return false;
    }
}

export function ShowScreenshotDialog (viewer, canvas)
{
    let dialog = new ButtonDialog ();
    contentDiv.classList.add ('ov_screenshot_dialog');

    // Title
    AddDiv (contentDiv, 'ov_dialog_section ov_dialog_title', Loc ('Take Screenshot'));

    // Settings section
    let settingsDiv = AddDiv (contentDiv, 'ov_dialog_section');

    // Filename input
    let filenameDiv = AddDiv (settingsDiv, 'ov_dialog_row');
    AddDiv (filenameDiv, 'ov_dialog_row_name', Loc ('Filename') + ':');
    let filenameInput = document.createElement ('input');
    filenameInput.type = 'text';
    filenameInput.value = 'screenshot';
    filenameInput.classList.add ('ov_dialog_input');
    filenameDiv.appendChild (filenameInput);

    // Resolution options
    let resolutionDiv = AddDiv (settingsDiv, 'ov_dialog_row');
    AddDiv (resolutionDiv, 'ov_dialog_row_name', Loc ('Resolution') + ':');
    let resolutionSelect = document.createElement ('select');
    resolutionSelect.classList.add ('ov_dialog_select');

    const resolutions = [
        { label: Loc ('Current (') + canvas.width + 'x' + canvas.height + ')', width: canvas.width, height: canvas.height },
        { label: '1920x1080 (Full HD)', width: 1920, height: 1080 },
        { label: '2560x1440 (2K)', width: 2560, height: 1440 },
        { label: '3840x2160 (4K)', width: 3840, height: 2160 }
    ];

    resolutions.forEach ((res, index) => {
        let option = document.createElement ('option');
        option.value = index;
        option.text = res.label;
        resolutionSelect.appendChild (option);
    });

    resolutionDiv.appendChild (resolutionSelect);

    // Transparent background option
    let bgDiv = AddDiv (settingsDiv, 'ov_dialog_row');
    let bgCheckbox = document.createElement ('input');
    bgCheckbox.type = 'checkbox';
    bgCheckbox.id = 'screenshot_transparent_bg';
    bgDiv.appendChild (bgCheckbox);
    let bgLabel = document.createElement ('label');
    bgLabel.htmlFor = 'screenshot_transparent_bg';
    bgLabel.innerHTML = Loc ('Transparent Background');
    bgDiv.appendChild (bgLabel);

    // Preview section
    let previewDiv = AddDiv (contentDiv, 'ov_dialog_section');
    AddDiv (previewDiv, 'ov_dialog_section_title', Loc ('Preview'));
    let previewImg = document.createElement ('img');
    previewImg.classList.add ('ov_screenshot_preview');
    previewDiv.appendChild (previewImg);

    // Update preview function
    function UpdatePreview () {
        try {
            const selectedRes = resolutions[resolutionSelect.value];
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;

            // For now, use current resolution (full implementation would render at different resolution)
            const dataUrl = canvas.toDataURL ('image/png');
            previewImg.src = dataUrl;
        } catch (error) {
            console.error ('Preview update failed:', error);
        }
    }

    // Update preview on changes
    resolutionSelect.addEventListener ('change', UpdatePreview);
    bgCheckbox.addEventListener ('change', UpdatePreview);

    // Initial preview
    UpdatePreview ();

    // Buttons
    let buttonsDiv = dialog.GetButtonsDiv ();

    dialog.AddButton (Loc ('Cancel'), () => {
        dialog.Close ();
    });

    dialog.AddButton (Loc ('Download'), () => {
        let filename = filenameInput.value.trim ();
        if (filename.length === 0) {
            filename = 'screenshot';
        }
        if (!filename.endsWith ('.png')) {
            filename += '.png';
        }

        const success = TakeScreenshot (viewer, canvas, filename);
        if (success) {
            dialog.Close ();
        } else {
            alert (Loc ('Failed to take screenshot. Please try again.'));
        }
    });

    dialog.Open ();
    filenameInput.focus ();
}
