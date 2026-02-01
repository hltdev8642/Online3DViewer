import { AddDiv, AddDomElement } from '../engine/viewer/domutils.js';
import { PopupDialog } from './dialog.js';
import { CalculatePopupPositionToScreen } from './dialogs.js';
import { Loc } from '../engine/core/localization.js';

function FormatBytes (bytes)
{
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor (Math.log (bytes) / Math.log (k));
    return Math.round (bytes / Math.pow (k, i) * 100) / 100 + ' ' + sizes[i];
}

function FormatNumber (num)
{
    return num.toLocaleString ();
}

export class ModelInfoDialog extends PopupDialog
{
    constructor ()
    {
        super ();
    }

    ShowDialog (model, viewer, importResult)
    {
        let contentDiv = super.Init (() => {
            return CalculatePopupPositionToScreen (0.5, 0.5, contentDiv.offsetWidth, contentDiv.offsetHeight);
        });

        let titleDiv = AddDiv (contentDiv, 'ov_dialog_title', Loc ('Model Information'));
        let closeButton = AddDiv (titleDiv, 'ov_dialog_close');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener ('click', () => {
            this.Close ();
        });

        let infoDiv = AddDiv (contentDiv, 'ov_dialog_content ov_dialog_content_padded');

        // File Information
        AddDiv (infoDiv, 'ov_model_info_section_title', Loc ('File Information'));
        this.AddInfoRow (infoDiv, Loc ('File Name'), importResult.mainFile || 'Unknown');
        if (importResult.fileList && importResult.fileList.length > 0) {
            let totalSize = 0;
            for (let file of importResult.fileList) {
                if (file.content && file.content.byteLength) {
                    totalSize += file.content.byteLength;
                }
            }
            if (totalSize > 0) {
                this.AddInfoRow (infoDiv, Loc ('File Size'), FormatBytes (totalSize));
            }
            this.AddInfoRow (infoDiv, Loc ('File Count'), importResult.fileList.length.toString ());
        }

        // Model Statistics
        AddDiv (infoDiv, 'ov_model_info_section_title', Loc ('Model Statistics'));

        let meshCount = 0;
        let triangleCount = 0;
        let vertexCount = 0;
        let normalCount = 0;
        let uvCount = 0;

        model.EnumerateMeshInstances ((meshInstance) => {
            meshCount++;
            let mesh = model.GetMesh (meshInstance.meshIndex);
            triangleCount += mesh.TriangleCount ();
            vertexCount += mesh.VertexCount ();
            normalCount += mesh.NormalCount ();
            uvCount += mesh.TextureUVCount (0);
        });

        this.AddInfoRow (infoDiv, Loc ('Meshes'), FormatNumber (meshCount));
        this.AddInfoRow (infoDiv, Loc ('Triangles'), FormatNumber (triangleCount));
        this.AddInfoRow (infoDiv, Loc ('Vertices'), FormatNumber (vertexCount));
        if (normalCount > 0) {
            this.AddInfoRow (infoDiv, Loc ('Normals'), FormatNumber (normalCount));
        }
        if (uvCount > 0) {
            this.AddInfoRow (infoDiv, Loc ('UV Coordinates'), FormatNumber (uvCount));
        }

        // Bounding Box
        let boundingBox = viewer.GetBoundingBox ((meshUserData) => {
            return true;
        });

        if (boundingBox) {
            let size = {
                x: boundingBox.max.x - boundingBox.min.x,
                y: boundingBox.max.y - boundingBox.min.y,
                z: boundingBox.max.z - boundingBox.min.z
            };

            AddDiv (infoDiv, 'ov_model_info_section_title', Loc ('Dimensions'));
            this.AddInfoRow (infoDiv, Loc ('Width (X)'), size.x.toFixed (3));
            this.AddInfoRow (infoDiv, Loc ('Height (Y)'), size.y.toFixed (3));
            this.AddInfoRow (infoDiv, 'Depth (Z)', size.z.toFixed (3));
        }

        // Materials
        AddDiv (infoDiv, 'ov_model_info_section_title', Loc ('Materials'));
        this.AddInfoRow (infoDiv, Loc ('Material Count'), model.MaterialCount ().toString ());

        contentDiv.classList.add ('ov_dialog');
        this.Open ();
    }

    AddInfoRow (parentDiv, label, value)
    {
        let rowDiv = AddDiv (parentDiv, 'ov_model_info_row');
        AddDiv (rowDiv, 'ov_model_info_label', label + ':');
        AddDiv (rowDiv, 'ov_model_info_value', value);
    }
}

export function ShowModelInfoDialog (model, viewer, importResult)
{
    let dialog = new ModelInfoDialog ();
    dialog.ShowDialog (model, viewer, importResult);
}
