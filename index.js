// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const Store = require('electron-store');
const store = new Store();
const {dialog} = require('electron').remote

let g_file_path
let g_password


document.addEventListener('DOMContentLoaded', function () {

    let file_path = store.get('s_file_path')

    if (file_path && file_path.length > 0) {
        $('#file_path').val(file_path)
    } 
    $('#choose_file').click(function(event) {
        let selected_path = dialog.showOpenDialog({properties: ['openFile']}) //, 'openDirectory'
        if (selected_path.length > 0) {
            file_path = selected_path[0]
            $('#file_path').val(file_path)
            store.set('s_file_path', file_path)
        }
    })

    $('#enter').click(on_enter_click)
})

function check_file_state(){
    //检查文件的状态
    //用tooltip显示错误

}

function on_enter_click(){
    let file_path = $('#file_path').val()
    let password = $('#password').val()
    // check file

    // enter page
    g_file_path = file_path
    g_password = password
    console.log("enter with", file_path, password)

    on_enter_page()
}

function on_enter_page(){
    $('#welcome_page').remove()
    $('#main_page').show()
}