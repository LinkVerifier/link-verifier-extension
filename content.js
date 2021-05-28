const DOMAIN = 'localhost:8081';
const SITE_URL = 'http://localhost:8081/'
let currentURL;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'tabChanged') {
        sendURL();
        if (currentURL.includes(DOMAIN)) {
            updateUSER();
        }
    }
});

const sendURL = () => {
    if (currentURL !== window.location.href) {
        currentURL = window.location.href;
        chrome.runtime.sendMessage({
            type: 'content',
            url: currentURL,
        }, response => {
            if (response.message.comments.length !== 0) alert(response.message);
        });
    }
}

const updateUSER = () => {
    if (window.localStorage.getItem('token') !== null 
    && window.localStorage.getItem('token') !== undefined) chrome.storage.local.set({token: window.localStorage.getItem('token')});
    else chrome.storage.local.set({token: null});
}

const alert = link => {
    var banner = document.createElement('div');
    var content = document.createElement('div');
    var close = document.createElement('span');
    var info = document.createElement('p');
    var i = document.createElement('i');
    var a = document.createElement('a');

    banner.className = 'banner-content-1e831b5de1d322b98a82b551353a3cc8 ' + getColor(link.rating);
    content.className = 'content';
    close.className = 'close';
    i.className = getIcon(link.rating); 

    close.innerHTML = '&times;'
    info.innerHTML = getSentence(link.rating);
    a.innerHTML = 'szczegóły';
    a.href = SITE_URL + 'links/' + link.id;
    a.target = '_blank';

    close.addEventListener('click', () => banner.style.display = 'none');

    if (link.rating > 75) {
        var bg = document.createElement('div');
        bg.className = 'background-danger-1e831b5de1d322b98a82b551353a3cc8';
        close.addEventListener('click', () => bg.style.display = 'none');
        document.body.appendChild(bg);
    }
    if (link.rating < 35) {
        setTimeout(() => banner.style.animation = 'dropUp-1e831b5de1d322b98a82b551353a3cc8 .5s ease-in-out', 3000);
        setTimeout(() => banner.style.display = 'none', 3500);
    }

    content.appendChild(i);
    content.appendChild(info);
    content.appendChild(a);
    banner.appendChild(close);
    banner.appendChild(content);
    document.body.appendChild(banner);

    // brut css injection
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css';
    document.getElementsByTagName("head")[0].appendChild(css);
}

const getSentence = rating => {
    if (rating < 35) return 'Strona bezpieczna';
    if (rating < 50) return 'Strona potencjalnie niebezpieczna, zachowaj ostrożność';
    if (rating < 75) return 'Strona niebezpieczna, zachowaj ostrożność!';
    return 'Uwaga! Strona niebezpieczna, zachowaj ostrożność!';
}

const getIcon = rating => {
    if (rating < 35) return 'bi bi-check-circle';
    if (rating < 50) return 'bi bi-exclamation-circle';
    if (rating < 75) return 'bi bi-exclamation-triangle';
    return 'bi bi-exclamation-triangle-fill';
}

const getColor = rating => {
    if (rating < 35) return 'ok-1e831b5de1d322b98a82b551353a3cc8';
    if (rating < 50) return 'caution-1e831b5de1d322b98a82b551353a3cc8';
    if (rating < 75) return 'warning-1e831b5de1d322b98a82b551353a3cc8';
    return 'danger-1e831b5de1d322b98a82b551353a3cc8';
}