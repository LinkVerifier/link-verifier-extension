const SITE_URL = 'http://localhost:8081/'
const API_URL = 'http://localhost:8080/'
const content = document.getElementById('content');

chrome.runtime.sendMessage({type: 'popup', message: 'getUser'}, response => {
    if (response.token !== null && response.token !== undefined) createHeaderForLoggedIn(response.user);
    else createHeaderForNotLoggedIn();
});

const typesOfOpinions = [
    {'FRAUD':'negative'},
    {'INDECENT_CONTENT':'negative'},
    {'FAKE_NEWS':'negative'},
    {'VIRUS':'negative'},
    {'RELIABLE':'positive'},
    {'SAFE':'positive'},
    {'NEUTRAL': 'neutral'}
]

const createHeaderForLoggedIn = user => {
    var header = document.getElementById('header');
    var profile = document.createElement('div');
    profile.className = 'profile'; 

    var a = document.createElement('a');
    a.href = SITE_URL + 'users/' + user.id;
    a.innerHTML = user.username;
    a.target = '_blank';
    
    var imageCropper = document.createElement('div');
    imageCropper.className = 'image-cropper';
    
    var img = document.createElement('img');
    img.className = 'profile-image';
    img.src = user.profilePicture;

    imageCropper.appendChild(img);
    profile.appendChild(a);
    profile.appendChild(imageCropper);
    header.appendChild(profile);
    getStatsWindow();
}

const createHeaderForNotLoggedIn = () => {
    var header = document.getElementById('header');
    var login = document.createElement('div');
    login.className = 'login';
    var a = document.createElement('a');
    a.href = SITE_URL + 'login';
    a.innerHTML = 'Zaloguj się';
    a.target = '_blank';

    login.appendChild(a);
    header.appendChild(login);
    getStatsWindow();
}

document.getElementById('getStatsWindow').addEventListener("click", () => getStatsWindow());
document.getElementById('getOpinionsWindow').addEventListener("click", () => getOpinionsWindow());
document.getElementById('getRateWindow').addEventListener("click", () => getRateWindow());

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
        createSimpleDoughnutChart(response.link);
    });
}

const getOpinionsWindow = () => {
    console.log('opinions window')
    while (content.firstChild) {
        content.removeChild(content.lastChild);
    }
}

const getRateWindow = () => {
    console.log('rate window')
    while (content.firstChild) {
        content.removeChild(content.lastChild);
    }
}

var createSpinner = () => {
    var spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.id = 'loading-spinner';
    return spinner;
}

const circumference = 90 * 2 * Math.PI;

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
    var charts = document.createElement('div');
    charts.className = 'charts';
    content.appendChild(charts);
    var title = document.createElement('div');
    var doughtChartBackground = makeDoughnutChart('grey', 'progress-ring-circle', 1, charts, 100);
    var doughtChart = makeDoughnutChart('warning', 'progress-ring-circle', 1, charts, 0);
    var percent = (basicOpinions['positive'] / amuntOfReviews) * 100 | 0;
    animateCircle({
        circle: doughtChart.circle,
        percent: percent
    });
    setTimeout(() => {
        let className;
        if (percent < 35) className = 'danger';
        else if (percent < 50) className ='warnign';
        else if (percent < 75) className = 'caution' ;       
        else className = 'ok';
        doughtChart.svg.setAttribute('class', 'chart ' + className);
        //console.log(document.getElementsByTagName('header'));
    }, 500);
    setTimeout(() => {
        charts.style.top = '20px'
        title.className = 'title';
        title.innerHTML = 'STRONA POTENCJALNIE NIEBEZPIECZNA!';
        content.appendChild(title);
        setTimeout(() => title.style.top = '120px', 100);
        setTimeout(() => {
            charts.style.left = '50px';
            createTable(allOpinions);
        }, 1500);
    }, 900);

    animateNumbers(percent, charts);
}

var translateKeysToPolish = key => {
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

var createTable = allOpinions => {
    let i = 0;
    const amuntOfReviews = countAllOpinions(allOpinions);
    var tableBox = document.createElement('div');
    tableBox.className = 'table';
    content.appendChild(tableBox);
    var title = document.createElement('p');
    title.innerHTML = 'Szczegółowe dane:'
    tableBox.appendChild(title);
    var table = document.createElement('table');
    tableBox.appendChild(table);
    allOpinions.forEach(opinion => {
        var tr = document.createElement('tr');
        var tdName = document.createElement('td');
        var tdSVG = document.createElement('td');
        var tdPercent = document.createElement('td');
        tr.appendChild(tdName);
        tr.appendChild(tdSVG);
        tr.appendChild(tdPercent);

        tdName.innerHTML = translateKeysToPolish(Object.keys(opinion)[0]);

        var reviews = opinion[Object.keys(opinion)[0]]
        var percent = (reviews / amuntOfReviews) * 100 | 0;

        var line = document.createElement('div');
        var lineBG = document.createElement('div');
        lineBG.className = 'lineBG';
        line.className = 'line ' + Object.keys(opinion)[0];
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