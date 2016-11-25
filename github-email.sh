#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Name    : github-email
# Purpose : Retrieve a GitHub user's email even though it's not public
#
#
# Based on: https://gist.github.com/sindresorhus/4512621
# Revised here: https://gist.github.com/cryptostrophe/11234026
# Now maintained in this repo.
# -----------------------------------------------------------------------------

if [[ $# -eq 0 ]]; then
    printf "Usage: %s username [repository]\n" "$(basename "$0")" >&2
    exit 1
fi

log() {
    faded='\033[1;30m'
    clear='\033[0m'
    printf "\n%b$1%b\n" "$faded" "$clear"
}


user="$1"
repo="$2"


log 'Email on GitHub'
curl "https://api.github.com/users/$user" -s \
    | jq -r '.email'


log 'Email on npm'
if hash jq 2>/dev/null; then
    curl "https://registry.npmjs.org/-/user/org.couchdb.user:$user" -s | jq -r '.email'
else
    echo " … skipping …. Please: brew install jq"
fi


log 'Emails from recent commits'
curl "https://api.github.com/users/$user/events" -s \
    | jq -r '.[].payload.commits[]?.author.email' \
    | sort -u


log 'Emails from owned-repo recent activity'
if [[ -z $repo ]]; then
    # get all owned repos
    repo="$(curl "https://api.github.com/users/$user/repos?type=owner&sort=updated" -s \
        | jq -r '.[].name' \
        | head -n1)"
fi

curl "https://api.github.com/repos/$user/$repo/commits" -s \
    | jq -r '.[].commit.author|.name,.email'  \
    | pr -2 -at \
    | sort -u
