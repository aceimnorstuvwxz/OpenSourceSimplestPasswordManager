const Store = require('electron-store');
const store = new Store();
const { dialog, shell } = require('electron').remote
const jsonfile = require('jsonfile')
const mycrypto = require('./mycrypto')
const path = require('path')


let g_system_file_path
let g_system_password


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

    $('#btn_help').click(function () {
        shell.openExternal('https://github.com/fateleak/OpenSourceSimplestPasswordManager')
    })

    setTimeout(() => {
        on_enter_click()
    }, 100)

    $('#btn_add').click(on_add_record)
})

function check_file_state() {
    //检查文件的状态
    //用tooltip显示错误

}

function on_enter_click() {
    let file_path = $('#file_path').val()
    let password = $('#password').val()
    // check file

    // enter page
    g_system_file_path = file_path
    g_system_password = password
    console.log("enter with", file_path, password)

    on_enter_page()
}

function on_enter_page() {
    $('#welcome_page').remove()
    $('#main_page').show()
    $('#bottom_menu').show()
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

function on_add_record() {
    let new_item_element = $('#new_item_template').clone()
    new_item_element.removeAttr('id')
    new_item_element.web_record = {
        index: next_record_index(),
        title: "",
        username: "",
        password: "",
        system_password: g_system_password,
        covered_password: "",
        covered_system_password: mycrypto.encrypt(g_system_password, g_system_password),
        notes: ""
    }
    g_all_records_map[new_item_element.web_record.index] = new_item_element.web_record
    setup_record_ui(new_item_element)
    new_item_element.prependTo('#item_list')
    $('#item_list').collapsible('open', 0)
    $('.fixed-action-btn').closeFAB()
}

function setup_record_ui(item_element) {
    let record = item_element.web_record

    item_element.find('.item-index').text(`#${record.index}`)
    item_element.find('.item-title').text(record.title.length > 0 ? record.title : 'New record')
    item_element.find('.my-input-title').val(`${record.title}`).keyup(function (event) {
        let title = event.target.value
        item_element.find('.item-title').text(title.length > 0 ? title : 'New record')
    })
    item_element.find('.my-input-username').val(`${record.username}`)
    item_element.find('.my-input-password').val(`${record.password}`)
    item_element.find('.my-input-notes').val(`${record.notes}`)

    item_element.find('.mybtn-save').click(function () {
        let title = item_element.find('.my-input-title').val()
        let username = item_element.find('.my-input-username').val()
        let password = item_element.find('.my-input-password').val()
        console.log(title, username, password)
        if (title.length > 0 && username.length > 0 && password.length > 0) {
            item_element.web_record.title = title
            item_element.web_record.username = username
            item_element.web_record.password = password
            item_element.web_record.notes = item_element.find('.my-input-notes').val()
            item_element.web_record.covered_password = mycrypto.encrypt(g_system_password, item_element.web_record.password)
            save()
        } else {
            console.log("input field check fail")
        }
    })

}


function save() {
    //save all records
    const temp_all_records = Object.assign({}, g_all_records_map);

    for (let key in temp_all_records) {
        let temp_rec = temp_all_records[key]
        delete temp_rec.password
        delete temp_rec.system_password
    }
    console.log('save', g_system_file_path, temp_all_records)

    jsonfile.writeFile(g_system_file_path , temp_all_records, {flag: 'w'}, function (err) {
        if (err) {
            console.error(err)
        }
    })
}