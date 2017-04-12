import appInsights = require("applicationinsights");

const filterSocketReporting = (envelope: ContractsModule.Envelope) => {
    if (envelope.data.baseType !== "Microsoft.ApplicationInsights.RequestData") {
        return true;
    }
    const data = <ContractsModule.RequestData>envelope.data.baseData;
    return data.name.indexOf("socket.io") === -1;
}

export default function () {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
            .start();
        const client: any = appInsights.client;
        client.addTelemetryProcessor(filterSocketReporting);
    }
}
