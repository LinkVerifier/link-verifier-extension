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
        fetch('https://reqres.in/api/users/1')
            .then(res => res.json())
            .then(data => {
                chrome.storage.local.get(['user'], user => {
                    console.log(user.user);
                    sendResponse({
                        user: user.user,
                        message: data.data
                    });
                });
            }).catch(error => console.log(error));
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
            .catch(error => console.log(error))

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
