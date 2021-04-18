chrome.runtime.sendMessage({type: 'popup'}, response => {
    console.log(response)
    var body = document.body;
    var div = document.createElement('div');
    console.log(response.user);
    if (response.user !== null && response.user !== undefined) div.textContent = response.message.first_name +'\n'+ 'ZALOGOWANO!';
    else div.textContent = response.message.first_name +'\n'+ 'WYLOGOWANO';
    body.appendChild(div);
});

const content = document.getElementById('content');
const opinions = [
    {'FRAUD':'negative'},
    {'INDECENT_CONTENT':'negative'},
    {'FAKE_NEWS':'negative'},
    {'VIRUS':'negative'},
    {'RELIABLE':'positive'},
    {'SAFE':'positive'},
    {'NEUTRAL': 'neutral'}
]
const getOpinions = [
    {'FRAUD':20},
    {'INDECENT_CONTENT':20},
    {'FAKE_NEWS':20},
    {'VIRUS':20},
    {'RELIABLE':20},
    {'SAFE':20},
    {'NEUTRAL':20}
]

document.getElementById('getStatsWindow').addEventListener("click",  () => getStatsWindow());
document.getElementById('getOpinionsWindow').addEventListener("click",  () => getOpinionsWindow());
document.getElementById('getRateWindow').addEventListener("click",  () => getRateWindow());

const countAllOpinions = allOpinions => {
    return allOpinions.reduce((previousValue, currentValue, index, array) => {
        previousValue += currentValue[Object.keys(currentValue)[0]];
        return previousValue;
    }, 0);
}

const countBasicOpinions = allOpinions => {
    return allOpinions.reduce((previousValue, currentValue, index, array) => {
        opinions.forEach(element => {
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

const getStatsWindow = () => {
    console.log('stats window');
    while (content.childNodes.length > 0) {
        content.removeChild(content.lastChild);
    } 
    var spinner = createSpinner();
    content.appendChild(spinner);
    setTimeout(() => {
        while (content.childNodes.length > 0) {
            content.removeChild(content.lastChild);
        }    
        createSimpleDoughnutChart(getOpinions);
    }, 1000);

    return true;
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

var makeDoughtChart = (classSVG, classCircle, zIndex, parent, startValue) => {

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

var createSimpleDoughnutChart = allOpinions => {
    const amuntOfReviews = countAllOpinions(allOpinions);
    const basicOpinions = countBasicOpinions(allOpinions);
    var charts = document.createElement('div');
    charts.className = 'charts';
    content.appendChild(charts);
    var doughtChartBackground = makeDoughtChart('grey', 'progress-ring-circle', 1, charts, 100);
    var doughtChart = makeDoughtChart('warning', 'progress-ring-circle', 1, charts, 0);
    var percent = (basicOpinions['positive'] / amuntOfReviews) * 100 | 0;
    animateCircle({
        circle: doughtChart.circle,
        percent: percent
    });
    console.log(percent);
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
        //doughtChartBackground.svg.style.left = '50px';
        //doughtChart.svg.style.left = '50px';
    }, 2000)

    animateNumbers(percent, charts);
}


var createCircleSVG = allOpinions => {
    var i = allOpinions.length;
    const amuntOfReviews = countAllOpinions(getOpinions);
    var shift = 0;
    var charts = document.createElement('div');
    charts.className = 'charts';
    content.appendChild(charts);
    allOpinions.forEach(opinion => {
        console.log(opinion);
        console.log(Object.keys(opinion)[0]);
        var reviews = opinion[Object.keys(opinion)[0]]
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class','chart ' + Object.keys(opinion)[0]);
        svg.setAttribute('width','200');
        svg.setAttribute('height','200');
        svg.style.zIndex = i;

        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('class','progress-ring-circle');
        circle.setAttribute('stroke-width','10');
        circle.setAttribute('fill','transparent');
        circle.setAttribute('r','90');
        circle.setAttribute('cx','100');
        circle.setAttribute('cy','100');
        circle.style.strokeDasharray = `${circumference} ${circumference}`
        circle.style.strokeDashoffset = circumference;

        svg.appendChild(circle);
        charts.appendChild(svg);

        animateCircle({
            circle: circle,
            amuntOfReviews: amuntOfReviews,
            delay: opinions.length - i + 1,
            currentReviews : reviews,
            shift: shift
        })
        shift += reviews;
        i--;
        setTimeout(() => {
            svg.style.left = '50px';
        }, 2000)
    });
    animateNumbers(100);
}

var animateCircle = data => setTimeout(() => {
        const offset = circumference - data.percent / 100 * circumference;
        data.circle.style.strokeDashoffset = offset;
    },  100);

var animateNumbers = (data, charts) => {
    var number = document.createElement('p');
    charts.appendChild(number);
    const animateDelayNumber = (currentNumber, data) => {
        number.innerHTML = currentNumber + '%';
        if(currentNumber < data) {
            setTimeout(() => {
                animateDelayNumber(currentNumber+=1, data);
            },  10);
        }
    }
    animateDelayNumber(0, data);
    setTimeout(() => {
        //number.style.left = '150px';
    },  2000);
}