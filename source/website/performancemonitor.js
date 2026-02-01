import { AddDiv } from '../engine/viewer/domutils.js';
import { Loc } from '../engine/core/localization.js';

export class PerformanceMonitor
{
    constructor (viewer)
    {
        this.viewer = viewer;
        this.isVisible = false;
        this.panel = null;
        this.stats = {
            fps: 0,
            frameTime: 0,
            triangles: 0,
            drawCalls: 0,
            memory: 0
        };
        this.frameCount = 0;
        this.lastTime = performance.now ();
        this.updateInterval = 500; // Update every 500ms
        this.animationFrameId = null;
    }

    Show ()
    {
        if (this.isVisible) {
            return;
        }

        this.isVisible = true;
        this.CreatePanel ();
        this.StartMonitoring ();
    }

    Hide ()
    {
        if (!this.isVisible) {
            return;
        }

        this.isVisible = false;
        this.StopMonitoring ();

        if (this.panel) {
            document.body.removeChild (this.panel);
            this.panel = null;
        }
    }

    Toggle ()
    {
        if (this.isVisible) {
            this.Hide ();
        } else {
            this.Show ();
        }
    }

    CreatePanel ()
    {
        this.panel = document.createElement ('div');
        this.panel.classList.add ('ov_performance_monitor');
        this.panel.style.position = 'fixed';
        this.panel.style.top = '10px';
        this.panel.style.left = '10px';
        this.panel.style.background = 'rgba(0, 0, 0, 0.8)';
        this.panel.style.color = '#00ff00';
        this.panel.style.padding = '10px';
        this.panel.style.fontFamily = 'monospace';
        this.panel.style.fontSize = '12px';
        this.panel.style.borderRadius = '5px';
        this.panel.style.zIndex = '10000';
        this.panel.style.minWidth = '200px';
        this.panel.style.userSelect = 'none';
        this.panel.style.pointerEvents = 'none';

        // Title
        const title = document.createElement ('div');
        title.textContent = 'Performance Monitor';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.style.borderBottom = '1px solid #00ff00';
        title.style.paddingBottom = '5px';
        this.panel.appendChild (title);

        // Stats container
        this.statsContainer = document.createElement ('div');
        this.panel.appendChild (this.statsContainer);

        document.body.appendChild (this.panel);
        this.UpdateDisplay ();
    }

    StartMonitoring ()
    {
        this.lastTime = performance.now ();
        this.frameCount = 0;
        this.Update ();
    }

    StopMonitoring ()
    {
        if (this.animationFrameId) {
            cancelAnimationFrame (this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    Update ()
    {
        if (!this.isVisible) {
            return;
        }

        const currentTime = performance.now ();
        const deltaTime = currentTime - this.lastTime;

        this.frameCount++;

        // Update stats every updateInterval ms
        if (deltaTime >= this.updateInterval) {
            // Calculate FPS
            this.stats.fps = Math.round ((this.frameCount / deltaTime) * 1000);
            this.stats.frameTime = deltaTime / this.frameCount;

            // Get renderer info if available
            this.UpdateRendererInfo ();

            // Update display
            this.UpdateDisplay ();

            // Reset counters
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        this.animationFrameId = requestAnimationFrame (this.Update.bind (this));
    }

    UpdateRendererInfo ()
    {
        // Try to get Three.js renderer info
        const threeScene = this.viewer.GetThreeScene?.();
        const renderer = this.viewer.GetRenderer?.();

        if (renderer && renderer.info) {
            this.stats.triangles = renderer.info.render.triangles;
            this.stats.drawCalls = renderer.info.render.calls;

            // Memory info (if available)
            if (renderer.info.memory) {
                this.stats.geometries = renderer.info.memory.geometries;
                this.stats.textures = renderer.info.memory.textures;
            }
        }

        // Get model info
        const model = this.viewer.GetModel?.();
        if (model) {
            let triangleCount = 0;
            model.EnumerateMeshInstances?.((meshInstance) => {
                const mesh = model.GetMesh (meshInstance.meshIndex);
                triangleCount += mesh.TriangleCount ();
            });
            this.stats.modelTriangles = triangleCount;
        }

        // Memory usage (if available)
        if (performance.memory) {
            this.stats.memory = (performance.memory.usedJSHeapSize / 1048576).toFixed (1); // MB
            this.stats.memoryLimit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed (1);
        }
    }

    UpdateDisplay ()
    {
        if (!this.statsContainer) {
            return;
        }

        const lines = [];

        // FPS
        const fpsColor = this.stats.fps >= 60 ? '#00ff00' : this.stats.fps >= 30 ? '#ffff00' : '#ff0000';
        lines.push (`<div><span style="color: #888">FPS:</span> <span style="color: ${fpsColor}">${this.stats.fps}</span></div>`);

        // Frame time
        lines.push (`<div><span style="color: #888">Frame:</span> ${this.stats.frameTime.toFixed (2)} ms</div>`);

        // Triangles
        if (this.stats.triangles > 0) {
            lines.push (`<div><span style="color: #888">Triangles:</span> ${this.stats.triangles.toLocaleString ()}</div>`);
        } else if (this.stats.modelTriangles > 0) {
            lines.push (`<div><span style="color: #888">Triangles:</span> ${this.stats.modelTriangles.toLocaleString ()}</div>`);
        }

        // Draw calls
        if (this.stats.drawCalls > 0) {
            lines.push (`<div><span style="color: #888">Draw Calls:</span> ${this.stats.drawCalls}</div>`);
        }

        // Geometries
        if (this.stats.geometries !== undefined) {
            lines.push (`<div><span style="color: #888">Geometries:</span> ${this.stats.geometries}</div>`);
        }

        // Textures
        if (this.stats.textures !== undefined) {
            lines.push (`<div><span style="color: #888">Textures:</span> ${this.stats.textures}</div>`);
        }

        // Memory
        if (this.stats.memory > 0) {
            lines.push (`<div><span style="color: #888">Memory:</span> ${this.stats.memory} / ${this.stats.memoryLimit} MB</div>`);
        }

        this.statsContainer.innerHTML = lines.join ('');
    }

    GetStats ()
    {
        return this.stats;
    }
}

export function TogglePerformanceMonitor (viewer)
{
    if (!viewer.performanceMonitor) {
        viewer.performanceMonitor = new PerformanceMonitor (viewer);
    }

    viewer.performanceMonitor.Toggle ();
    return viewer.performanceMonitor.isVisible;
}
