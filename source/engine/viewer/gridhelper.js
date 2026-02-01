import * as THREE from 'three';

export class GridHelper
{
    constructor (scene)
    {
        this.scene = scene;
        this.gridHelper = null;
        this.axesHelper = null;
        this.isVisible = false;
    }

    SetVisible (visible, gridSize, gridDivisions)
    {
        this.isVisible = visible;

        if (this.gridHelper) {
            this.scene.remove (this.gridHelper);
            this.gridHelper.geometry.dispose ();
            this.gridHelper.material.dispose ();
            this.gridHelper = null;
        }

        if (this.axesHelper) {
            this.scene.remove (this.axesHelper);
            this.axesHelper.dispose ();
            this.axesHelper = null;
        }

        if (this.isVisible) {
            // Create grid
            const size = gridSize || 10;
            const divisions = gridDivisions || 10;
            this.gridHelper = new THREE.GridHelper (size, divisions, 0x888888, 0x444444);
            this.scene.add (this.gridHelper);

            // Create axes
            const axesSize = size / 2;
            this.axesHelper = new THREE.AxesHelper (axesSize);
            this.scene.add (this.axesHelper);
        }
    }

    UpdateGridSize (boundingSphere)
    {
        if (!this.isVisible) {
            return;
        }

        const radius = boundingSphere.radius;
        const gridSize = Math.ceil (radius * 2);
        const gridDivisions = Math.min (20, Math.max (10, gridSize));

        this.SetVisible (true, gridSize, gridDivisions);
    }

    IsVisible ()
    {
        return this.isVisible;
    }

    Clear ()
    {
        this.SetVisible (false);
    }
}
