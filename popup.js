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

const countOpinions = opinions => {
    return opinions.reduce((previousValue, currentValue, index, array) => {
        previousValue += currentValue[Object.keys(currentValue)[0]];
        return previousValue;
    }, 0);
}

console.log();

const getStatsWindow = () => {
    console.log('stats window');
    while (content.firstChild) {
        content.removeChild(content.lastChild);
      }
    var spinner = createSpinner();
    content.appendChild(spinner);
    setTimeout(() => {
        content.removeChild(spinner);        
        createCircleSVG(getOpinions);
    }, 1000);

    return true;
}

const getOpinionsWindow = () => {
    console.log('opinions window')
}

const getRateWindow = () => {
    console.log('rate window')
}

// elements
var createSpinner = () => {
    var spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.id = 'loading-spinner';
    return spinner;
}


const circumference = 52 * 2 * Math.PI;

var createCircleSVG = opinions => {
    var i = opinions.length;
    const amuntOfReviews = countOpinions(getOpinions);
    var shift = 0;
    var charts = document.createElement('div');
    charts.className = 'charts';
    content.appendChild(charts);
    opinions.forEach(opinion => {
        console.log(opinion);
        console.log(Object.keys(opinion)[0]);
        var reviews = opinion[Object.keys(opinion)[0]]
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class','chart ' + Object.keys(opinion)[0]);
        svg.setAttribute('width','120');
        svg.setAttribute('height','120');
        svg.style.zIndex = i;

        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('class','progress-ring-circle');
        circle.setAttribute('stroke-width','10');
        circle.setAttribute('fill','transparent');
        circle.setAttribute('r','52');
        circle.setAttribute('cx','60');
        circle.setAttribute('cy','60');
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
    });
}

var animateCircle = data => {
    var percent = ((data.currentReviews + data.shift) / data.amuntOfReviews) * 100 | 0;
    console.log(percent)
    setTimeout(() => {
        const offset = circumference - percent * .75 / 100 * circumference;
        data.circle.style.strokeDashoffset = offset;
    }, data.delay * 50);
}