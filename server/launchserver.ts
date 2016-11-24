export default function (http) {
    var port = process.env.PORT || 80;
    var server = http.listen(port, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Improved Initiative listening at http://%s:%s', host, port);
    });

}