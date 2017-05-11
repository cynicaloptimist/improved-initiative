import appInsights = require("applicationinsights");

const filterSocketReporting = (envelope: ContractsModule.Envelope) => {
    const data = <ContractsModule.RequestData>envelope.data.baseData;
    if (data.url) {
        return data.url.indexOf("socket.io") === -1;
    }
    if (data.name) {
        return data.name.indexOf("socket.io") === -1;
    }
    return true;
}

export default function () {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
            .start();
        const client: any = appInsights.client;
        client.addTelemetryProcessor(filterSocketReporting);
    }
}
