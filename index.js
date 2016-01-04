var GCS_API_KEY = 'AIzaSyBrQcPqgRaTobJayI3i-hASr92NONPiask',
    GCS_CX = '008372849643028676407:wkc21kbf7ri',
    PORT = process.env.PORT || 8080,
    latestQueries = [],
    https = require('https'),
    express = require('express'),
    app = express();

app.get('/', function (req, res) {
    res.send('Usage: go to ' + req.headers.host + '/api/imagesearch/{your query} to get a JSON with results from Google Image Search. Optionally, add "?offset={number}" to paginate. Get a JSON with the latest 10 queries at ' + req.headers.host + '/api/latest/imagesearch.');
});

app.get('/api/latest/imagesearch', function(req, res) {
    res.send(latestQueries);
});

app.get('/api/imagesearch/*', function(req, res) {
    var search = req.params[0];
    var offset = req.query.offset ? req.query.offset * 10 + 1 : 1;
    var url = 'https://www.googleapis.com/customsearch/v1?q=' + search + '&cx=' + GCS_CX + '&num=10&searchType=image&start=' + offset + '&key=' + GCS_API_KEY;
    var request = https.get(url, function(httpResponse) {
        var body = '';
        httpResponse.on('data', function(chunk) {
            body += chunk;
        }).on('end', function() {
            latestQueries.unshift({term: search, when: new Date()});
            if (latestQueries.length == 11) { latestQueries.pop(); }
            var data = JSON.parse(body);
            var answer = [];
            if (data.error) {
                res.send({error: data.error});
            } else {
                if(data.items) {
                    data.items.forEach(function(element, index, array) {
                        answer.push({
                            url: element.link,
                            snippet: element.snippet,
                            thumbnail: element.image.thumbnailLink,
                            context: element.image.contextLink
                        });
                    });
                    res.send(answer);
                } else {
                    res.send({error: 'No results found.'});
                }
            }
        });
    });
    request.on('error', function(err) {
        res.send({error: err});
    });
});

app.listen(PORT, function() {
    console.log('Start listening on port ' + PORT);
});