chrome.runtime.sendMessage({type: 'popup'}, response => {
    console.log(response)
    var body = document.body;
    var div = document.createElement('div');
    console.log(response.user);
    if (response.user !== null && response.user !== undefined) div.textContent = response.message.first_name +'\n'+ 'ZALOGOWANO!';
    else div.textContent = response.message.first_name +'\n'+ 'WYLOGOWANO';
    body.appendChild(div);
});