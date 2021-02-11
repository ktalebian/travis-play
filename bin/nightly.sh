#!/bin/bash

# Publishes a nightly build of plugin-builder

set -e

if [ "$TRAVIS_EVENT_TYPE" != "cron" ] ; then
  echo "Nightly builds can only be invoked via Travis CRON jobs"
  exit 1
fi

lerna="./node_modules/.bin/lerna"

function getJsonValue() {
  KEY=$1
  num=$2
  awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/'$KEY'\042/){print $(i+1)}}}' | tr -d '"' | sed -n ${num}p
}

currentVersion=$(cat ./lerna.json | getJsonValue 'version' |  cut -f1 -d"-")
semver=( ${currentVersion//./ } )
major="${semver[0]}"
minor="${semver[1]}"
patch="${semver[2]}"
id=`echo $(date '+%Y%m%d')`
rand=$(echo $((1 + SRANDOM % 10)))
nightlyVersion="${major}.${minor}.${patch}-nightly.${id}${rand}"

# Re-build package
npm run build

# Publish nightly build
${lerna} publish \
    --force-publish="*" \
    --skip-git \
    --no-git-tag-version \
    --no-push \
    --yes \
    --pre-dist-tag nightly \
    "${nightlyVersion}"
