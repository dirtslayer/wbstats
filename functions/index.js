const functions = require('firebase-functions');
const axios = require('axios').default;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const players = [
    'https://stats.warbrokers.io/players/i/5aeba7b4fd3c7a805dbbd69d',
    "https://stats.warbrokers.io/players/i/5f1cf600fe3c7a6b2779e6cf",
    'https://stats.warbrokers.io/players/i/5adfabbcd142af4c470fa9e8',
    'https://stats.warbrokers.io/players/i/5af610befe3c7ab3217b23c6',
    'https://stats.warbrokers.io/players/i/5be8a5fcfe3c7aec74221544',
    'https://stats.warbrokers.io/players/i/5c0dec40d142af5342e2090a',
    'https://stats.warbrokers.io/players/i/5c4bf969d142aff0038b4568',
    'https://stats.warbrokers.io/players/i/5d58a71bfe3c7ae35b43cfaf',
    'https://stats.warbrokers.io/players/i/5d7d4272bfea71030c6dffca',
    'https://stats.warbrokers.io/players/i/5de7db91fe3c7a6e5f545a5e',
    'https://stats.warbrokers.io/players/i/5ebdd30ebfea711064e513ba',
    'https://stats.warbrokers.io/players/i/5ebf1f8efe3c7ac812026564',
    'https://stats.warbrokers.io/players/i/5ec17660d142af8961790ab9',
    'https://stats.warbrokers.io/players/i/5ee86b87fe3c7a5e7aeec358',
    'https://stats.warbrokers.io/players/i/5f1458f6d142afcc52e44be0',
    'https://stats.warbrokers.io/players/i/5f2f9ee9bfea71685aa1e3f2'
    
];

async function getpage(url) {
    try {
        return await axios.get(url)
    } catch (error) {
        return Promise.reject( console.log(error));
    }
}

const xpathfor = {
    "Name": '/html/body/div[2]/div[1]/div/text()',
    "Kills": '//*[@id="player-details-summary-grid"]/div[1]/div[2]',
    "Deaths": '//*[@id="player-details-summary-grid"]/div[2]/div[2]',
    "Weapon Kills": '//*[@id="player-details-summary-grid"]/div[4]/div[2]',
    "Vehicle Kills": '//*[@id="player-details-summary-grid"]/div[5]/div[2]',
    "Damage Dealt": '//*[@id="player-details-summary-grid"]/div[6]/div[2]',
    "Experience": '//*[@id="player-details-summary-grid"]/div[7]/div[2]',
    "Head Shots": '//*[@id="player-details-summary-grid"]/div[8]/div[2]',
    "Battle Royale Wins": '//*[@id="player-details-summary-grid"]/div[9]/div[2]',
    "Death Match Wins": '//*[@id="player-details-summary-grid"]/div[10]/div[2]',
    "Missile Launch Wins": '//*[@id="player-details-summary-grid"]/div[11]/div[2]',
    "Package Drop Wins": '//*[@id="player-details-summary-grid"]/div[12]/div[2]',
    "Vehicle Escort Wins": '//*[@id="player-details-summary-grid"]/div[13]/div[2]'
}

const resultsfor = {
    "Date": "unset",
    "Name": "unset",
    "Kills": "unset",
    "Deaths": "unset",
    "Weapon Kills": "unset",
    "Vehicle Kills": "unset",
    "Damage Dealt": "unset",
    "Experience": "unset",
    "Head Shots": "unset",
    "Battle Royale Wins": "unset",
    "Death Match Wins": "unset",
    "Missile Launch Wins": "unset",
    "Package Drop Wins": "unset",
    "Vehicle Escort Wins": "unset"
}

function trimfixnode(v) {
    if (v._value.nodes[0].innerHTML)
        return v._value.nodes[0].innerHTML.trim().replace(/,/g, '');
    else
        return v._value.nodes[0].textContent.trim().replace(/,/g, '');
}


async function getallresults(both=true) {
    toreta = '';
    const results = [];
    var i;
    for (i = 0; i < players.length; i++) {
        results.push( getresult(players[i],both) );  
    }
    return (await Promise.all(results)).join('');
}

async function getresult(p,both = true) {

    const page = await getpage(p);
    const dom = new JSDOM(page.data);
    const doc = dom.window.document;

    toretb = '';
    toretbb = '';


    
// regular stats section 
        for (var xpath in xpathfor) {
            val = doc.evaluate(xpathfor[xpath], doc, null, 0, null);
            //val = trimfixnode(val);
            if (both || xpath === 'Name') {
            toretb += xpath + ": " + trimfixnode(val) + '\n';
            }    

        }
    

 // daily medals section   
    dailys_xp = "//*[@class='player-details-daily-circle-container']";
    dailys_node = doc.evaluate(dailys_xp, doc, null, 0, null);
    var node = null;
    node = dailys_node.iterateNext();
    while ( node )  {
        // place, category
        toretbb += node.children[0].textContent + ' ' + node.children[1].children[0].textContent + '\n';
        node = dailys_node.iterateNext();
    }
    //console.log('b: ' + toretb);

        if ( (toretbb !== '') || both ) {
        return  toretb + toretbb + '\n';
        } else {
        return '';
        }
}

 const runtimeOpts = {
    timeoutSeconds: 539,
    memory: '1GB'
  }

 exports.milanstats = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
    toretc = 'unset!';
    toretc = await getallresults();
    response.contentType("text/plain");
    response.send(toretc);
    
  });

  exports.metallurgy = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
    toretc = 'unset!';
    toretc = await getallresults(false);
    response.contentType("text/plain");
    response.send(toretc);
    
  });
 
