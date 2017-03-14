export default function (http) {
    const defaultPort = process.env.PORT || 80;
    const server = http.listen(defaultPort, () => {
        const host = server.address().address;
        const port = server.address().port;
        console.log("Improved Initiative listening at http://%s:%s", host, port);
    });
}
