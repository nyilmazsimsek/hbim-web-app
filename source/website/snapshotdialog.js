import { AddDiv, CreateDomElement } from '../engine/viewer/domutils.js';
import { AddNumberInput, AddRadioButton } from '../website/utils.js';
import { ButtonDialog } from './dialog.js';
import { DownloadUrlAsFile } from './utils.js';
import { CookieGetIntVal, CookieGetStringVal, CookieSetIntVal, CookieSetStringVal } from './cookiehandler.js';
import { HandleEvent } from './eventhandler.js';

export function ShowSnapshotDialog (viewer)
{
    function AddSizeRadioButton (parentDiv, id, text, isSelected, onChange)
    {
        let line = AddDiv (parentDiv, 'ov_dialog_row');
        AddRadioButton (line, id, 'snapshot_size', text, isSelected, onChange);
    }

    function GetImageUrl (viewer, size)
    {
        let width = parseInt (size[0], 10);
        let height = parseInt (size[1], 10);
        if (width < 1 || height < 1) {
            return null;
        }
        return viewer.GetImageAsDataUrl (size[0], size[1]);
    }

    function UpdatePreview (viewer, previewImage, size)
    {
        let url = GetImageUrl (viewer, size);
        previewImage.src = url;
    }

    function UpdateCustomStatus (sizes, customIndex, selectedIndex)
    {
        let customSize = sizes[customIndex];
        customSize.widthInput.disabled = (selectedIndex !== customIndex);
        customSize.heightInput.disabled = (selectedIndex !== customIndex);
    }

    function GetSize (sizes, selectedIndex)
    {
        let selectedSize = sizes[selectedIndex];
        if (selectedSize.size !== null) {
            return selectedSize.size;
        } else {
            return [
                selectedSize.widthInput.value,
                selectedSize.heightInput.value
            ];
        }
    }

    function AddWidthHeightNumberInput (parentDiv, text, onChange)
    {
        let line = AddDiv (parentDiv, 'ov_dialog_row');
        AddDiv (line, 'ov_snapshot_dialog_param_name', text);
        let numberInput = AddNumberInput (line, 'ov_dialog_text', onChange);
        numberInput.classList.add ('ov_snapshot_dialog_param_value');
        numberInput.addEventListener ('focus', () => {
            numberInput.setSelectionRange (0, numberInput.value.length);
        });
        return numberInput;
    }

    let selectedIndex = 0;
    let customIndex = 3;
    let sizes = [
        {
            name : 'Small (1280x720)',
            size : [1280, 720]
        },
        {
            name : 'Medium (1920x1080)',
            size : [1920, 1080]
        },
        {
            name : 'Large (2560x1440)',
            size : [2560, 1440]
        },
        {
            name : 'Custom',
            size : null,
            widthInput : null,
            heightInput : null
        }
    ];

    let dialog = new ButtonDialog ();
    let contentDiv = dialog.Init ('Create Snapshot', [
        {
            name : 'Cancel',
            subClass : 'outline',
            onClick () {
                dialog.Close ();
            }
        },
        {
            name : 'Create',
            onClick () {
                dialog.Close ();
                HandleEvent ('snapshot_created', sizes[selectedIndex].name);
                let url = GetImageUrl (viewer, GetSize (sizes, selectedIndex));
                if (url !== null) {
                    DownloadUrlAsFile (url, 'model.png');
                }
            }
        }
    ]);

    let optionsDiv = AddDiv (contentDiv, 'ov_snapshot_dialog_left');
    let previewImage = CreateDomElement ('img', 'ov_snapshot_dialog_preview');

    let lastSnapshotSizeName = CookieGetStringVal ('ov_last_snapshot_size', sizes[1].name);
    for (let i = 0; i < sizes.length; i++) {
        if (lastSnapshotSizeName === sizes[i].name) {
            selectedIndex = i;
            break;
        }
    }

    let customSize = sizes[customIndex];
    for (let i = 0; i < sizes.length; i++) {
        let size = sizes[i];
        let selected = (i === selectedIndex);
        AddSizeRadioButton (optionsDiv, 'snapshot_' + i.toString (), size.name, selected, () => {
            selectedIndex = i;
            CookieSetStringVal ('ov_last_snapshot_size', size.name);
            UpdatePreview (viewer, previewImage, GetSize (sizes, i));
            UpdateCustomStatus (sizes, customIndex, selectedIndex);
        });
    }

    customSize.widthInput = AddWidthHeightNumberInput (optionsDiv, 'Width', (val) => {
        UpdatePreview (viewer, previewImage, GetSize (sizes, selectedIndex));
        CookieSetIntVal ('ov_snapshot_custom_width', val);
    });
    customSize.heightInput = AddWidthHeightNumberInput (optionsDiv, 'Height', (val) => {
        UpdatePreview (viewer, previewImage, GetSize (sizes, selectedIndex));
        CookieSetIntVal ('ov_snapshot_custom_height', val);
    });
    customSize.widthInput.value = CookieGetIntVal ('ov_snapshot_custom_width', 1000);
    customSize.heightInput.value = CookieGetIntVal ('ov_snapshot_custom_height', 1000);
    UpdateCustomStatus (sizes, customIndex, selectedIndex);

    contentDiv.appendChild (previewImage);
    UpdatePreview (viewer, previewImage, GetSize (sizes, selectedIndex));

    dialog.Open ();
    return dialog;
}
