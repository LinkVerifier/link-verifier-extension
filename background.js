var URL;

//when tab is changed updates URL for popup.js
chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, currentTabInfo => {
            URL = currentTabInfo;
        })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    //checks if sender is popup.js
    if (request.type === 'popup') {
        console.log('message from popup');
        console.log(URL.url);
        fetch('https://reqres.in/api/users/1')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                sendResponse({message: data.data});
            }).catch(error => console.log(error));
    }

    //checks if sender is content.js
    if (request.type === 'content') {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            console.log('message from content');
            console.log(tabs[0].url);
            fetch('https://reqres.in/api/users/1')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                sendResponse({message: data.data});
            }).catch(error => console.log(error));
        });
    }

    return true;
});
