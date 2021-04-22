const API_URL = "http://localhost:8080/";
var URL;
// when tab is changed updates URL for popup.js
chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, currentTabInfo => {
            URL = currentTabInfo;
        })
})

// listens messages from popup and content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // checks if sender is popup.js
    if (request.type === 'popup') {
        
        // get user info
        chrome.storage.local.get(['token'], token => {
            if (token.token === null || token.token === undefined) {
                sendResponse({
                    token: null,
                });
            } else {
                fetch(API_URL + 'users/get_user', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token.token,
                        'Content-Type': 'application/json'
                    }
                }).then(response => {
                    return response.json()
                }).then(data => {
                    console.log('USER');
                    console.log(data);
                    sendResponse({
                        token: token.token,
                        user: data
                    })
                }).catch(error => console.log(error));
            }
        });
    }

    // checks if sender is content.js
    if (request.type === 'content') {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            console.log(request.url);
            
            // send request to serwer
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "linkName": request.url,
                    "deliveryDate": Date.now()
                })
            }).then(res => { 
                return res.text();
            }).then(id => {
                fetch(API_URL + `links/${id}`)
                .then(res => res.json())
                .then(data => {
                    sendResponse({message: data});
                }).catch(error => console.log(error));
            })
            .catch(error => console.log(error));

        });
    }
    return true;
});


// listens changes at tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
            type: 'tabChanged'
        });
    }
});
