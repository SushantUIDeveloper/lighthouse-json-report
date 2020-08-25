const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const argv = require('yargs').argv;
const url = require('url');
const fs = require('fs');

const launchChromeAndRunLighthouse = url => {
    return chromeLauncher.launch().then(chrome => {
        const opts = {
            port: chrome.port
        };
        return lighthouse(url, opts).then(results => {
            return chrome.kill().then(() => {
                return {
                    js: results.lhr,
                    json: results.report
                };
            });
        });
    });
};


if (argv.url) {
    const urlObj = new URL(argv.url);
    let dirName = urlObj.host.replace('www.', '');
    if (urlObj.pathname !== "/") {
        dirName = dirName + urlObj.pathname.replace(/\//g, "_");
    }
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
    }

    launchChromeAndRunLighthouse(argv.url).then(results => {
        fs.writeFile(
            `${dirName}/${results.js["fetchTime"].replace(/:/g, "_")}.json`,
            results.json,
            err => {
                if (err) throw err;
            }
        );
    });
} else {
    throw "You haven't passed a URL to Lighthouse";
}