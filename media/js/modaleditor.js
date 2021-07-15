/**
 * @package    quantummanager
 * @author     Dmitry Tsymbal <cymbal@delo-design.ru>
 * @copyright  Copyright © 2019 Delo Design & NorrNext. All rights reserved.
 * @license    GNU General Public License version 3 or later; see license.txt
 * @link       https://www.norrnext.com
 */

document.addEventListener('DOMContentLoaded', function () {

    let buttonInsert = document.createElement('button');
    let buttonCancel = document.createElement('button');
    let pathFile;
    let altFile;

    buttonInsert.setAttribute('class', 'btn btn-primary');
    buttonInsert.setAttribute('type', 'button');
    buttonCancel.setAttribute('class', 'btn');
    buttonCancel.setAttribute('modal', 'modal');
    buttonCancel.setAttribute('data-dismiss', 'modal');
    buttonCancel.setAttribute('type', 'button');

    setTimeout(function () {
        for(let i=0;i<QuantummanagerLists.length;i++) {
            QuantummanagerLists[i].Quantumtoolbar.buttonAdd('insertFileEditor', 'center', 'file-actions', 'btn-insert btn-primary btn-hide', QuantumwindowLang.buttonInsert, 'quantummanager-icon-insert-inverse', {}, function (ev) {

                let fm = QuantummanagerLists[i];

                QuantumUtils.ajaxGet(QuantumUtils.getFullUrl("/administrator/index.php?option=com_quantummanager&task=quantumviewfiles.getParsePath&path=" + encodeURIComponent(pathFile) + '&scope=' + QuantummanagerLists[i].data.scope + '&v=' + QuantumUtils.randomInteger(111111, 999999))).done(function (response) {
                    response = JSON.parse(response);

                    if(response.path === undefined) {
                        return;
                    }

                    let tag = '',
                        attr = [],
                        figclass = '',
                        captionclass = '',
                        // Get the image tag field information
                        url = response.path,
                        alt = altFile,
                        align = '',
                        title = '',
                        caption = '',
                        c_class = '',
                        editor = getUrlParameter('e_name'),
                        altInput = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="alt"]'),
                        widthInput = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="width"]'),
                        heightInput = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="height"]'),
                        hspaceInput = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="hspace"]'),
                        vspaceInput = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="vspace"]'),
                        alignInput = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="align"]'),
                        cssClass = fm.Quantumviewfiles.element.querySelector('.modal-form-insert [name="cssclass"]');

                    if(altInput !== null) {
                        if(altInput.value !== '') {
                            alt = altInput.value;
                        }
                    }

                    if(widthInput !== null) {
                        if(widthInput.value !== '') {
                            attr.push("width='" + widthInput.value + "'")
                        }
                    }

                    if(heightInput !== null) {
                        if(heightInput.value !== '') {
                            attr.push("height='" + heightInput.value + "'")
                        }
                    }

                    if(alignInput !== null) {
                        if(alignInput.value !== '') {
                            attr.push("align='" + alignInput.value + "'")
                        }
                    }

                    if(hspaceInput !== null) {
                        if(hspaceInput.value !== '') {
                            attr.push("hspace='" + hspaceInput.value + "'")
                        }
                    }

                    if(vspaceInput !== null) {
                        if(vspaceInput.value !== '') {
                            attr.push("vspace='" + vspaceInput.value + "'")
                        }
                    }

                    if(cssClass !== null) {
                        if(cssClass.value !== '') {
                            attr.push("class='" + cssClass.value + "'")
                        }
                    }

                    if (url) {
                        // Set alt attribute
                        attr.push('alt="' + alt + '"');

                        // Set title attribute
                        if (title)
                        {
                            attr.push('title="' + title + '"');
                        }

                        tag = '<img src="' + url + '" ' + attr.join(' ') + '/>';

                        // Process caption
                        if (caption)
                        {
                            if (align)
                            {
                                figclass = ' class="pull-' + align + '"';
                            }

                            if (c_class)
                            {
                                captionclass = ' class="' + c_class + '"';
                            }

                            tag = '<figure' + figclass + '>' + tag + '<figcaption' + captionclass + '>' + caption + '</figcaption></figure>';
                        }
                    }

                    if (window.Joomla && Joomla.editors.instances.hasOwnProperty(editor)) {
                        Joomla.editors.instances[editor].replaceSelection(tag)
                    } else {
                        window.parent.jInsertEditorText(tag, editor);
                    }

                    window.parent.jModalClose();

                });

                ev.preventDefault();
            });
        }
    }, 300);

    QuantumEventsDispatcher.add('clickObject', function (fm) {
        let file = fm.Quantumviewfiles.objectSelect;

        if(file === undefined) {
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('btn-hide');
            return;
        }
    });

    QuantumEventsDispatcher.add('clickFile', function (fm) {
        let file = fm.Quantumviewfiles.file;

        if(file === undefined || fm.Quantumviewfiles.getCountSelected() > 1) {
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('btn-hide');

            let form = fm.Quantumviewfiles.element.querySelector('.modal-form-insert');
            if(form !== null) {
                form.classList.remove('active');
            }

            return;
        }

        let name = file.querySelector('.file-name').innerHTML;
        let check = file.querySelector('.import-files-check-file');
        let form = fm.Quantumviewfiles.element.querySelector('.modal-form-insert');

        if(form === null) {
            let html = document.createElement('div');
            html.setAttribute('class', 'modal-form-insert');
            html.innerHTML = '<div><input type="text" name="alt" value="" placeholder="' + QuantumwindowLang.inputAlt + '">' +
                '<input type="number" name="width" value="" placeholder="' + QuantumwindowLang.inputWidth + '">' +
                '<input type="number" name="height" value="" placeholder="' + QuantumwindowLang.inputHeight + '">' +
                '<input type="number" name="hspace" value="" placeholder="' + QuantumwindowLang.inputHspace + '">' +
                '<input type="number" name="vspace" value="" placeholder="' + QuantumwindowLang.inputVspace + '">' +
                '<input type="text" name="cssclass" value="" placeholder="' + QuantumwindowLang.inputCssClass + '">' +
                '<select name="align"><option value="">' + QuantumwindowLang.inputAlign + '</option><option value="top">Top</option><option value="left">Left</option><option value="right">Right</option><option value="bottom">Bottom</option><option value="middle">Middle</option></select>' +
                '</div>';
            fm.Quantumviewfiles.element.appendChild(html);
            form = html;
        }

        if(check.checked) {

            pathFile = fm.data.path + '/' + name;
            name = name.split('.');
            name.pop();
            altFile = name.join('.');
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.remove('btn-hide');
            form.classList.add('active');
        } else {
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('btn-hide');
            form.classList.remove('active');
        }
    });

    QuantumEventsDispatcher.add('updatePath', function (fm) {
        fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('btn-hide');

        let form = fm.Quantumviewfiles.element.querySelector('.modal-form-insert');
        if(form !== null) {
            form.classList.remove('active');
        }
    });

    QuantumEventsDispatcher.add('reloadPaths', function (fm) {
        fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('btn-hide');

        let form = fm.Quantumviewfiles.element.querySelector('.modal-form-insert');
        if(form !== null) {
            form.classList.remove('active');
        }
    });

    QuantumEventsDispatcher.add('uploadComplete', function (fm) {

        if(fm.Qantumupload.filesLists.length === 0) {
            return
        }

        let name = fm.Qantumupload.filesLists[0];
        pathFile = fm.data.path + '/' + fm.Qantumupload.filesLists[0];
        name.split('.').pop();
        altFile = name[0];
        fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.remove('btn-hide');
    });

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        let results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

});