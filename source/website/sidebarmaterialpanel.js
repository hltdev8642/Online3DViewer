import { AddDiv } from '../engine/viewer/domutils.js';
import { Loc } from '../engine/core/localization.js';
import { SidebarPanel } from './sidebarpanel.js';
import { MaterialSource, MaterialType } from '../engine/model/material.js';
import { RGBColorToHexString, RGBAColorToHexString } from '../engine/model/color.js';

export class SidebarMaterialPanel extends SidebarPanel
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.materialIndex = null;
    }

    GetName ()
    {
        return Loc ('Materials');
    }

    GetIcon ()
    {
        return 'materials';
    }

    Clear ()
    {
        this.materialIndex = null;
        super.Clear ();
    }

    ShowMaterial (model, materialIndex)
    {
        this.materialIndex = materialIndex;
        this.Clear ();

        let material = model.GetMaterial (materialIndex);
        if (!material) {
            return;
        }

        this.AddTitle (material.name || Loc ('Material ') + (materialIndex + 1));

        // Material Properties Section
        this.AddSubtitle (Loc ('Properties'));

        // Material Type
        let typeStr = '';
        if (material.type === MaterialType.Phong) {
            typeStr = 'Phong';
        } else if (material.type === MaterialType.Physical) {
            typeStr = 'Physical (PBR)';
        }
        this.AddProperty (Loc ('Type'), typeStr);

        // Colors
        if (material.color) {
            this.AddColorProperty (Loc ('Base Color'), material.color);
        }

        if (material.ambient) {
            this.AddColorProperty (Loc ('Ambient'), material.ambient);
        }

        if (material.specular) {
            this.AddColorProperty (Loc ('Specular'), material.specular);
        }

        // Physical material properties
        if (material.type === MaterialType.Physical) {
            if (material.metalness !== undefined) {
                this.AddProperty (Loc ('Metalness'), material.metalness.toFixed (2));
            }
            if (material.roughness !== undefined) {
                this.AddProperty (Loc ('Roughness'), material.roughness.toFixed (2));
            }
        }

        // Phong material properties
        if (material.type === MaterialType.Phong) {
            if (material.shininess !== undefined) {
                this.AddProperty (Loc ('Shininess'), material.shininess.toFixed (2));
            }
        }

        // Transparency
        this.AddProperty (Loc ('Opacity'), material.opacity.toFixed (2));

        if (material.transparent) {
            this.AddProperty (Loc ('Transparent'), Loc ('Yes'));
            if (material.alphaTest !== undefined && material.alphaTest > 0) {
                this.AddProperty (Loc ('Alpha Test'), material.alphaTest.toFixed (2));
            }
        }

        // Textures Section
        let hasTextures = false;
        if (material.diffuseMap || material.specularMap || material.bumpMap ||
            material.normalMap || material.emissiveMap || material.metalnessMap || material.roughnessMap) {
            hasTextures = true;
        }

        if (hasTextures) {
            this.AddSubtitle (Loc ('Textures'));

            if (material.diffuseMap) {
                this.AddTextureInfo (Loc ('Diffuse Map'), material.diffuseMap);
            }
            if (material.specularMap) {
                this.AddTextureInfo (Loc ('Specular Map'), material.specularMap);
            }
            if (material.bumpMap) {
                this.AddTextureInfo (Loc ('Bump Map'), material.bumpMap);
            }
            if (material.normalMap) {
                this.AddTextureInfo (Loc ('Normal Map'), material.normalMap);
            }
            if (material.emissiveMap) {
                this.AddTextureInfo (Loc ('Emissive Map'), material.emissiveMap);
            }
            if (material.metalnessMap) {
                this.AddTextureInfo (Loc ('Metalness Map'), material.metalnessMap);
            }
            if (material.roughnessMap) {
                this.AddTextureInfo (Loc ('Roughness Map'), material.roughnessMap);
            }
        }

        // Usage Statistics
        this.AddSubtitle (Loc ('Usage'));
        let meshCount = 0;
        let triangleCount = 0;

        model.EnumerateMeshInstances ((meshInstance) => {
            let mesh = model.GetMesh (meshInstance.meshIndex);
            mesh.EnumerateTriangleIndices ((triIndex) => {
                if (mesh.GetTriangle (triIndex).mat === materialIndex) {
                    if (triangleCount === 0) {
                        meshCount = 1;
                    }
                    triangleCount++;
                }
            });
        });

        if (meshCount > 0) {
            this.AddProperty (Loc ('Used by Meshes'), meshCount.toString ());
            this.AddProperty (Loc ('Triangle Count'), triangleCount.toLocaleString ());
        }
    }

    AddTitle (title)
    {
        AddDiv (this.contentDiv, 'ov_sidebar_title', title);
    }

    AddSubtitle (subtitle)
    {
        AddDiv (this.contentDiv, 'ov_sidebar_subtitle', subtitle);
    }

    AddProperty (name, value)
    {
        let propertyDiv = AddDiv (this.contentDiv, 'ov_sidebar_property');
        AddDiv (propertyDiv, 'ov_sidebar_property_name', name + ':');
        AddDiv (propertyDiv, 'ov_sidebar_property_value', value);
    }

    AddColorProperty (name, color)
    {
        let propertyDiv = AddDiv (this.contentDiv, 'ov_sidebar_property');
        AddDiv (propertyDiv, 'ov_sidebar_property_name', name + ':');

        let valueDiv = AddDiv (propertyDiv, 'ov_sidebar_property_value');
        let colorBox = AddDiv (valueDiv, 'ov_sidebar_color_box');
        colorBox.style.backgroundColor = '#' + RGBColorToHexString (color);

        let colorText = AddDiv (valueDiv, 'ov_sidebar_color_text');
        colorText.innerHTML = 'RGB(' + color.r + ', ' + color.g + ', ' + color.b + ')';
    }

    AddTextureInfo (name, texture)
    {
        let textureName = texture.name || Loc ('Unnamed Texture');
        this.AddProperty (name, textureName);

        // Add texture URL if available
        if (texture.url) {
            let propertyDiv = AddDiv (this.contentDiv, 'ov_sidebar_property_indented');
            AddDiv (propertyDiv, 'ov_sidebar_property_name', Loc ('URL') + ':');
            let urlDiv = AddDiv (propertyDiv, 'ov_sidebar_property_value ov_sidebar_property_url');
            urlDiv.innerHTML = texture.url;
            urlDiv.title = texture.url;
        }
    }
}
