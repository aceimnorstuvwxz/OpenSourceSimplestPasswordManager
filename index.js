const Store = require('electron-store');
const store = new Store();
const { dialog, shell } = require('electron').remote
const jsonfile = require('jsonfile')
const mycrypto = require('./mycrypto')
const path = require('path')
const electron = require('electron')
const generator = require('generate-password');

const toast_time = 2000

let g_system_file_path
let g_system_password


window.addEventListener('unload', function () {
    save()
    electron.ipcRenderer.send('log', 'unload')
})


window.addEventListener('beforeunload', function () {
    $(':focus').focusout()
    electron.ipcRenderer.send('log', 'beforeunload')
})

document.addEventListener('DOMContentLoaded', function () {

    let file_path = store.get('s_file_path')

    if (file_path && file_path.length > 0) {
        $('#file_path').val(file_path)
    }
    $('#choose_file').click(function (event) {
        let selected_path = dialog.showOpenDialog({ properties: ['openFile'] }) //, 'openDirectory'
        if (selected_path.length > 0) {
            file_path = selected_path[0]
            $('#file_path').val(file_path)
            store.set('s_file_path', file_path)
        }
    })

    $('#enter').click(on_enter_click)

    $('#bottom_menu').hide()
    $('#main_page').hide()

    $('#btn_add').click(on_add_record)
    $('#btn_help').click(function () {
        shell.openExternal('https://github.com/fateleak/OpenSourceSimplestPasswordManager')
        $('.fixed-action-btn').closeFAB()
    })
    $('#btn_save').click(function () {
        $(':focus').focusout()
        setTimeout(() => {
            save()
        }, 100);
        $('.fixed-action-btn').closeFAB()
    })

    $('#btn_logout').click(function () {
        store.delete('autologin')

        save()

        $('#welcome_page').show()
        $('#main_page').hide()
        $('#bottom_menu').hide()

        //clear data
        g_all_records_map = {}
        $('#item_list').empty()
        g_can_save = false
    })

    $('#search_input').on('input', function () {
        console.log('input')
        do_search_filter()
    })

    /*
    setTimeout(() => {
        on_enter_click()
    }, 100)
*/
    console.log('login', store.get('autologin'))
    if (store.get('autologin') != null) {
        $('#password').val(store.get('autologin'))

        on_enter_click()
    }
})

function check_file_state() {
    //检查文件的状态
    //用tooltip显示错误

}

function on_enter_click() {
    let file_path = $('#file_path').val()
    let password = $('#password').val()
    if ($('#autologin:checked').val()) {
        console.log('autologin')
        store.set('autologin', password)
    } else {
        console.log('no auto login')
    }
    // check file


    // enter page
    g_system_file_path = file_path
    g_system_password = password
    console.log("enter with", file_path, password)

    on_enter_page()
}

function on_enter_page() {
    $('#welcome_page').hide()
    $('#main_page').show()
    $('#bottom_menu').show()

    load_data_and_record_ui()
    g_can_save = true
}

function next_record_index() {
    let current_index = store.get('index')
    if (current_index) {
        store.set('index', current_index + 1)
    } else {
        current_index = 0
        store.set('index', 1)
    }
    return current_index
}

let g_all_records_map = {} //index->record
let g_can_save = false

function on_add_record() {
    let new_password = generator.generate({
        length: 16,
        numbers: true
    })

    let new_record = {
        index: next_record_index(),
        title: "",
        username: "",
        password: new_password,
        system_password: g_system_password,
        covered_password: mycrypto.encrypt(g_system_password, new_password),
        covered_system_password: mycrypto.encrypt(g_system_password, g_system_password),
        notes: ""
    }
    Materialize.toast('Strong password has been generated', toast_time)

    g_all_records_map[new_record.index] = new_record
    prepend_record_ui(new_record, true)
    $('#item_list').collapsible('open', 0)
    $('.fixed-action-btn').closeFAB()
}

function prepend_record_ui(record, focus_edit = false) {
    let new_item_element = $('#new_item_template').clone()
    new_item_element.removeAttr('id')
    new_item_element.web_record = record
    setup_record_ui(new_item_element)
    new_item_element.prependTo('#item_list')
    if (focus_edit) {
        setTimeout(() => {
            new_item_element.find('.my-input-title').focus()
        }, 100);
    }
}

function setup_record_ui(item_element) {
    let record = item_element.web_record

    item_element.find('.item-index').text(`#${record.index}`)
    item_element.find('.item-title').text(record.title.length > 0 ? record.title : 'New record')
    item_element.find('.my-input-title').val(`${record.title}`).keyup(function (event) {
        let title = event.target.value
        item_element.find('.item-title').text(title.length > 0 ? title : 'New record')
    }).focusout(function () {
        let title = item_element.find('.my-input-title').val()
        if (title.length > 0) {
            item_element.web_record.title = title
        }
    })
    item_element.find('.my-input-username').val(`${record.username}`).focusout(function () {
        let username = item_element.find('.my-input-username').val()
        if (username.length > 0) {
            item_element.web_record.username = username
        }
    })
    item_element.find('.my-input-password').val(`${record.password}`).focusout(function () {
        let password = item_element.find('.my-input-password').val()
        if (password.length > 0) {
            item_element.web_record.password = password
            item_element.web_record.covered_password = mycrypto.encrypt(g_system_password, item_element.web_record.password)
        }
    })
    item_element.find('.my-input-notes').val(`${record.notes}`).focusout(function () {
        let notes = item_element.find('.my-input-notes').val()
        item_element.web_record.notes = notes
    })

    item_element.find('.mybtn-save').click(function () {
        let title = item_element.find('.my-input-title').val()
        let username = item_element.find('.my-input-username').val()
        let password = item_element.find('.my-input-password').val()
        console.log(title, username, password)
        // if (title.length > 0 && username.length > 0 && password.length > 0) { //always can save
        item_element.web_record.title = title
        item_element.web_record.username = username
        item_element.web_record.password = password
        item_element.web_record.notes = item_element.find('.my-input-notes').val()
        item_element.web_record.covered_password = mycrypto.encrypt(g_system_password, item_element.web_record.password)
        save()
        // } else {
        // console.log("input field check fail")
        // }
    })

    item_element.find('.mybtn-delete').dblclick(function (e) {
        console.log('db click')
        Materialize.toast(`Record #${item_element.web_record.index} has been deleted`, toast_time)
        delete g_all_records_map[item_element.web_record.index]
        save()
        item_element.remove()

    })

    item_element.find('.mybtn-show').mouseover(function () {
        item_element.find('.my-input-password').attr('type', 'text')
    }).mouseout(function () {
        item_element.find('.my-input-password').attr('type', 'password')
    })

    item_element.find('.mybtn-copy-username').click(function () {
        electron.clipboard.writeText(item_element.find('.my-input-username').val())
        copy_sound()
    })

    item_element.find('.mybtn-copy-password').click(function () {
        electron.clipboard.writeText(item_element.find('.my-input-password').val())
        copy_sound()
    })

    item_element.find('.mybtn-copy-notes').click(function () {
        electron.clipboard.writeText(item_element.find('.my-input-notes').val())
        copy_sound()
    })

}

function copy_sound() {
    let audio = document.getElementsByTagName("audio")[0]
    audio.play()
}

function save() {
    if (!g_can_save) {
        return
    }

    //save all records
    const temp_all_records = Object.assign({}, g_all_records_map);

    for (let key in temp_all_records) {
        let temp_rec = temp_all_records[key]
        delete temp_rec.password
        delete temp_rec.system_password
    }

    console.log('save', g_system_file_path, temp_all_records)

    electron.ipcRenderer.send('save', {
        path: g_system_file_path,
        data: temp_all_records
    })

}


function load_data_and_record_ui() {
    jsonfile.readFile(g_system_file_path, function (err, obj) {
        if (err) {
            console.error(err)
        } else {
            console.log(obj)
            for (let key in obj) {
                let record = obj[key]
                try {

                    record.system_password = mycrypto.decrypt(g_system_password, record.covered_system_password)
                    record.password = mycrypto.decrypt(g_system_password, record.covered_password)
                }
                catch (err) {
                    console.error(err)
                }

                g_all_records_map[record.index] = record //数据一直有，但只显示和当前密码对的

                if (record.system_password == g_system_password) {
                    prepend_record_ui(record)
                } else {
                    console.log('bad record', record)
                }
            }
        }
    })
}


function do_search_filter() {
    let keyword = $('#search_input').val()
    keyword = keyword.toLowerCase()
    let key_words = keyword.split(' ')
    console.log('search with', key_words)

    $('.item').each(function (index, element) {
        let ele = $(element)
        let title = ele.find('.item-title').text()
        let notes = ele.find('.my-input-notes').val()
        let under_mark = (title + ' ' + notes).toLowerCase()
        let flag = true
        console.log('againest', under_mark)

        key_words.forEach(function (word) {

            if (!under_mark.includes(word)) {
                flag = false
            }
        })

        if (flag) {
            ele.show()
        } else {
            ele.hide()
        }
    })

}