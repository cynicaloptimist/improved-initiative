import appInsights = require('applicationInsights');

export default function () {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        appInsights.setup().start();
    }
}    