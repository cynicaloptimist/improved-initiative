export default function (http) {
    const port = process.env.PORT || 80;
    const server = http.listen(port, function () {
        const host = server.address().address;
        const port = server.address().port;
        console.log("Improved Initiative listening at http://%s:%s", host, port);
    });

}