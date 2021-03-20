//sends URL to extension background
chrome.runtime.sendMessage({
    type: 'content',
    url: window.location.href
}, response => {
    console.log(response.message.first_name);
});



/*var URL = window.location.href;
var divId = 'link-verifier-c31d80e9-8bce-4d2a-b4ca-5d82c6536f1d';
var body = document.body;
var div = document.createElement('div');
div.id = divId;
div.textContent = URL
//div styles

console.log(div);
document.body.appendChild(div);
div.style.all = 'unset';
div.style.position = 'absolute';
div.style.top = '0';
div.style.bottom = '0';
div.style.width = 'calc(100% - 40px)';
div.style.height = '20px';
div.style.zIndex = '10000';
div.style.margin = '10px';
div.style.padding = '10px';
div.style.borderRadius = '30px 30px 30px 30px';
div.style.backgroundColor = 'rgb(161, 0, 0)'
div.style.color = 'white';*/