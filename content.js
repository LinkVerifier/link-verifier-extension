const DOMAIN = 'localhost:3000';
let currentURL;

const sendURL = () => {
    if (currentURL !== window.location.href) {
        currentURL = window.location.href;
        chrome.runtime.sendMessage({
            type: 'content',
            url: currentURL,
        }, response => {
            alert(response.message);
        });
    }
}

const updateUSER = () => {
    if (window.localStorage.getItem('user') !== null 
    && window.localStorage.getItem('user') !== undefined) chrome.storage.local.set({user: JSON.parse(window.localStorage.getItem('user'))});
    else chrome.storage.local.set({user: null});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'tabChanged') {
        sendURL();
        if (currentURL.includes(DOMAIN)) {
            updateUSER();
        }
    }
});

const alert = message => {
    var URL = window.location.href;
    var divId = 'link-verifier-c31d80e9-8bce-4d2a-b4ca-5d82c6536f1d';
    var body = document.body;
    var div = document.createElement('div');
    div.id = divId;
    div.textContent = URL
    /*
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
    div.style.color = 'white';
    */
}


