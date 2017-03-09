import appInsights = require("applicationinsights");

export default function () {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        appInsights.setup().start();
    }
}