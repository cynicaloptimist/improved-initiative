import appInsights = require("applicationinsights");

const filterSocketReporting = (envelope: ContractsModule.Envelope) => {
    const data: ContractsModule.RequestData = <ContractsModule.RequestData>envelope.data.baseData;
    if (data.url && data.url.indexOf("socket.io") > -1) {
        return false;        
    }
    if (data.name && data.name.indexOf("socket.io") > -1) {
        return false;
    }
    return true;
}

export default function () {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        
        const client: any = appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).getClient();
        client.addTelemetryProcessor(filterSocketReporting);
        appInsights.start();
    }
}
