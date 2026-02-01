import { AddDiv } from '../engine/viewer/domutils.js';
import { Loc } from '../engine/core/localization.js';
import { CoordDistance3D } from '../engine/geometry/coord3d.js';

export class MeasurementTools
{
    constructor (viewer, canvas)
    {
        this.viewer = viewer;
        this.canvas = canvas;
        this.isActive = false;
        this.measurementMode = null; // 'distance' or 'angle'
        this.points = [];
        this.markers = [];
        this.measurements = [];
        this.onClickHandler = null;
    }

    Activate (mode)
    {
        this.measurementMode = mode;
        this.isActive = true;
        this.points = [];
        this.ClearMarkers ();

        // Add click handler
        this.onClickHandler = this.OnCanvasClick.bind (this);
        this.canvas.addEventListener ('click', this.onClickHandler);

        // Change cursor
        this.canvas.style.cursor = 'crosshair';
    }

    Deactivate ()
    {
        this.isActive = false;
        this.measurementMode = null;
        this.points = [];

        if (this.onClickHandler) {
            this.canvas.removeEventListener ('click', this.onClickHandler);
            this.onClickHandler = null;
        }

        this.canvas.style.cursor = 'default';
    }

    OnCanvasClick (event)
    {
        if (!this.isActive) {
            return;
        }

        // Get click position and raycast
        const rect = this.canvas.getBoundingClientRect ();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convert to normalized device coordinates
        const mouse = {
            x: (x / this.canvas.width) * 2 - 1,
            y: -(y / this.canvas.height) * 2 + 1
        };

        // Raycast to find intersection point
        const intersection = this.viewer.GetIntersectionUnderMouse (mouse.x, mouse.y);

        if (intersection) {
            this.points.push ({
                x: intersection.point.x,
                y: intersection.point.y,
                z: intersection.point.z
            });

            this.AddMarker (intersection.point);

            if (this.measurementMode === 'distance' && this.points.length === 2) {
                this.CalculateDistance ();
                this.Deactivate ();
            } else if (this.measurementMode === 'angle' && this.points.length === 3) {
                this.CalculateAngle ();
                this.Deactivate ();
            }
        }
    }

    AddMarker (point)
    {
        // Create a simple sphere marker (requires Three.js in viewer)
        const markerGeometry = new THREE.SphereGeometry (0.05, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial ({ color: 0xff0000 });
        const marker = new THREE.Mesh (markerGeometry, markerMaterial);

        marker.position.set (point.x, point.y, point.z);

        this.viewer.GetScene ().add (marker);
        this.markers.push (marker);
        this.viewer.Render ();
    }

    ClearMarkers ()
    {
        this.markers.forEach (marker => {
            this.viewer.GetScene ().remove (marker);
            marker.geometry.dispose ();
            marker.material.dispose ();
        });
        this.markers = [];
        this.viewer.Render ();
    }

    CalculateDistance ()
    {
        if (this.points.length !== 2) {
            return;
        }

        const p1 = this.points[0];
        const p2 = this.points[1];
        const distance = CoordDistance3D (p1, p2);

        this.measurements.push ({
            type: 'distance',
            points: [p1, p2],
            value: distance
        });

        this.ShowMeasurementResult ('Distance', distance.toFixed (3) + ' units');
    }

    CalculateAngle ()
    {
        if (this.points.length !== 3) {
            return;
        }

        const p1 = this.points[0];
        const p2 = this.points[1];
        const p3 = this.points[2];

        // Calculate vectors
        const v1 = {
            x: p1.x - p2.x,
            y: p1.y - p2.y,
            z: p1.z - p2.z
        };

        const v2 = {
            x: p3.x - p2.x,
            y: p3.y - p2.y,
            z: p3.z - p2.z
        };

        // Calculate angle using dot product
        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt (v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt (v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        const angleRad = Math.acos (dot / (mag1 * mag2));
        const angleDeg = angleRad * (180 / Math.PI);

        this.measurements.push ({
            type: 'angle',
            points: [p1, p2, p3],
            value: angleDeg
        });

        this.ShowMeasurementResult ('Angle', angleDeg.toFixed (2) + '°');
    }

    ShowMeasurementResult (label, value)
    {
        const message = label + ': ' + value;
        alert (message);

        // Also log to console
        console.log ('Measurement:', { label: label, value: value, points: this.points });
    }

    GetMeasurements ()
    {
        return this.measurements;
    }

    ClearAllMeasurements ()
    {
        this.measurements = [];
        this.ClearMarkers ();
    }
}

export function ShowMeasurementDialog (viewer, canvas)
{
    const measurementTools = new MeasurementTools (viewer, canvas);

    // Create simple UI for measurement tools
    const panel = document.createElement ('div');
    panel.classList.add ('ov_measurement_panel');
    panel.style.position = 'absolute';
    panel.style.top = '100px';
    panel.style.right = '20px';
    panel.style.background = 'white';
    panel.style.padding = '15px';
    panel.style.borderRadius = '5px';
    panel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    panel.style.zIndex = '1000';

    const title = document.createElement ('div');
    title.textContent = Loc ('Measurement Tools');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    panel.appendChild (title);

    // Distance button
    const distanceBtn = document.createElement ('button');
    distanceBtn.textContent = Loc ('Measure Distance');
    distanceBtn.style.display = 'block';
    distanceBtn.style.width = '100%';
    distanceBtn.style.marginBottom = '5px';
    distanceBtn.onclick = () => {
        measurementTools.Activate ('distance');
        statusText.textContent = Loc ('Click two points to measure distance');
    };
    panel.appendChild (distanceBtn);

    // Angle button
    const angleBtn = document.createElement ('button');
    angleBtn.textContent = Loc ('Measure Angle');
    angleBtn.style.display = 'block';
    angleBtn.style.width = '100%';
    angleBtn.style.marginBottom = '5px';
    angleBtn.onclick = () => {
        measurementTools.Activate ('angle');
        statusText.textContent = Loc ('Click three points to measure angle');
    };
    panel.appendChild (angleBtn);

    // Clear button
    const clearBtn = document.createElement ('button');
    clearBtn.textContent = Loc ('Clear Measurements');
    clearBtn.style.display = 'block';
    clearBtn.style.width = '100%';
    clearBtn.style.marginBottom = '10px';
    clearBtn.onclick = () => {
        measurementTools.ClearAllMeasurements ();
        statusText.textContent = Loc ('Measurements cleared');
    };
    panel.appendChild (clearBtn);

    // Status text
    const statusText = document.createElement ('div');
    statusText.style.fontSize = '12px';
    statusText.style.color = '#666';
    statusText.style.marginBottom = '10px';
    statusText.textContent = Loc ('Select a measurement tool');
    panel.appendChild (statusText);

    // Close button
    const closeBtn = document.createElement ('button');
    closeBtn.textContent = Loc ('Close');
    closeBtn.style.display = 'block';
    closeBtn.style.width = '100%';
    closeBtn.onclick = () => {
        measurementTools.Deactivate ();
        document.body.removeChild (panel);
    };
    panel.appendChild (closeBtn);

    document.body.appendChild (panel);

    return measurementTools;
}
