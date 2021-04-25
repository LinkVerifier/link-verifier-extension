const SITE_URL = 'http://localhost:8081/'
const API_URL = 'http://localhost:8080/'
const content = document.getElementById('content');

const typesOfOpinions = [
    {'FRAUD':'negative'},
    {'INDECENT_CONTENT':'negative'},
    {'FAKE_NEWS':'negative'},
    {'VIRUS':'negative'},
    {'RELIABLE':'positive'},
    {'SAFE':'positive'},
    {'NEUTRAL': 'neutral'}
]

const translateKeysToPolish = key => {
    switch (key) {
        case 'FRAUD':return 'Oszustwo';
        case 'INDECENT_CONTENT':return 'Nieprzyzwoite treści';
        case 'FAKE_NEWS':return 'Fałszywe informacje';
        case 'VIRUS':return 'Wirusy';
        case 'RELIABLE':return 'Uczciwa';
        case 'SAFE':return 'Bezpieczna';
        case 'NEUTRAL':return 'Neutralna';
        default: return '';
    }
}

chrome.runtime.sendMessage({type: 'popup', message: 'getUser'}, response => {
    if (response.token !== null && response.token !== undefined) createHeaderForLoggedIn(response.user);
    else createHeaderForNotLoggedIn();
});

document.getElementById('getStatsWindow').addEventListener('click', () => getStatsWindow());
document.getElementById('getOpinionsWindow').addEventListener('click', () => getOpinionsWindow());
document.getElementById('getRateWindow').addEventListener('click', () => getRateWindow());

/*
  _     _ _______ _______ ______  _______  ______
 |_____| |______ |_____| |     \ |______ |_____/
 |     | |______ |     | |_____/ |______ |    \_

*/

const createHeaderForNotLoggedIn = () => {
    var header = document.getElementById('header');
    var login = document.createElement('div');
    var a = document.createElement('a');

    login.className = 'login';
    a.href = SITE_URL + 'login';
    a.innerHTML = 'Zaloguj się';
    a.target = '_blank';

    login.appendChild(a);
    header.appendChild(login);
    getStatsWindow();
}

const createHeaderForLoggedIn = user => {
    var header = document.getElementById('header');
    var profile = document.createElement('div');
    var a = document.createElement('a');
    var imageCropper = document.createElement('div');
    var img = document.createElement('img');

    profile.className = 'profile'; 
    a.href = SITE_URL + 'users/' + user.id;
    a.innerHTML = user.username;
    a.target = '_blank';
    imageCropper.className = 'image-cropper';
    img.className = 'profile-image';
    img.src = 'data:'+user.profilePicture.type+';base64,'+user.profilePicture.data;

    imageCropper.appendChild(img);
    profile.appendChild(a);
    profile.appendChild(imageCropper);
    header.appendChild(profile);
    getStatsWindow();
}

/*
 _______  _____  _____ __   _ __   _ _______  ______
 |______ |_____]   |   | \  | | \  | |______ |_____/
 ______| |       __|__ |  \_| |  \_| |______ |    \_

*/

var createSpinner = () => {
    var spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.id = 'loading-spinner';
    return spinner;
}

/*
 _______ _______ _______ _______ _______      _  _  _ _____ __   _ ______   _____  _  _  _
 |______    |    |_____|    |    |______      |  |  |   |   | \  | |     \ |     | |  |  |
 ______|    |    |     |    |    ______|      |__|__| __|__ |  \_| |_____/ |_____| |__|__|
                                                                                          
*/

const circumference = 90 * 2 * Math.PI;

const getStatsWindow = () => {
    console.log('stats window');
    while (content.childNodes.length > 0) {
        content.removeChild(content.lastChild);
    } 
    var spinner = createSpinner();
    content.appendChild(spinner);
    chrome.runtime.sendMessage({type: 'popup', message: 'getStats'}, response => {
        while (content.childNodes.length > 0) {
            content.removeChild(content.lastChild);
        }
        if (response.link.error) {
            var contentStats = document.createElement('div');
            var title = document.createElement('div');
            var title2 = document.createElement('div');
            var i = document.createElement('i');
            
            contentStats.className = 'content';
            title.className = 'title';
            title2.className = 'title';
            i.className = 'bi bi-x-circle danger';
            title.style.top = '130px';
            title.style.padding = '80px';
            title2.style.top = '170px';
            title2.style.padding = '80px';
            title2.style.fontSize = 'small';
            title.innerHTML = 'Wystąpił błąd, spróbuj ponownie poźniej...';
            title2.innerHTML = 'Nasza usługa nie obsługuje domen lokalnych, sprawdź czy na takiej się nie znajdujesz.';
            
            contentStats.appendChild(i);
            contentStats.appendChild(title);
            contentStats.appendChild(title2);
            content.appendChild(contentStats);
        } else if (response.link.comments === null || response.link.comments === []) {
            var contentStats = document.createElement('div');
            var title = document.createElement('div');
            var a = document.createElement('a');
            var i = document.createElement('i');
            
            contentStats.className = 'content';
            title.className = 'title';
            a.className = 'title';
            i.className = 'bi bi-info-circle grey';
            title.style.top = '150px';
            title.style.padding = '60px';
            a.style.top = '250px';
            a.style.fontSize = 'small';
            a.href = 'http://localhost:8081/links/' + response.id;
            a.target = '_blank';
            title.innerHTML = 'Strona aktualnie nie posiada, żadnych opinii.';
            a.innerHTML = 'Bądź pierwszą osobą, która wystawi opinię!';
            
            contentStats.appendChild(i);
            contentStats.appendChild(title);
            contentStats.appendChild(a);
            content.appendChild(contentStats);
        } else {
            createSimpleDoughnutChart(response.link);  
        }
        
    });
}

var makeDoughnutChart = (classSVG, classCircle, zIndex, parent, startValue) => {

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class','chart ' + classSVG);
    svg.setAttribute('width','200');
    svg.setAttribute('height','200');
    svg.style.zIndex = zIndex;

    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('class', classCircle);
    circle.setAttribute('stroke-width','10');
    circle.setAttribute('fill','transparent');
    circle.setAttribute('r','90');
    circle.setAttribute('cx','100');
    circle.setAttribute('cy','100');
    circle.style.strokeDasharray = `${circumference} ${circumference}`
    circle.style.strokeDashoffset = circumference - startValue / 100 * circumference;

    svg.appendChild(circle);
    parent.appendChild(svg);

    return {svg: svg, circle: circle};
}

var createSimpleDoughnutChart = link => {

    const allOpinions = countOpinonsForEachCategory(link.comments);
    const amuntOfReviews = countAllOpinions(allOpinions);
    const basicOpinions = countBasicOpinions(allOpinions);

    var contentStats = document.createElement('div');
    var charts = document.createElement('div');
    var title = document.createElement('div');
    var doughtChartBackground = makeDoughnutChart('grey', 'progress-ring-circle', 1, charts, 100);
    var doughtChart = makeDoughnutChart('warning', 'progress-ring-circle', 1, charts, 0);
    var percent = (basicOpinions.positive / (amuntOfReviews - basicOpinions.neutral)) * 100 | 0;
    var i = document.createElement('i'); 
    contentStats.className = 'content';
    charts.className = 'charts';

    content.appendChild(contentStats);
    contentStats.appendChild(charts);
    
    animateCircle({
        circle: doughtChart.circle,
        percent: percent
    });
    setTimeout(() => {
        let className;
        title.className = 'title';
        if (percent < 35) {
            title.innerHTML = 'Uwaga! Strona niebezpieczna, zachowaj ostrożność!';
            i.className = 'bi bi-exclamation-triangle-fill danger';
            className = 'danger';
        }
        else if (percent < 50) {
            title.innerHTML = 'Strona niebezpieczna, zachowaj ostrożność!';
            i.className = 'bi bi-exclamation-triangle warning';
            className ='warning';
        }
        else if (percent < 75) {
            title.innerHTML = 'Zachowaj ostrożność';
            i.className = 'bi bi-exclamation-circle caution';
            className = 'caution';
        }       
        else {
            title.innerHTML = 'Strona bezpieczna';
            i.className = 'bi bi-check-circle ok';
            className = 'ok';
        }
        doughtChart.svg.setAttribute('class', 'chart ' + className);
    }, 500);
    setTimeout(() => {
        charts.style.top = '20px'
        title.appendChild(i);
        contentStats.appendChild(title);
        setTimeout(() => title.style.top = '80px', 100);
        setTimeout(() => {
            charts.style.left = '20px';
            createTable(allOpinions, contentStats);
        }, 1500);
    }, 900);

    animateNumbers(percent, charts);
}

var createTable = (allOpinions, contentStats) => {
    let i = 0;
    const amuntOfReviews = countAllOpinions(allOpinions);
    var tableBox = document.createElement('div');
    var title = document.createElement('p');
    var table = document.createElement('table');
    
    tableBox.className = 'table';
    title.innerHTML = 'Szczegółowe dane: (' +amuntOfReviews + ' opinii)';

    contentStats.appendChild(tableBox);
    tableBox.appendChild(title);
    tableBox.appendChild(table);

    allOpinions.forEach(opinion => {
        var tr = document.createElement('tr');
        var tdName = document.createElement('td');
        var tdSVG = document.createElement('td');
        var tdPercent = document.createElement('td');
        var reviews = opinion[Object.keys(opinion)[0]]
        var percent = (reviews / amuntOfReviews) * 100 | 0;
        var line = document.createElement('div');
        var lineBG = document.createElement('div');

        tdName.innerHTML = translateKeysToPolish(Object.keys(opinion)[0]);
        lineBG.className = 'lineBG';
        line.className = 'line ' + Object.keys(opinion)[0];

        tr.appendChild(tdName);
        tr.appendChild(tdSVG);
        tr.appendChild(tdPercent);
        tdSVG.appendChild(lineBG);
        tdSVG.appendChild(lineBG);
        tdSVG.appendChild(line);

        setTimeout(() => {
            table.appendChild(tr);
            animateLine({
                percent: percent,
                line: line
            });
            animateNumbers(percent, tdPercent);
        }, i*100 + 300);
        i++;
    });
}

var animateLine = data => setTimeout(() => {
    const x = data.percent * .65 + 5 | 0;
    data.line.style.width = x+'px';
},  100);

var animateCircle = data => setTimeout(() => {
    const offset = circumference - data.percent / 100 * circumference;
    data.circle.style.strokeDashoffset = offset;
},  100);

var animateNumbers = (data, parent) => {
    var number = document.createElement('p');
    parent.appendChild(number);
    const animateDelayNumber = (currentNumber, data) => {
        number.innerHTML = currentNumber + '%';
        if(currentNumber < data) {
            setTimeout(() => {
                animateDelayNumber(currentNumber+=1, data);
            },  10);
        }
    }
    animateDelayNumber(0, data);
}

/*
  _____   _____  _____ __   _ _____  _____  __   _ _______
 |     | |_____]   |   | \  |   |   |     | | \  | |______
 |_____| |       __|__ |  \_| __|__ |_____| |  \_| ______|
                                                          
*/

const getOpinionsWindow = () => {
    console.log('opinions window')
    while (content.firstChild) {
        content.removeChild(content.lastChild);
    }
}

/*
  ______ _______ _______ _______
 |_____/ |_____|    |    |______
 |    \_ |     |    |    |______
                                                                                                          
*/

const getRateWindow = () => {
    console.log('rate window')
    while (content.firstChild) {
        content.removeChild(content.lastChild);
    }
}

/*
 _______ _     _ __   _ _______ _______ _____  _____  __   _ _______
 |______ |     | | \  | |          |      |   |     | | \  | |______
 |       |_____| |  \_| |_____     |    __|__ |_____| |  \_| ______|
                                                                    
*/

const countAllOpinions = allOpinions => {
    return allOpinions.reduce((previousValue, currentValue, index, array) => {
        previousValue += currentValue[Object.keys(currentValue)[0]];
        return previousValue;
    }, 0);
}

const countBasicOpinions = allOpinions => {
    return allOpinions.reduce((previousValue, currentValue, index, array) => {
        typesOfOpinions.forEach(element => {
            if (Object.keys(element)[0] === Object.keys(currentValue)[0]) {
                previousValue[element[Object.keys(element)[0]]] += currentValue[Object.keys(currentValue)[0]];
                return previousValue;
            }
        });
        return previousValue;
    }, {positive: 0, negative: 0, neutral: 0});
}

const getMaxValue = opinions => {
    return Object.keys(opinions).reduce((previousValue, currentValue, index, array) => {
        let x = {};
        if(opinions[currentValue] > previousValue[Object.keys(previousValue)[0]]) {
            x[currentValue] = opinions[currentValue];
            return x;
        }
        return previousValue;
    }, {a: 0});
}

const countOpinonsForEachCategory = comments => {
    comments = comments.reduce((previousValue, currentValue, index, array) => {
        previousValue[currentValue.opinion.name] = previousValue[currentValue.opinion.name] + 1;
        return previousValue;
    }, {'FRAUD':0,'INDECENT_CONTENT':0,'FAKE_NEWS':0,'VIRUS':0,'RELIABLE':0,'SAFE':0,'NEUTRAL':0});
    return Object.keys(comments).map(e => ( {[e]: comments[e]} ));
}