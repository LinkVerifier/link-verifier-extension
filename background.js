const API_URL = "http://localhost:8080/";

// when tab is changed updates URL for popup.js
chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, currentTabInfo => {
            if(currentTabInfo.url) chrome.storage.local.set({URL: currentTabInfo.url});
        })
});

// listens URL changes at tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
            type: 'tabChanged'
        });
    }
});

// listens messages from popup and content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // checks if sender is popup.js
    if (request.type === 'popup') {

        // get user info
        if (request.message == 'getUser') {
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
                        sendResponse({
                            token: token.token,
                            user: data
                        })
                    }).catch(error => console.log(error));
                }
            });
        }

        // get stats
        else if (request.message == 'getStats') {
            chrome.storage.local.get(['URL'], url => {
                console.log(url.URL);
                fetch(API_URL + 'links', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "linkName": url.URL,
                        "deliveryDate": Date.now()
                    })
                }).then(res => { 
                    return res.text();
                }).then(id => {
                    fetch(API_URL + 'links/' + id)
                    .then(res => res.json())
                    .then(data => {
                        sendResponse({link: data, id: id});
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            })
        } 

        // get user by ID
        else if (request.message == 'getUserById') {
            fetch(API_URL + 'users/' + request.id)
            .then(res => res.json())
            .then(data => {
                sendResponse({user: data});
            }).catch(error => console.log(error));
        }

        // add opinion
        else if (request.message == 'addOpinion') {
            console.log(request.opinion);
            chrome.storage.local.get(['token'], token => {
                if (token.token === null || token.token === undefined) {
                    sendResponse({
                        token: null,
                    });
                } else {
                    fetch(API_URL + 'links/' + request.id + '/comments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token.token
                        },
                        body: JSON.stringify({
                            "opinion": request.opinion,
                            "date": Date.now(),
                            "comment": ''
                        })
                    }).then(res => res.json())
                    .then(data => sendResponse(data))
                    .catch(error => console.log(error));
                }
            })
        }
    }

    // checks if sender is content.js
    if (request.type === 'content') {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            if(request.url) chrome.storage.local.set({URL: request.url});
            // send request to serwer
            fetch(API_URL + 'links', {
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
                fetch(API_URL + 'links/' + id)
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