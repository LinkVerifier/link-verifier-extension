chrome.runtime.sendMessage({type: 'popup'}, response => {
    console.log(response)
    var body = document.body;
    var div = document.createElement('div');
    div.textContent = response.message.first_name;
    body.appendChild(div);
});