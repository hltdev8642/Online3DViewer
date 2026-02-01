import { AddDiv } from '../engine/viewer/domutils.js';
import { Loc } from '../engine/core/localization.js';

export class SelectionTools
{
    constructor (viewer, navigator)
    {
        this.viewer = viewer;
        this.navigator = navigator;
        this.selectionMode = 'single'; // 'single', 'box', 'lasso', 'all_visible'
    }

    SetSelectionMode (mode)
    {
        this.selectionMode = mode;
    }

    GetSelectionMode ()
    {
        return this.selectionMode;
    }

    SelectAll ()
    {
        if (!this.navigator) {
            return;
        }

        // Select all visible meshes
        let selectedCount = 0;
        this.navigator.EnumerateMeshes ((meshId) => {
            this.navigator.SetMeshVisibility (meshId, true);
            selectedCount++;
        });

        return selectedCount;
    }

    DeselectAll ()
    {
        if (!this.navigator) {
            return;
        }

        // Deselect all meshes
        let deselectedCount = 0;
        this.navigator.EnumerateMeshes ((meshId) => {
            this.navigator.SetMeshVisibility (meshId, false);
            deselectedCount++;
        });

        return deselectedCount;
    }

    InvertSelection ()
    {
        if (!this.navigator) {
            return;
        }

        // Invert selection state
        let invertedCount = 0;
        this.navigator.EnumerateMeshes ((meshId) => {
            let isVisible = this.navigator.IsMeshVisible (meshId);
            this.navigator.SetMeshVisibility (meshId, !isVisible);
            invertedCount++;
        });

        return invertedCount;
    }

    SelectByMaterial (materialIndex)
    {
        if (!this.navigator || !this.viewer) {
            return 0;
        }

        // Select all meshes using a specific material
        let selectedCount = 0;
        const model = this.viewer.GetModel ();
        if (!model) {
            return 0;
        }

        model.EnumerateMeshInstances ((meshInstance) => {
            const mesh = model.GetMesh (meshInstance.meshIndex);
            let usesMaterial = false;

            mesh.EnumerateTriangleIndices ((triIndex) => {
                const triangle = mesh.GetTriangle (triIndex);
                if (triangle.mat === materialIndex) {
                    usesMaterial = true;
                }
            });

            if (usesMaterial) {
                this.navigator.SetMeshVisibility (meshInstance.id, true);
                selectedCount++;
            }
        });

        return selectedCount;
    }

    IsolateMesh (meshId)
    {
        // Hide all meshes except the specified one
        this.navigator.EnumerateMeshes ((id) => {
            this.navigator.SetMeshVisibility (id, id.IsEqual (meshId));
        });
    }

    FocusOnSelected ()
    {
        if (!this.viewer) {
            return;
        }

        // Fit camera to show currently visible meshes
        this.viewer.FitToWindow ((meshUserData) => {
            return this.navigator.IsMeshVisible (meshUserData.originalMeshInstanceId);
        }, false);
    }
}

export function ShowSelectionToolsMenu (viewer, navigator, position)
{
    const menu = document.createElement ('div');
    menu.classList.add ('ov_selection_menu');
    menu.style.position = 'absolute';
    menu.style.left = position.x + 'px';
    menu.style.top = position.y + 'px';
    menu.style.background = 'white';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '3px';
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    menu.style.zIndex = '10000';
    menu.style.minWidth = '180px';

    const selectionTools = new SelectionTools (viewer, navigator);

    const options = [
        {
            label: Loc ('Select All'),
            action: () => {
                selectionTools.SelectAll ();
                viewer.Render ();
            }
        },
        {
            label: Loc ('Deselect All'),
            action: () => {
                selectionTools.DeselectAll ();
                viewer.Render ();
            }
        },
        {
            label: Loc ('Invert Selection'),
            action: () => {
                selectionTools.InvertSelection ();
                viewer.Render ();
            }
        },
        {
            label: Loc ('Focus on Selected'),
            action: () => {
                selectionTools.FocusOnSelected ();
            }
        }
    ];

    options.forEach ((option) => {
        const item = document.createElement ('div');
        item.textContent = option.label;
        item.style.padding = '8px 15px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '13px';
        item.style.borderBottom = '1px solid #eee';

        item.addEventListener ('mouseenter', () => {
            item.style.backgroundColor = '#f0f0f0';
        });

        item.addEventListener ('mouseleave', () => {
            item.style.backgroundColor = 'white';
        });

        item.addEventListener ('click', () => {
            option.action ();
            document.body.removeChild (menu);
        });

        menu.appendChild (item);
    });

    // Close menu on outside click
    const closeHandler = (ev) => {
        if (!menu.contains (ev.target)) {
            document.body.removeChild (menu);
            document.removeEventListener ('click', closeHandler);
        }
    };

    setTimeout (() => {
        document.addEventListener ('click', closeHandler);
    }, 100);

    document.body.appendChild (menu);

    return selectionTools;
}
