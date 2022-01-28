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

    buttonInsert.setAttribute('class', 'qm-btn qm-btn-primary');
    buttonInsert.setAttribute('type', 'button');
    buttonCancel.setAttribute('class', 'qm-btn');
    buttonCancel.setAttribute('modal', 'modal');
    buttonCancel.setAttribute('data-dismiss', 'modal');
    buttonCancel.setAttribute('type', 'button');

    setTimeout(function () {
        for(let i=0;i<QuantummanagerLists.length;i++) {
            QuantummanagerLists[i].Quantumtoolbar.buttonAdd('insertFileEditor', 'center', 'file-actions', 'qm-btn-insert qm-btn qm-btn-primary qm-btn-hide', QuantumwindowLang.buttonInsert, 'quantummanager-icon-insert-inverse', {}, function (ev) {

                QuantumUtils.ajaxGet(QuantumUtils.getFullUrl("index.php?option=com_quantummanager&task=quantumviewfiles.getParsePath&path=" + encodeURIComponent(pathFile) + '&scope=' + QuantummanagerLists[i].data.scope + '&v=' + QuantumUtils.randomInteger(111111, 999999))).done(function (response) {
                    response = JSON.parse(response);

                    if(response.path !== undefined) {
                        window.parent.jInsertFieldValue(response.path, QuantumUtils.getUrlParameter('fieldid'));

                        if(window.parent.jModalClose !== undefined) {
                            window.parent.jModalClose();
                        }

                        if(window.parent.jQuery !== undefined) {
                            window.parent.jQuery('.modal.in').last().modal('hide');
                        }

                    }

                });

                ev.preventDefault();
            });
        }
    }, 300);

    QuantumEventsDispatcher.add('clickObject', function (fm) {
        let file = fm.Quantumviewfiles.objectSelect;

        if(file === undefined) {
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('qm-btn-hide');
            return;
        }
    });

    QuantumEventsDispatcher.add('clickFile', function (fm) {
        let file = fm.Quantumviewfiles.file;

        if(file === undefined || fm.Quantumviewfiles.getCountSelected() > 1) {
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('qm-btn-hide');
            return;
        }

        let name = file.querySelector('.file-name').innerHTML;
        let check = file.querySelector('.import-files-check-file');

        if(check.checked) {
            pathFile = fm.data.path + '/' + name;
            name.split('.').pop();
            altFile = name[0];
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.remove('qm-btn-hide');
        } else {
            fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('qm-btn-hide');
        }

    });

    QuantumEventsDispatcher.add('reloadPaths', function (fm) {
        fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('qm-btn-hide');
    });

    QuantumEventsDispatcher.add('updatePath', function (fm) {
        fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.add('qm-btn-hide');
    });

    QuantumEventsDispatcher.add('uploadComplete', function (fm) {

        if(fm.Qantumupload.filesLists.length === 0) {
            return;
        }

        let name = fm.Qantumupload.filesLists[0];
        pathFile = fm.data.path + '/' + fm.Qantumupload.filesLists[0];
        name.split('.').pop();
        altFile = name[0];
        fm.Quantumtoolbar.buttonsList['insertFileEditor'].classList.remove('qm-btn-hide');

    });

});