import { RunTaskAsync } from '../engine/core/taskrunner.js';
import { Coord3D } from '../engine/geometry/coord3d.js';
import { Matrix } from '../engine/geometry/matrix.js';
import { FileFormat } from '../engine/io/fileutils.js';
import { Exporter } from '../engine/export/exporter.js';
import { ExporterModel, ExporterSettings } from '../engine/export/exportermodel.js';
import { AddDiv, ClearDomElement } from '../engine/viewer/domutils.js';
import { AddSelect, AddCheckbox } from '../website/utils.js';
import { ButtonDialog, ProgressDialog } from './dialog.js';
import { ShowMessage Dialog } from './dialogs.js';
import { DownloadArrayBufferAsFile } from './utils.js';
import { CookieGetStringVal, CookieSetStringVal } from './cookiehandler.js';
import { HandleEvent } from './eventhandler.js';
import { Loc } from '../engine/core/localization.js';

import * as fflate from 'fflate';

export class BatchExportDialog
{
    constructor ()
    {
        this.formats = [
            { name: 'Wavefront (.obj)', format: FileFormat.Text, extension: 'obj', enabled: false },
            { name: 'Stereolithography Binary (.stl)', format: FileFormat.Binary, extension: 'stl', enabled: false },
            { name: 'Polygon File Format Binary (.ply)', format: FileFormat.Binary, extension: 'ply', enabled: false },
            { name: 'glTF Binary (.glb)', format: FileFormat.Binary, extension: 'glb', enabled: false },
            { name: 'Object File Format (.off)', format: FileFormat.Text, extension: 'off', enabled: false },
            { name: 'Rhinoceros 3D (.3dm)', format: FileFormat.Binary, extension: '3dm', enabled: false },
            { name: 'Dotbim (.bim)', format: FileFormat.Text, extension: 'bim', enabled: false }
        ];
    }

    ShowDialog (model, viewer, callbacks)
    {
        let mainDialog = new ButtonDialog ();
        let contentDiv = mainDialog.Init (Loc ('Batch Export'), [
            {
                name : Loc ('Close'),
                subClass : 'outline',
                onClick () {
                    mainDialog.Close ();
                }
            },
            {
                name : Loc ('Export All'),
                onClick : () => {
                    let selectedFormats = this.formats.filter (f => f.enabled);
                    if (selectedFormats.length === 0) {
                        ShowMessageDialog (
                            Loc ('No Formats Selected'),
                            Loc ('Please select at least one export format.'),
                            null
                        );
                        return;
                    }
                    mainDialog.Close ();
                    this.ExportBatch (model, selectedFormats, callbacks);
                }
            }
        ]);

        AddDiv (contentDiv, 'ov_dialog_section', Loc ('Select export formats:'));

        let formatsDiv = AddDiv (contentDiv, 'ov_batch_export_formats');

        for (let formatInfo of this.formats) {
            let formatRow = AddDiv (formatsDiv, 'ov_batch_export_format_row');
            let checkbox = AddCheckbox (formatRow, 'format_' + formatInfo.extension, formatInfo.name, formatInfo.enabled, (checked) => {
                formatInfo.enabled = checked.checked;
            });
        }

        mainDialog.Open ();
    }

    ExportBatch (model, formats, callbacks)
    {
        let settings = new ExporterSettings ();
        // Use visible only by default for batch export
        settings.isMeshVisible = (meshInstanceId) => {
            return callbacks.isMeshVisible (meshInstanceId);
        };

        let exporterModel = new ExporterModel (model, settings);
        if (exporterModel.MeshInstanceCount () === 0) {
            ShowMessageDialog (
                Loc ('Export Failed'),
                Loc ('The model doesn\'t contain any meshes.'),
                null
            );
            return;
        }

        let progressDialog = new ProgressDialog ();
        progressDialog.Init (Loc ('Exporting Multiple Formats'));
        progressDialog.Open ();

        let allFiles = [];
        let completed = 0;

        RunTaskAsync (() => {
            for (let formatInfo of formats) {
                let exporter = new Exporter ();
                exporter.Export (model, settings, formatInfo.format, formatInfo.extension, {
                    onError : () => {
                        completed++;
                        if (completed === formats.length) {
                            this.FinalizeBatchExport (allFiles, progressDialog);
                        }
                    },
                    onSuccess : (files) => {
                        allFiles.push (...files);
                        completed++;
                        if (completed === formats.length) {
                            this.FinalizeBatchExport (allFiles, progressDialog);
                        }
                    }
                });
            }
        });
    }

    FinalizeBatchExport (files, progressDialog)
    {
        if (files.length === 0) {
            progressDialog.Close ();
            ShowMessageDialog (
                Loc ('Export Failed'),
                Loc ('No files were generated.'),
                null
            );
            return;
        }

        let filesInZip = {};
        for (let file of files) {
            filesInZip[file.name] = new Uint8Array (file.content);
        }

        let zippedContent = fflate.zipSync (filesInZip);
        let zippedBuffer = zippedContent.buffer;

        progressDialog.Close ();
        DownloadArrayBufferAsFile (zippedBuffer, 'model_batch_export.zip');

        HandleEvent ('batch_export_completed', files.length + '_files');
    }
}

export function ShowBatchExportDialog (model, viewer, callbacks)
{
    let dialog = new BatchExportDialog ();
    dialog.ShowDialog (model, viewer, callbacks);
}
