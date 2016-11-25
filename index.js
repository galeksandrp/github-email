var request = require('request');
var async = require('async');

GithubEmail(process.argv[2]);

function GithubEmail(user) {
  async.parallel([
    function(callback) {
      request({
        url: "https://api.github.com/users/" + user,
        json: true,
        headers: {
          'User-Agent': 'request'
        }
      }, callback);
    },
    function(callback) {
      request({
        url: "https://registry.npmjs.org/-/user/org.couchdb.user:" + user,
        json: true,
        headers: {
          'User-Agent': 'request'
        }
      }, callback);
    },
    function(callback) {
      request({
        url: "https://api.github.com/users/" + user + "/events",
        json: true,
        headers: {
          'User-Agent': 'request'
        }
      }, callback);
    },
    function(callback) {
      request({
        url: "https://api.github.com/users/" + user + "/repos?type=owner&sort=updated",
        json: true,
        headers: {
          'User-Agent': 'request'
        }
      }, function(error, response, body) {
        var repo = body.map(function(item) {
          return item.name;
        })[0];

        request({
          url: "https://api.github.com/repos/" + user + "/" + repo + "/commits",
          json: true,
          headers: {
            'User-Agent': 'request'
          }
        }, callback);
      });
    }
  ], function(err, results) {
    console.log({
      github: results[0][1].email,
      npm: results[1][1].email,
      activity: results[3][1].map(function(item) {
        return {
          name: item.commit.author.name,
          email: item.commit.author.email
        };
      })
    });
    var commitEmails = {};
    results[2][1].forEach(function(item) {
      if (item.payload.commits) item.payload.commits.forEach(function(commit) {
        commitEmails[commit.author.email] = 1;
      });
    });
    console.log(Object.keys(commitEmails));
  });

  // request({
  // 	url: "https://api.github.com/users/"+user,
  // 	json: true,
  // 	headers: {
  // 		'User-Agent': 'request'
  // 	}
  // }, function(error, response, body) {
  // 	emails.github = body.email;
  // });

  // request({
  // 	url: "https://registry.npmjs.org/-/user/org.couchdb.user:"+user,
  // 	json: true,
  // 	headers: {
  // 		'User-Agent': 'request'
  // 	}
  // }, function(error, response, body) {
  // 	console.log(body.email);
  // })

  // request({
  // 	url: "https://api.github.com/users/" + user + "/events",
  // 	json: true,
  // 	headers: {
  // 		'User-Agent': 'request'
  // 	}
  // }, function(error, response, body) {
  // 	console.log(body.filter(function(item) {
  // 		return item.payload.commits
  // 	}).map(function(item) {
  // 		return item.payload.commits.map(function(item) {
  // 			return item.author.email;
  // 		});
  // 	}));
  // });

  // request({
  // 	url: "https://api.github.com/users/" + user + "/repos?type=owner&sort=updated",
  // 	json: true,
  // 	headers: {
  // 		'User-Agent': 'request'
  // 	}
  // }, function(error, response, body) {
  // 	var repo = body.map(function(item) {
  // 		return item.name;
  // 	})[0];
  // });

  // 	request({
  // 		url: "https://api.github.com/repos/" + user + "/" + repo + "/commits",
  // 		json: true,
  // 		headers: {
  // 			'User-Agent': 'request'
  // 		}
  // 	}, function(error, response, body) {
  // 		console.log(body.map(function(item) {
  // 			return {
  // 				name: item.commit.author.name,
  // 				email: item.commit.author.email
  // 			};
  // 		}));
  // 	});
  // });
}
